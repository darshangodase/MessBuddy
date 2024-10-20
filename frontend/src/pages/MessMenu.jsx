import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { HashLoader } from "react-spinners";
import { Card, Table } from "flowbite-react"; 
import axios from "axios";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa"; 
import { useSelector } from "react-redux"; 

const MessMenu = () => {
  const { messId } = useParams();
  const [messDetails, setMessDetails] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(""); 
  const [rating, setRating] = useState(0); 

  const currentUser = useSelector((state) => state.user.currentUser);

  const fetchMenuItems = async (ownerId, query) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/menu/search/${ownerId}`,
        {
          params: { query },
        }
      );
      setMenuItems(res.data.menus);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch menu items:", error);
      setLoading(false);
    }
  };

  const fetchRating = async (id) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/mess/rating/${id}`
      );
      setRating(res.data.rating);
    } catch (error) {
      console.error("Failed to fetch rating:", error);
    }
  };

  const updateRating = async (newRating) => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/mess/rating/${messId}/${
          currentUser._id
        }`,
        { rating: newRating }
      );
      setRating(res.data.rating);
      setMessDetails((prevDetails) => ({
        ...prevDetails,
        RatedBy: [...prevDetails.RatedBy, currentUser._id],
      }));
    } catch (error) {
      console.error("Failed to update rating:", error);
    }
  };

  useEffect(() => {
    const fetchMessDetails = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/mess/read/${messId}`
        );
        setMessDetails(res.data.mess);
        await fetchMenuItems(res.data.mess.Owner_ID, ""); 
        await fetchRating(messId); 
      } catch (error) {
        console.error("Failed to fetch mess details:", error);
        setLoading(false);
      }
    };

    fetchMessDetails();
  }, [messId]);

  useEffect(() => {
    if (messDetails) {
      fetchMenuItems(messDetails.Owner_ID, searchQuery); 
    }
  }, [searchQuery, messDetails]);

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
      <div className="flex items-center space-x-1">
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={i} className="text-yellow-500" onClick={() => handleStarClick(i)} />
        ))}
        {halfStar && <FaStarHalfAlt className="text-yellow-500" onClick={() => handleStarClick(fullStars)} />}
        {[...Array(emptyStars)].map((_, i) => (
          <FaRegStar key={i} className="text-yellow-500" onClick={() => handleStarClick(fullStars + (halfStar ? 1 : 0) + i)} />
        ))}
      </div>
    );
  };

  const handleStarClick = (index) => {
    if (
      currentUser !== null &&
      !messDetails.RatedBy.includes(currentUser._id)
    ) {
      updateRating(index + 1);
    }
  };

  if (loading) {
    return (
      <div className="h-[80vh] w-full flex justify-center items-center">
        <HashLoader color="#35c9e1" />
      </div>
    );
  }

  // Filter available menu items
  const availableMenuItems = menuItems.filter(
    (item) => item.Availability === "Yes"
  );

  return (
    <div className="p-8 min-h-screen w-full flex flex-col justify-center">
      <Card className=" md:w-3/4 shadow-lg transition-transform transform hover:scale-105 hover:shadow-2xl mb-5 duration-300 ease-in-out mx-auto">
        <h1 className="text-4xl font-bold mb-3 text-center">
          {messDetails.Mess_Name}
        </h1>
        <p className="text-lg">Address : {messDetails.Address}</p>
        <p className="text-lg">About : {messDetails.Description}</p>
        <p className="text-lg">Capacity : {messDetails.Capacity}</p>
        <div className="flex items-center space-x-2">
          <p className="text-lg mr-2">Rating :</p>
          <div className="flex items-center mt-2 cursor-pointer">
            {renderStars(rating)}
          </div>
        </div>
      </Card>

      <div className="mb-4 flex justify-end">
        <input
          type="text"
          placeholder="Search menu items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="p-2 border border-gray-300 rounded w-full md:w-1/4"
        />
      </div>

      <h2 className="text-2xl font-semibold mb-4">Today's Menu</h2>
      <Table className="w-full text-center">
        <thead className="bg-indigo-600 text-white">
          <tr>
            <th className="px-4 py-2">Menu Item</th>
            <th className="px-4 py-2">Price</th>
            <th className="px-4 py-2">Availability</th>
            <th className="px-4 py-2">Food Type</th>
          </tr>
        </thead>
        <tbody>
          {availableMenuItems.map((item) => (
            <tr
              key={item._id}
              className="hover:bg-indigo-200 hover:text-black transition-colors"
            >
              <td className="px-4 py-2 font-bold">{item.Menu_Name}</td>
              <td className="px-4 py-2">{item.Price}</td>
              <td className="px-4 py-2">{item.Availability}</td>
              <td className="px-4 py-2">{item.Food_Type}</td>
            </tr>
          ))}
          {availableMenuItems.length === 0 && (
            <tr>
              <td colSpan="4" className="py-2 text-gray-500">
                No available menu items found.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default MessMenu;