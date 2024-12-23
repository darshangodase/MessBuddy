import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { PropagateLoader } from "react-spinners";

export default function Feedback() {
  const { currentUser } = useSelector((state) => state.user);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch all feedbacks
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

  // Handle feedback submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rating || !comment) {
      alert("Please provide a rating and comment.");
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
      setIsModalOpen(false); // Close the modal after submission
      alert("Feedback submitted successfully!");
      fetchFeedbacks();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Failed to submit feedback.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  // Render stars for feedback rating
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
      <div className="flex justify-center items-center h-screen">
        <PropagateLoader color="#35c9e1" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-800 flex flex-col items-center p-6 ">
      <h2 className="text-black dark:text-white font-serif text-3xl font-semibold text-center mt-10">
        What Our Users Say
      </h2>
      <p className="text-black dark:text-white text-lg mt-2 font-serif mb-6">
        See what our users are saying about their experience with MessBuddy!
      </p>

      {/* Feedback List */}
      <div className="flex justify-center overflow-x-auto space-x-8 w-full scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800 p-4">
        {feedbacks.length > 0 ? (
          feedbacks.map((feedback) => (
            <div
              key={feedback._id}
              className="bg-white dark:bg-gray-900 border dark:border-gray-700 shadow-md rounded-lg p-4 w-72 flex-shrink-0"
            >
              <div className="mb-2">{renderStars(feedback.rating)}</div>
              <p className="text-gray-700 dark:text-gray-300 mb-4 text-justify">
                {feedback.comments}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                - {feedback.userID?.username || "Anonymous"}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No feedbacks available.</p>
        )}
      </div>

      {/* Floating Button */}
      {currentUser && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-600 transition duration-300 z-10"
        >
          Give Feedback
        </button>
      )}

      {/* Feedback Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 ">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-md m-6">
            <h3 className="text-xl font-semibold mb-4">Add Your Feedback</h3>

            <form onSubmit={handleSubmit}>
              <label className="block mb-2 text-gray-600 dark:text-gray-300">
                Rating:
              </label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full p-2 mb-4 border rounded-lg focus:ring focus:ring-blue-300 dark:bg-gray-800 dark:text-white dark:border-gray-600"
              >
                <option value="">Select Rating</option>
                {[1, 2, 3, 4, 5].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>

              <label className="block mb-2 text-gray-600 dark:text-gray-300">
                Comment:
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-2 mb-4 border rounded-lg focus:ring focus:ring-blue-300 dark:bg-gray-800 dark:text-white dark:border-gray-600 resize-none"
                placeholder="Write your feedback..."
                rows={4}
              ></textarea>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 focus:ring focus:ring-gray-300 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring focus:ring-blue-300 transition duration-200"
                >
                  Submit Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
