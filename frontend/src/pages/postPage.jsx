import { Button } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import CommentSection from '../components/commentsection';
import PostCard from '../components/PostCard';
import{ HashLoader} from 'react-spinners';


export default function PostPage() {
  const { postSlug } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [post, setPost] = useState(null);
  const [recentPosts, setRecentPosts] = useState(null);
  const [userPosts, setUserPosts] = useState(null);
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    if (post && post.userId) {
      const getUser = async () => {
        try {
          const res = await fetch(`http://localhost:3000/api/user/${post.userId}`);
          const data = await res.json();
          if (res.ok) {
            setUser(data);
          }
        } catch (error) {
          console.log(error.message);
        }
      };
      getUser();
    }
  }, [post]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:3000/api/post/getposts?slug=${postSlug}`);
        const data = await res.json();
        if (!res.ok) {
          setError(true);
          setLoading(false);
          return;
        }
        if (res.ok) {
          setPost(data.posts[0]);
          setLoading(false);
          setError(false);
        }
      } catch (error) {
        setError(true);
        setLoading(false);
      }
    };
    fetchPost();
  }, [postSlug]);

  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/post/getposts?limit=3`);
        const data = await res.json();
        if (res.ok) {
          setRecentPosts(data.posts);
        }
      } catch (error) {
        console.log(error.message);
      }
    };
    fetchRecentPosts();
  }, []);

  useEffect(() => {
    if (post && post.userId) {
      const fetchUserPosts = async () => {
        try {
          const res = await fetch(`http://localhost:3000/api/post/getposts?userId=${post.userId}&limit=3`);
          const data = await res.json();
          if (res.ok) {
            setUserPosts(data.posts);
          }
        } catch (error) {
          console.log(error.message);
        }
      };
      fetchUserPosts();
    }
  }, [post]);

  if (loading)
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <HashLoader color="#35c9e1" />
        </div>
    );

  return (
    <main className='px-10 flex flex-col lg:flex-row gap-2 mx-auto min-h-screen max-w-full overflow-x-hidden'>
      <div className='lg:w-3/5 w-full'>
        <h1 className='text-3xl mt-10 p-3 text-center font-serif max-w-5xl mx-auto lg:text-4xl'>
          {post && post.title}
        </h1>
        <div className='flex justify-center mt-5'>
          <Link to={`/search?category=${post && post.category}`}>
            <Button color='gray' pill size='sm' className='px-3'>
              {post && post.category}
            </Button>
          </Link>
        </div>
        <img
          src={post && post.image}
          alt={post && post.title}
          className='mt-10 p-3 max-h-[600px] w-full object-cover'
        />
        <div className='flex justify-between p-3 border-b border-slate-500 mx-auto w-full max-w-2xl text-sm font-semibold'>
          <div className="">
            <span className='mx-2 '>By <span className=" text-red-500">@{user && user.username}</span> |</span>
            <span>{post && new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
          <span className='italic'>
            {post && (post.content.length / 1000).toFixed(0)} mins to read
          </span>
        </div>
        <div
          className='p-3 max-w-2xl mx-auto w-full post-content'
          dangerouslySetInnerHTML={{ __html: post && post.content }}
        >
        </div>
        
        {post && <CommentSection postId={post._id} />}
      </div>

      <div className='lg:w-2/5  lg:p-10 w-full lg:pl-3 mt-10 lg:mt-[20vh]'>

        <div className='mb-5 flex flex-col items-center p-2'>
          <h2 className='text-3xl font-semibold mb-8 font-serif'>Recent Blogs</h2>
          {recentPosts &&
            recentPosts.map((post) => (
              <PostCard key={post._id} post={post}/>
            ))}
        </div>

        <div className=' flex flex-col items-center p-2'>
          <h2 className='text-3xl text-center font-semibold mb-7 mt-10 font-serif '>More from the Author</h2>

          {userPosts &&
            userPosts.map((post) => (
              <PostCard key={post._id} post={post}/>
            ))}
        </div>
      </div>
    </main>
  );
}