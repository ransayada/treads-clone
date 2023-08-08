import { fetchPosts } from "@/lib/actions/thread.action";
import { UserButton } from "@clerk/nextjs";

export default async function Home() {
  const result = await fetchPosts(1, 30);

  console.log(result);
  return (
    <div>
      <h1 className="head-text text-left">Home</h1>
    </div>
  );
}
