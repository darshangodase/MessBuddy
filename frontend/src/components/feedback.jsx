import React, { useEffect, useState,useRef } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { PropagateLoader } from "react-spinners";
import toast from "react-hot-toast";
// import { FaGreaterThan, FaLessThan } from "react-icons/fa";

export default function Feedback() {
  const { currentUser } = useSelector((state) => state.user);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userRoles, setUserRoles] = useState({});
  const containerRef = useRef(null);


  useEffect(() => {
    const container = containerRef.current;

    if (container) {
      const cardWidth = 288; // Card width (sm:w-72) in pixels
      const gap = 24; // Gap between cards (gap-6)
      const totalWidth = (cardWidth + gap) * feedbacks.length;

      // Dynamically set animation duration based on total width
      container.style.animationDuration = `${totalWidth / 100}s`;
    }
  }, [feedbacks]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/feedback`
      );
      setFeedbacks(response.data.feedbacks);
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRole = async (userId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/getuser/${userId}`
      );
      return response.data.role;
      
    } catch (error) {
      console.error(`Error fetching role for user:`, error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rating || !comment) {
      toast.error("Please provide a rating and comment.");
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/feedback`, {
        userID: currentUser._id,
        comments: comment,
        rating,
      });
      setComment("");
      setRating(0);
      setIsModalOpen(false);
      toast.success("Feedback submitted successfully!");
      fetchFeedbacks();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchRoles = async () => {
      const roles = {};
      
      for (const feedback of feedbacks) {
        
        if (feedback.userID?._id && !roles[feedback.userID._id]) {

          const role = await fetchUserRole(feedback.userID._id);
          roles[feedback.userID._id] = role;
        }
      }
      setUserRoles(roles);
    };

    fetchRoles();
  }, [feedbacks]);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <span
        key={index}
        className={`text-lg ${
          index < rating ? "text-yellow-500" : "text-gray-300"
        }`}
      >
        ★
      </span>
    ));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center">
        <PropagateLoader color="#35c9e1" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800 flex flex-col items-center justify-center p-6">
      <h2 className="text-black dark:text-white font-serif text-3xl font-semibold text-center ">
        What Our Users Say
      </h2>
      <p className="text-black dark:text-gray-300 text-lg mt-2 font-serif mb-10 text-center">
        See what our users are saying about their experience with MessBuddy!
      </p>


      {/* Wrapper for centering the feedback carousel */}
      <div className="w-full flex justify-center">
      <div className="relative flex items-center w-full max-w-screen-xl overflow-hidden">
        {/* Looping animation */}
        <div className="flex gap-6 animate-scroll">
          {/* Clone feedbacks to make an infinite loop */}
          {[...feedbacks].map((feedback, index) => (
            <div
              key={`${feedback._id || index}`}
              className="bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-lg p-4 sm:w-72 w-64 flex-shrink-0 mx-2 transform transition duration-300 hover:scale-102 hover:shadow-lg"
            >
              {/* Star Rating */}
              <div className="flex justify-center items-center mb-4">
                {renderStars(feedback.rating)}
              </div>

              {/* Feedback Text */}
              <p className="text-gray-700 dark:text-white mb-4 text-justify">
                {feedback.comments}
              </p>

              {/* Feedbacker Information */}
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-black dark:text-gray-400 font-semibold">
                  - {feedback.userID?.username || "Anonymous"}{" "}
                  {userRoles[feedback.userID?._id]
                    ? `(${userRoles[feedback.userID._id]})`
                    : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

      {/* Floating Button */}
      {currentUser && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-4 left-6 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lgbg-blue-600 animate-bounce transition duration-300 z-10"
        >
          Give Feedback
        </button>
      )}


      {/* Feedback Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-2xl w-full max-w-md m-4 relative">
            {/* Close Icon */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-white focus:outline-none text-xl font-bold"
            >
              ✕
            </button>

            {/* Title */}
            <h3 className="text-2xl font-bold mb-4 text-center text-gray-800 dark:text-gray-200">
              Share Your Feedback
            </h3>

            <form onSubmit={handleSubmit} className="">
              {/* Star Rating */}
              <div className="text-center mb-4">
                <p className="text-gray-600 dark:text-gray-300 mb-2 text-lg">
                  How would you rate us?
                </p>
                <div className="flex justify-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`cursor-pointer text-3xl ${
                        star <= rating ? "text-yellow-500" : "text-gray-300"
                      }`}
                      onClick={() => setRating(star)}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              {/* Comment Input */}
              <div className="mb-4">
                <label className="block mb-2 text-gray-600 dark:text-gray-300 text-lg">
                  Your Feedback
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring focus:ring-blue-300 dark:bg-gray-800 dark:text-white dark:border-gray-600 resize-none"
                  placeholder="Write your feedback..."
                  rows={4}
                ></textarea>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring focus:ring-blue-300 text-lg font-medium transition duration-200"
              >
                Submit Feedback
              </button>
            </form>
          </div>
        </div>
      )}


    </div>
  );
}
