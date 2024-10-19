import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import PostCard from "../components/PostCard";
import { Button } from "flowbite-react";
import { HashLoader } from "react-spinners";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const fetchPosts = async () => {
  //     const res = await fetch(`http://localhost:3000/api/post/getposts`);
  //     const data = await res.json();
  //     setPosts(data.posts);
  //     setLoading(false);
  //   };
  //   fetchPosts();
  // }, []);

  return (
    <div>
      <section className="flex flex-col justify-center items-center  text-center px-4 py-8">
        <h1 className=" mt-9 font-serif text-4xl font-semibold mb-4 lg:text-5xl hover:text-teal-400">
          Seamless Meals, Smarter Choices
        </h1>
        <p className="text-md mb-6 max-w-4xl ">
          Discover menus, insights, and updates that make your mess and canteen
          management easier and more efficient. From daily menu updates to
          detailed feedback systems and real-time capacity checks, MessBuddy is
          the ultimate platform for students, managers, and food enthusiasts
          alike. Whether you're just looking to see what's on the menu or diving
          into discussions on meal improvements, you'll find everything you need
          here to enhance your dining experience. MessBuddy is designed to keep
          you informed, engaged, and connected with your dining community.{" "}
        </p>
        <Link to="/search">
          <Button
            type="submit"
            gradientDuoTone="purpleToPink"
            className="mt-4 mb-3"
            outline
          >
            View All Mess Menus g
          </Button>
        </Link>
      </section>

      <div className="w-full p-3 flex flex-col items-center gap-3 py-7">
        {posts && posts.length > 0 ? (
          <div className="flex flex-col gap-6 items-center">
            <h2 className=" font-serif text-3xl font-semibold text-center">
              Recent Posts
            </h2>
            <div className="flex flex-wrap justify-center gap-14">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
            <Link to="/search">
              <Button
                type="submit"
                gradientDuoTone="purpleToPink"
                className="mt-4 mb-3"
                outline
              >
                View all Blogs
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex justify-center  min-h-screen">
            {/* <Spinner size='xl' /> */}
            <HashLoader color="#35c9e1" />
          </div>
        )}
      </div>
    </div>
  );
}
