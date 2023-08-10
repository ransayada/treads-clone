import UserCard from "@/components/cards/UserCard";
import { fetchUser, fetchUsers } from "@/lib/actions/user.action";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

const Page = async () => {
  const user = await currentUser();
  if (!user) return null;
  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("onboarding");

  //Fetch Users
  const results = await fetchUsers({
    userId: user.id,
    searchString: "",
    pageSize: 25,
    pageNumber: 1,
  });
  return (
    <section>
      <h1 className="head-text mb-10">Search</h1>
      {/**search bar */}
      <div className="mt-14 flex flex-col gap-9">
        {results.users.length === 0 ? (
          <p className="no-result">No Users Found</p>
        ) : (
          <>
            {results.users.map((person) => (
              <UserCard
                key={person.id}
                id={person.id}
                name={person.name}
                username={person.username}
                imageUrl={person.image}
                personType="User"
              />
            ))}
          </>
        )}
      </div>
    </section>
  );
};

export default Page;
