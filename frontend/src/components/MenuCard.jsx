import React from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa'; // Import star icons
import imageofmess from '../assets/images/mesbud.jpeg';

const MenuCard = ({ menu }) => {
  
  // Function to render stars based on the rating value
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

  return (
    <div 
      className="max-w-sm rounded-lg overflow-hidden shadow-lg transform transition-transform hover:scale-105 hover:shadow-xl cursor-pointer hover:border hover:border-indigo-500" // Add border on hover
    >
      {/* Image section */}
      <img 
        src={imageofmess} 
        alt={menu.Mess_Name} 
        className="w-72 h-36 object-cover"
      />

      {/* Card content */}
      <div className="p-4 bg-white">
        <h3 className="text-2xl font-bold text-gray-800">{menu.Mess_Name}</h3>
        
        {/* Render the stars and show rating value */}
        <div className="flex items-center justify-between mt-2">
          {renderStars(menu.Ratings)}
          <span className="text-gray-700 text-sm">{menu.Ratings} / 5</span>
        </div>

        {/* Button for today's menu */}
        <button className="mt-4 w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-300">
          Show Today's Menu
        </button>
      </div>
    </div>
  );
};

export default MenuCard;
