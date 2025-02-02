import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Button, Card, TextInput, Textarea, Select, Modal } from 'flowbite-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaComment, FaThumbsUp, FaTrash } from 'react-icons/fa';

export default function Community() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'general',
    pollOptions: ['', '']
  });
  const [filters, setFilters] = useState({
    type: '',
    search: '',
    messId: ''
  });
  const [expandedComments, setExpandedComments] = useState(new Set());
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalPosts: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  const currentUser = useSelector(state => state.user.currentUser);

  const generatePaginationArray = () => {
    const delta = 2;
    const range = [];
    const { currentPage, totalPages } = pagination;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 || // First page
        i === totalPages || // Last page
        (i >= currentPage - delta && i <= currentPage + delta) // Pages around current
      ) {
        range.push(i);
      }
    }

    const finalRange = [];
    let prev = 0;

    for (const i of range) {
      if (prev + 1 !== i) {
        finalRange.push('...');
      }
      finalRange.push(i);
      prev = i;
    }

    return finalRange;
  };

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/forum/posts`, {
        params: {
          ...filters,
          page: pagination.currentPage,
          limit: 10
        }
      });
      setPosts(res.data.posts);
      setPagination(res.data.pagination);
    } catch (error) {
      toast.error('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const resetFormData = () => {
    setFormData({
      title: '',
      content: '',
      type: 'general',
      pollOptions: ['', '']
    });
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      if (!currentUser) {
        toast.error('Please login to create a post');
        return;
      }

      const postData = { ...formData };
      if (postData.type === 'poll') {
        postData.pollOptions = postData.pollOptions.filter(opt => opt.trim());
      } else {
        delete postData.pollOptions;
      }

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/forum/posts/create/${currentUser._id}`,
        postData
      );
      toast.success('Post created successfully');
      resetFormData();
      setShowCreateModal(false);
      fetchPosts();
    } catch (error) {
      toast.error('Failed to create post');
    }
  };

  const handleVote = async (postId, optionIndex) => {
    try {
      if (!currentUser) {
        toast.error('Please login to vote');
        return;
      }

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/forum/posts/${postId}/vote/${currentUser._id}`,
        { optionIndex }
      );
      fetchPosts();
    } catch (error) {
      toast.error('Failed to submit vote');
    }
  };

  const handleAddComment = async () => {
    if (!currentUser) {
      toast.error('Please login to comment');
      return;
    }

    if (!commentText.trim()) {
      toast.error('Please enter a comment');
      return;
    }
    
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/forum/posts/${selectedPost._id}/comment/${currentUser._id}`,
        { content: commentText }
      );
      toast.success('Comment added successfully');
      setCommentText('');
      setShowCommentModal(false);
      fetchPosts();
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const handleLikePost = async (postId) => {
    try {
      if (!currentUser) {
        toast.error('Please login to like posts');
        return;
      }

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/forum/posts/${postId}/like/${currentUser._id}`
      );
      fetchPosts();
    } catch (error) {
      toast.error('Failed to like post');
    }
  };

  const handleLikeComment = async (postId, commentId) => {
    try {
      if (!currentUser) {
        toast.error('Please login to like comments');
        return;
      }

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/forum/posts/${postId}/comments/${commentId}/like/${currentUser._id}`
      );
      fetchPosts();
    } catch (error) {
      toast.error('Failed to like comment');
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      if (!currentUser) {
        toast.error('Please login to delete comments');
        return;
      }

      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/forum/posts/${postId}/comments/${commentId}/${currentUser._id}`
      );
      toast.success('Comment deleted successfully');
      fetchPosts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete comment');
      console.error('Delete comment error:', error);
    }
  };

  const addPollOption = () => {
    setFormData(prev => ({
      ...prev,
      pollOptions: [...prev.pollOptions, '']
    }));
  };

  const removePollOption = (index) => {
    setFormData(prev => ({
      ...prev,
      pollOptions: prev.pollOptions.filter((_, i) => i !== index)
    }));
  };

  const handleDeletePost = async (postId) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/forum/posts/${postId}/${currentUser._id}`
      );
      toast.success('Post deleted successfully');
      fetchPosts();
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  const handleEditPost = async (e, postId) => {
    e.preventDefault();
    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/forum/posts/${postId}/${currentUser._id}`,
        formData
      );
      toast.success('Post updated successfully');
      resetFormData();
      setShowCreateModal(false);
      fetchPosts();
    } catch (error) {
      toast.error('Failed to update post');
    }
  };

  const handleEditClick = (post) => {
    setFormData({
      title: post.title,
      content: post.content,
      type: post.type,
      pollOptions: post.pollOptions?.map(opt => opt.text) || ['', ''],
      isEditing: true,
      editingId: post._id
    });
    setShowCreateModal(true);
  };

  const toggleComments = (postId) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  useEffect(() => {
    fetchPosts();
  }, [filters, pagination.currentPage]);

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen font-rubik">
      <div className="flex justify-between items-center mb-8 gap-4">
        <h1 className="sm:text-3xl text-xl font-bold">MessBuddy Community</h1>
        {currentUser && (
          <Button onClick={() => setShowCreateModal(true)}>
            Create Post
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-8">
        <Select
          value={filters.type}
          onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
        >
          <option value="">All Types</option>
          <option value="general">General</option>
          <option value="question">Questions</option>
          <option value="announcement">Announcements</option>
          <option value="poll">Polls</option>
        </Select>
        <TextInput
          placeholder="Search posts..."
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
        />
      </div>

      {/* Posts List */}
      <div className="space-y-6">
        {posts.map(post => (
          <Card key={post._id} className="overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold">{post.title}</h3>
                <span className="text-sm text-gray-500">
                  {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {post.messId && (
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    {post.messId.Mess_Name}
                  </span>
                )}
                {currentUser && post.author._id === currentUser._id && (
                  <div className="flex gap-2">
                    <Button size="xs" onClick={() => handleEditClick(post)}>
                      Edit
                    </Button>
                    <Button 
                      size="xs" 
                      color="failure"
                      onClick={() => handleDeletePost(post._id)}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <p className="text-gray-600 mt-2">{post.content}</p>
            
            {/* Poll Section */}
            {post.type === 'poll' && post.isPollActive && (
              <div className="mt-4 space-y-2">
                {post.pollOptions.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Button
                      onClick={() => handleVote(post._id, index)}
                      color="light"
                      className="w-full text-left"
                    >
                      <span>{option.text}</span>
                      <span className="ml-2 text-sm text-gray-500">
                        ({option.votes.length} votes)
                      </span>
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-4">
              <button
                onClick={() => handleLikePost(post._id)}
                className={`flex items-center gap-1 hover:text-blue-500 px-2 py-1 rounded-md ${
                  currentUser && post.likes.includes(currentUser._id)
                    ? 'bg-blue-100 text-blue-500'
                    : 'text-gray-500'
                }`}
              >
                <FaThumbsUp />
                <span>{post.likes.length}</span>
              </button>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => toggleComments(post._id)}
                  className="flex items-center gap-1 text-gray-500 hover:text-blue-500"
                >
                  <FaComment />
                  <span>{post.comments.length}</span>
                </button>
                {post.comments.length > 0 && (
                  <button
                    onClick={() => toggleComments(post._id)}
                    className="text-sm text-blue-500 hover:underline whitespace-nowrap"
                  >
                    {expandedComments.has(post._id) ? 'Hide Comments' : 'Show Comments'}
                  </button>
                )}
                <button
                  onClick={() => {
                    if (!currentUser) {
                      toast.error('Please login to comment');
                      return;
                    }
                    setSelectedPost(post);
                    setShowCommentModal(true);
                  }}
                  className="text-sm text-blue-500 hover:underline sm:ml-2 whitespace-nowrap"
                >
                  Add Comment
                </button>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-500 break-words">
              Posted by {post.author.username} • {new Date(post.createdAt).toLocaleDateString()}
            </div>

            {/* Comments Section */}
            {expandedComments.has(post._id) && post.comments.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="font-semibold">Comments</h4>
                {post.comments.map((comment, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                    <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-2">
                      <div>
                        <p className="text-sm break-words">{comment.content}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <span className="font-medium">{comment.userId.username}</span> • {new Date(comment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-start">
                        <button
                          onClick={() => handleLikeComment(post._id, comment._id)}
                          className={`flex items-center gap-1 hover:text-blue-500 px-2 py-1 rounded-md ${
                            currentUser && comment.likes.includes(currentUser._id)
                              ? 'bg-blue-100 text-blue-500'
                              : 'text-gray-500'
                          }`}
                        >
                          <FaThumbsUp className="text-sm" />
                          <span className="text-xs">{comment.likes.length}</span>
                        </button>
                        {currentUser && comment.userId === currentUser._id && (
                          <button
                            onClick={() => handleDeleteComment(post._id, comment._id)}
                            className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50"
                          >
                            <FaTrash className="text-sm" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <Button
            size="sm"
            disabled={!pagination.hasPrevPage}
            onClick={() => handlePageChange(pagination.currentPage - 1)}
          >
            Previous
          </Button>
          
          <div className="flex items-center gap-1">
            {generatePaginationArray().map((page, index) => (
              <div key={index}>
                {page === '...' ? (
                  <span className="px-3 py-2">...</span>
                ) : (
                  <Button
                    size="sm"
                    color={page === pagination.currentPage ? 'blue' : 'gray'}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button
            size="sm"
            disabled={!pagination.hasNextPage}
            onClick={() => handlePageChange(pagination.currentPage + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Create/Edit Post Modal */}
      <Modal 
        show={showCreateModal} 
        onClose={() => {
          setShowCreateModal(false);
          resetFormData();
        }}
        className="dark:bg-gray-800"
      >
        <Modal.Header className="dark:border-gray-700">
          <h3 className="dark:text-white">{formData.isEditing ? 'Edit Post' : 'Create Post'}</h3>
        </Modal.Header>
        <Modal.Body className="dark:bg-gray-800">
          <form 
            onSubmit={(e) => {
              if (formData.isEditing) {
                handleEditPost(e, formData.editingId);
              } else {
                handleCreatePost(e);
              }
            }} 
            className="space-y-4"
          >
            <div>
              <label className="block mb-2 dark:text-white">Title</label>
              <TextInput
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block mb-2 dark:text-white">Content</label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                required
                rows={4}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block mb-2 dark:text-white">Type</label>
              <Select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <option value="general">General Discussion</option>
                <option value="question">Question</option>
                <option value="announcement">Announcement</option>
                <option value="poll">Poll</option>
              </Select>
            </div>
            
            {formData.type === 'poll' && (
              <div className="space-y-2">
                <label className="block mb-2 dark:text-white">Poll Options</label>
                {formData.pollOptions.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <TextInput
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...formData.pollOptions];
                        newOptions[index] = e.target.value;
                        setFormData({...formData, pollOptions: newOptions});
                      }}
                      placeholder={`Option ${index + 1}`}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <Button
                      color="failure"
                      onClick={() => removePollOption(index)}
                      disabled={formData.pollOptions.length <= 2}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={addPollOption}
                  disabled={formData.pollOptions.length >= 5}
                >
                  Add Option
                </Button>
              </div>
            )}
            
            <div className="flex justify-end gap-2">
              <Button type="submit">
                {formData.isEditing ? 'Update Post' : 'Create Post'}
              </Button>
              <Button 
                color="gray" 
                onClick={() => {
                  setShowCreateModal(false);
                  resetFormData();
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* Comment Modal */}
      <Modal 
        show={showCommentModal} 
        onClose={() => setShowCommentModal(false)}
        className="dark:bg-gray-800"
      >
        <Modal.Header className="dark:border-gray-700">
          <h3 className="dark:text-white">Add Comment</h3>
        </Modal.Header>
        <Modal.Body className="dark:bg-gray-800">
          <Textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write your comment..."
            rows={4}
            className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={handleAddComment}>Post Comment</Button>
            <Button color="gray" onClick={() => setShowCommentModal(false)}>
              Cancel
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
} 