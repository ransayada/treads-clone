import * as z from 'zod'

export const ThreadValidation = z.object({
    thread: z.string().nonempty().min(3,{message: 'Minimum of 3 characters'}).max(1000,{message: 'Maximum of 1000 characters'}),
    accountId: z.string()

})
export const CommentValidation = z.object({
    thread: z.string().nonempty().min(3,{message: 'Minimum of 3 characters'}).max(1000,{message: 'Maximum of 1000 characters'})

})