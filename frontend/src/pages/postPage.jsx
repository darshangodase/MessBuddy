import { Button, Spinner, Card } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
// import CommentSection from '../components/CommentSection';
// import PostCard from '../components/PostCard';

export default function PostPage() {
  const { postSlug } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [post, setPost] = useState(null);
  const [recentPosts, setRecentPosts] = useState(null);
  const [userPosts, setUserPosts] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/post/getposts?slug=${postSlug}`);
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
        const res = await fetch(`/api/post/getposts?limit=3`);
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
          const res = await fetch(`/api/post/getposts?userId=${post.userId}&limit=3`);
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
        <Spinner size='xl' />
      </div>
    );

  return (
    <main className='p-3 flex  flex-col lg:flex-row  max-w-6xl  mx-auto min-h-screen'>
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
          <span>{post && new Date(post.createdAt).toLocaleDateString()}</span>
          <span className='italic'>
            {post && (post.content.length / 1000).toFixed(0)} mins to read
          </span>
        </div>
        <div
          className='p-3 max-w-2xl mx-auto w-full post-content'
          dangerouslySetInnerHTML={{ __html: post && post.content }}
        ></div>
      </div>

      <div className='lg:w-2/5 w-full lg:pl-5 mt-10 lg:mt-0'>
        <div className='mb-5'>
          <h2 className='text-xl font-semibold mb-3'>Related Posts</h2>
          {recentPosts &&
            recentPosts.map((post) => (
              <Card key={post._id} className='mb-5'>
                <img
                  src={post.image}
                  alt={post.title}
                  className='w-full h-48 object-cover rounded-t-lg'
                />
                <div className='p-5'>
                  <h3 className='text-lg font-semibold'>{post.title}</h3>
                  <p className='text-sm text-gray-500'>
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                  <Link to={`/post/${post.slug}`} className='mt-3 block'>
                    <Button color='blue' pill size='xs'>
                      Read More
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
        </div>

        <div>
          <h2 className='text-xl font-semibold mb-3'>More from this Author</h2>
          {userPosts &&
            userPosts.map((post) => (
              <Card key={post._id} className='mb-5'>
                <img
                  src={post.image}
                  alt={post.title}
                  className='w-full h-48 object-cover rounded-t-lg'
                />
                <div className='p-5'>
                  <h3 className='text-lg font-semibold'>{post.title}</h3>
                  <p className='text-sm text-gray-500'>
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                  <Link to={`/post/${post.slug}`} className='mt-3 block'>
                    <Button color='blue' pill size='xs'>
                      Read More
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
        </div>
      </div>
    </main>
  );
}