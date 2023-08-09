"use server"
import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose"

interface Params {
    text: string,
    author: string,
    communityId: string| null,
    path: string
}

export async function createThread({text,author,communityId,path}:Params){
    try{
    connectToDB();
    const createdThread =  await Thread.create({
        text,
        author,
        community: null,
    });

    //Update user model

    await User.findByIdAndUpdate(author,{
        $push: {threads : createdThread._id}
    })

    revalidatePath(path);
}catch(error:any){
    throw new Error(`Error creating thread: ${error}`);

}
}

export async function fetchPosts (pageNumber= 1, pageSize = 20){
    try{
    connectToDB();
    //coculate the number of posts to skip 
        const  skipAmount = (pageNumber-1)* pageSize;

    //fetch all threads without parents (top level thread)
    const postsQuery = Thread.find({
        parentId: {$in: [null, undefined]}
    }).sort({createdAt: 'desc'}).skip(skipAmount).limit(pageSize).populate({
        path:'author', model: User
    }).populate({
        path: 'children' , populate: {
            path: 'author',
            model: User,
            select: "_id name parentId image"
        }
    })

    const totalPostsCount = await Thread.countDocuments({
        parentId: {$in: [null, undefined]}
    })

    const posts = await postsQuery.exec()

    const isNext = totalPostsCount > skipAmount + posts.length;

    return {posts, isNext}
    }catch(error:any){
        throw new Error(`Error while fetching thread posts: ${error}`)
    }
}

export async function fetchThreadById(threadId: string){
    try{
        connectToDB();
        //TODO: Populate Community Thread
        const thread = await Thread.findById(threadId).populate({
            path: 'author',
            model: User,
            select: "_id id name image"
        }).populate({
            path: 'children',
            populate: [{
                path: 'author',
                model: User,
                select:"_id name parentId image"
            },{
                path:'children',
                model: Thread,
                populate:{
                    path: 'author',
                    model: User,
                    select: "_id id name parentId image"
                }
                
            }]
        }).exec();
        return thread;
    }
    catch(error: any){
        throw new Error(`Error while fetching thread: ${threadId} with error: ${error}`)
    }
}

export async function addCommentToThread(threadId: string, commentText: string, userId: string, path: string){
try{
    connectToDB();
    //find parent thread by its id
    const originalThread = await Thread.findById(threadId);
    if(!originalThread){
        throw new Error("The Thread you are trying to reply to doesn't exist.")
    }
    //create new tread with the comment text
    const commentThread = new Thread({
        text: commentText,
        author: userId,
        parentId: threadId
    })

   //saving the new comment thread to db
   const savedCommentThread = await commentThread.save();

   //update the original thread to include the new comment 

   originalThread.children.push(savedCommentThread._id)

   //save the original thread after updating

   await originalThread.save();

   revalidatePath(path);
    
}
catch(error){
    throw new Error(`Error while commenting on a thread: ${threadId} with error: ${error}`)
}
}