import { Models } from "appwrite";
import { Loader, PostCard, UserCard } from "@/components/shared";
import { useGetRecentPosts, useGetUsers } from "@/lib/react-query/queries";

const Home = () => {
  const {
    data: postsData,
    isLoading: isPostLoading,
    isError: isErrorPosts,
  } = useGetRecentPosts();

  const {
    data: creatorsData,
    isLoading: isUserLoading,
    isError: isErrorCreators,
  } = useGetUsers(10);

  // Ensure posts are always an array (fix undefined issue)
  const posts: Models.Document[] = postsData || [];
  const creators: Models.Document[] = creatorsData || [];

  if (isErrorPosts || isErrorCreators) {
    return (
      <div className="flex flex-1">
        <div className="home-container">
          <p className="body-medium text-light-1">Something went wrong. Please try again.</p>
        </div>
        <div className="home-creators">
          <p className="body-medium text-light-1">Something went wrong. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1">
      {/* Home Feed */}
      <div className="home-container">
        <div className="home-posts">
          <h2 className="h3-bold md:h2-bold text-left w-full">Home Feed</h2>
          
          {isPostLoading ? (
            <Loader />
          ) : posts.length === 0 ? (
            <p className="text-light-3 mt-4">No posts available.</p>
          ) : (
            <ul className="flex flex-col flex-1 gap-9 w-full">
              {posts.map((post) => (
                <li key={post.$id} className="flex justify-center w-full">
                  <PostCard post={post} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Top Creators */}
      <div className="home-creators">
        <h3 className="h3-bold text-light-1">Top Creators</h3>
        
        {isUserLoading ? (
          <Loader />
        ) : creators.length === 0 ? (
          <p className="text-light-3 mt-4">No creators found.</p>
        ) : (
          <ul className="grid 2xl:grid-cols-2 gap-6">
            {creators.map((creator) => (
              <li key={creator.$id}>
                <UserCard user={creator} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Home;
