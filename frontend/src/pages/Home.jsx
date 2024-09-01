import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import PostCard from '../components/PostCard';
import { Button, Spinner } from 'flowbite-react';
import{ HashLoader} from 'react-spinners';


export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      const res = await fetch('/api/post/getPosts');
      const data = await res.json();
      setPosts(data.posts);
      setLoading(false);
    };
    fetchPosts();
  }, []);
 
  return (
    <div>
      <section className="flex flex-col justify-center items-center  text-center px-4 py-8">
      <h1 className=" mt-9 font-serif text-4xl font-semibold mb-4 lg:text-6xl hover:text-teal-400">Blog with the Best.</h1>
      <p className="text-lg mb-6 max-w-4xl ">
      Discover insights, guides, and experiences that inspire creativity and innovation. From coding tips to deep dives into software development, my blog is a space for developers, designers, and tech enthusiasts alike. Whether you're a beginner or an expert, you'll find valuable resources to fuel your passion for technology.
      </p>
      <Link
        to="/search"
        
      >
        <Button type="submit" gradientDuoTone="purpleToPink" className="mt-4 mb-3" outline>
            View all Blogs 
        </Button>
      </Link>
    </section>

      <div className='w-full p-3 flex flex-col items-center gap-3 py-7'>
        {posts && posts.length > 0 ? (
          <div className='flex flex-col gap-6 items-center'>
            <h2 className=' font-serif text-3xl font-semibold text-center'>Recent Posts</h2>
            <div className='flex flex-wrap justify-center gap-14'>
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
            <Link to="/search">
              <Button type="submit" gradientDuoTone="purpleToPink" className="mt-4 mb-3" outline>
                 View all Blogs 
               </Button>
             </Link>
          </div>
        ):
        <div className='flex justify-center items-center min-h-screen'>
        {/* <Spinner size='xl' /> */}
        <HashLoader color="#35c9e1" />
         </div>
      }
      </div>
    </div>
  );
}