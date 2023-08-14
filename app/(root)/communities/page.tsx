import CommunityCard from "@/components/cards/CommunityCard";
import UserCard from "@/components/cards/UserCard";
import { fetchCommunities } from "@/lib/actions/community.action";
import { fetchUser, fetchUsers } from "@/lib/actions/user.action";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

const Page = async () => {
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("onboarding");

  //Fetch Communities
  const results = await fetchCommunities({
    searchString: "",
    pageSize: 25,
    pageNumber: 1,
  });
  return (
    <section>
      <h1 className="head-text mb-10">Communities</h1>
      {/**search bar */}
      <div className="mt-14 flex flex-col gap-9">
        {results.communities.length === 0 ? (
          <p className="no-result">No Communities Found</p>
        ) : (
          <>
            {results.communities.map((community) => (
              <CommunityCard
                key={community.id}
                id={community.id}
                name={community.name}
                username={community.username}
                imgUrl={community.image}
                bio={community.bio}
                members={community.members}
              />
            ))}
          </>
        )}
      </div>
    </section>
  );
};

export default Page;
