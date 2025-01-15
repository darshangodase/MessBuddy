import React, { useEffect, useState } from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios';

const MenuCard = ({ menu }) => {
  const navigate = useNavigate(); 
  const [rating, setRating] = useState(0); // State to store the rating
  
  useEffect(() => {
    const fetchRating = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/mess/rating/${menu._id}`);
        setRating(res.data.rating);
      } catch (error) {
        console.error("Failed to fetch rating:", error);
      }
    };

    fetchRating();
  }, [menu._id]);

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={i} className="text-yellow-500" />
        ))}
        {halfStar && <FaStarHalfAlt className="text-yellow-500" />}
        {[...Array(emptyStars)].map((_, i) => (
          <FaRegStar key={i} className="text-yellow-500" />
        ))}
      </div>
    );
  };
 
  const handleShowMenu = () => {
    navigate(`/mess/${menu._id}`); // Navigate to the MessMenu page
  };

  return (
    <div className="max-w-md rounded-lg overflow-hidden shadow-lg transform transition-transform hover:scale-105 hover:shadow-xl cursor-pointer">
      <img src={menu.Image} alt={menu.Mess_Name} className="w-72 h-36 object-cover" />
      <div className="p-4 bg-white dark:bg-slate-800">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{menu.Mess_Name}</h3>
        <div className="flex items-center justify-between mt-2">
          {renderStars(rating)}
          <span className="text-gray-700 dark:text-white text-sm">{rating.toFixed(1)} / 5</span>
        </div>
        <button
          className="mt-4 w-full py-2 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-300"
          onClick={handleShowMenu} // Handle button click
        >
          Show Today's Menu
        </button>
      </div>
    </div>
  );
};

export default MenuCard;