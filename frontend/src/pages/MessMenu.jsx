import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, Table, Modal, Button, Spinner } from "flowbite-react";
import axios from "axios";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { useNavigate } from 'react-router-dom';
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const MessMenu = () => {
  const { messId } = useParams();
  const [messDetails, setMessDetails] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [rating, setRating] = useState(0);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const { theme } = useSelector((state) => state.theme);
  const currentUser = useSelector((state) => state.user.currentUser);
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [hover, setHover] = useState(null);
  const [averageRating, setAverageRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [userRating, setUserRating] = useState(0);

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

  const handleSelectItem = (menuId) => {
    const existingItem = selectedItems.find((item) => item.menuId === menuId);
    if (existingItem) {
      return; // No need to add the item again if it is already selected
    }
    setSelectedItems([...selectedItems, { menuId, quantity: 1 }]);
  };

  const handleQuantityChange = (menuId, increment) => {
    setSelectedItems((prevItems) =>
      prevItems.map((item) =>
        item.menuId === menuId
          ? {
              ...item,
              quantity: Math.max(item.quantity + increment, 1), // Minimum quantity is 1
            }
          : item
      )
    );
  };

  const handleRemoveItem = (menuId) => {
    setSelectedItems((prevSelectedItems) =>
      prevSelectedItems.filter((item) => item.menuId !== menuId)
    );
  };

  const userId = currentUser?._id;
  const handlePrebook = async () => {
    if(!userId)
    {
      toast.error('You need to log in to your account to proceed with prebooking.');
    }
    if (selectedItems.length === 0) {
      toast.error("Please select at least one item to prebook.");
      return;
    }
    const total = selectedItems.reduce(
      (sum, item) =>
        sum +
        item.quantity *
          menuItems.find((menu) => menu._id === item.menuId)?.Price,
      0
    );

    setTotalAmount(total); // Store the total amount in the state
    setIsModalOpen(true); // Open the modal after setting the total amount
  };

  const handleConfirmPrebooking = async () => {
    const date = new Date().toISOString().split("T")[0]; 
    const time = new Date().toLocaleTimeString("en-GB", { timeZone: "Asia/Kolkata" }); 
    setSubmitting(true); 
    try {
      for (let item of selectedItems) {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/prebooking`, {
          menuId: item.menuId,
          messId: messId,
          userId: currentUser._id,
          date,
          quantity: item.quantity,
          time
        });
      }
      
      toast.success("Prebooking confirmed successfully!");
      setSelectedItems([]);
      setTotalAmount(0);
      setIsModalOpen(false); 
      navigate('/prebookings');
    } catch (error) {
      console.error("Error during prebooking:", error);
      toast.error("Failed to confirm prebooking.");
    }
    finally {
      setSubmitting(false); 
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
        fetchAverageRating();
        checkIfUserHasRated();
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

  const fetchAverageRating = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/mess/rating/${messId}`);
      setAverageRating(res.data.rating);
    } catch (error) {
      console.error("Failed to fetch rating:", error);
    }
  };

  const checkIfUserHasRated = async () => {
    if (!currentUser) return;
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/mess/hasrated/${messId}/${currentUser._id}`
      );
      setHasRated(res.data.hasRated);
      if (res.data.hasRated) {
        setUserRating(res.data.rating);
      }
    } catch (error) {
      console.error("Failed to check rating status:", error);
    }
  };

  const handleRating = async (ratingValue) => {
    if (!currentUser) {
      toast.error('Please login to rate this mess');
      return;
    }

    if (hasRated) {
      toast.error('You have already rated this mess');
      return;
    }

    try {
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/mess/rating/${messId}/${currentUser._id}`,
        { rating: ratingValue }
      );
      setHasRated(true);
      setUserRating(ratingValue);
      fetchAverageRating();
      toast.success('Rating submitted successfully');
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to submit rating');
      }
    }
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
      <div className="flex items-center space-x-1">
        {[...Array(fullStars)].map((_, i) => (
          <FaStar
            key={i}
            className="text-yellow-500"
            onClick={() => handleRating(i + 1)}
          />
        ))}
        {halfStar && (
          <FaStarHalfAlt
            className="text-yellow-500"
            onClick={() => handleRating(fullStars + 0.5)}
          />
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <FaRegStar
            key={i}
            className="text-yellow-500"
            onClick={() => handleRating(fullStars + (halfStar ? 0.5 : 0) + i)}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-8 min-h-screen w-full overflow-x-auto scrollbar-none flex flex-col justify-center font-rubik">
        {/* Skeleton for Card */}
        <Card
          className={`${
            theme === "dark"
              ? "bg-gray-800"
              : "bg-gradient-to-r from-green-100 via-blue-100 to-purple-100"
          } md:w-3/4 w-full shadow-lg transition-transform transform hover:scale-105 hover:shadow-2xl mb-5 duration-300 ease-in-out mx-auto`}
        >
          <h1 className="text-4xl font-bold mb-3 text-center font-poppins">
            <Skeleton width="80%" />
          </h1>
          <p className="text-lg"><Skeleton width="60%" /></p>
          <p className="text-lg"><Skeleton width="60%" /></p>
          <p className="text-lg"><Skeleton width="60%" /></p>
          
        </Card>
    
        {/* Skeleton for Search Input */}
        <div className="mb-4 flex justify-end">
          <Skeleton width="25%" height={40} />
        </div>
    
        {/* Skeleton for Table */}
        <p className="text-lg"><Skeleton width="40%" /></p>
        <Table className="w-full text-center">
          <thead className="bg-indigo-700 text-white ">
            <tr className="animate-pulse">
              <th className="px-4 py-2"><Skeleton width="80%" /></th>
              <th className="px-4 py-2"><Skeleton width="80%" /></th>
              <th className="px-4 py-2"><Skeleton width="80%" /></th>
              <th className="px-4 py-2"><Skeleton width="80%" /></th>
              <th className="px-4 py-2"><Skeleton width="80%" /></th>
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, index) => (
              <tr key={index} className="transition-colors">
                <td className="px-4 py-2">
                  <Skeleton width="80%" />
                </td>
                <td className="px-4 py-2">
                  <Skeleton width="50%" />
                </td>
                <td className="px-4 py-2">
                  <Skeleton width="60%" />
                </td>
                <td className="px-4 py-2">
                  <Skeleton width="30%" />
                </td>
                <td className="px-4 py-2">
                  <Skeleton width="40%" />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
    
        {/* Skeleton for Button */}
        <div className="flex justify-end mt-4">
          <Skeleton width="20%" height={40} />
        </div>
      </div>
    );
  }

  // Filter available menu items
  const availableMenuItems = menuItems.filter(
    (item) => item.Availability === "Yes"
  );

  return (
    <div className="p-8 min-h-screen w-full overflow-x-auto scrollbar-none flex flex-col justify-center font-rubik">
      <Card
        className={`${
          theme === "dark"
            ? "bg-gray-800"
            : "bg-gradient-to-r from-green-100 via-blue-100 to-purple-100"
        } md:w-3/4 shadow-lg transition-transform transform hover:scale-105 hover:shadow-2xl mb-5 duration-300 ease-in-out mx-auto`}
      >
        <h1 className="text-4xl font-bold mb-3 text-center font-poppins">
          {messDetails.Mess_Name}
        </h1>
        <p className="text-lg">Address : {messDetails.Address}</p>
        <p className="text-lg">About : {messDetails.Description}</p>
        <p className="text-lg">Capacity : {messDetails.Capacity}</p>
      </Card>

      <div className="mb-4 flex justify-end">
        <input
          type="text"
          placeholder="Search menu items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="p-2 border border-gray-300 rounded w-full text-black md:w-1/4"
        />
      </div>

      <h2 className="text-2xl font-semibold mb-4">Today's Menu</h2>
      <Table className="w-full text-center ">
        <thead className="bg-indigo-700 text-white">
          <tr>
            <th className="px-4 py-2">Menu Item</th>
            <th className="px-4 py-2">Price</th>
            <th className="px-4 py-2">Food Type</th>
            <th className="px-4 py-2">Quantity</th>
            <th className="px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {availableMenuItems.map((item) => {
            const selectedItem = selectedItems.find(
              (selected) => selected.menuId === item._id
            );
            return (
              <tr key={item._id} className="transition-colors">
                <td className="px-4 py-2 font-bold">{item.Menu_Name}</td>
                <td className="px-4 py-2">{item.Price}</td>
                <td className="px-4 py-2">{item.Food_Type}</td>
                <td className="px-4 py-2">
                  {selectedItem ? (
                    <div className="flex items-center justify-center">
                      <div className="flex items-center space-x-2 ">
                        <button
                          onClick={() => handleQuantityChange(item._id, -1)}
                          className="bg-gray-300 text-black  px-[10px] py-1 rounded transition-colors font-bold text-lg"
                        >
                          -
                        </button>
                        <span className="text-md text-gray-950 dark:text-gray-400 font-bold">
                          {selectedItem.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item._id, 1)}
                          className="bg-gray-300 text-black  px-2 py-1 rounded transition-colors font-bold text-lg"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSelectItem(item._id)}
                      className="bg-blue-500 text-white px-8 py-2 rounded-lg text-md font-semibold"
                    >
                      Add
                    </button>
                  )}
                </td>
                <td className="px-4 py-2">
                  {selectedItem && (
                    <button
                      onClick={() => handleRemoveItem(item._id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-md"
                    >
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
          {availableMenuItems.length === 0 && (
            <tr>
              <td colSpan="5" className="py-2 text-gray-500">
                No available menu items found.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {currentUser && currentUser.Login_Role === 'User' && (
        <div className="flex justify-end mt-4">
          <Button onClick={handlePrebook} className="text-white" disabled={!userId || selectedItems.length === 0}>
            Prebook Meals
          </Button>
        </div>
      )}

      <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
      <Modal.Body>
        <h3 className="text-xl font-semibold mb-4">Confirm Prebooking</h3>
        <p>Please confirm the items you've selected for prebooking.</p>
        <ul className="list-disc pl-5">
          {selectedItems.map((item) => (
            <li key={item.menuId}>
              {menuItems.find((menu) => menu._id === item.menuId)?.Menu_Name}{" "}
              - {item.quantity}
            </li>
          ))}
        </ul>
        <div className="mt-4">
          <p className="font-semibold text-lg">Total Amount: ₹{totalAmount}</p>
        </div>
        <div className="mt-4 flex justify-end">
          <Button
            onClick={handleConfirmPrebooking}
            className="bg-green-500 text-white"
            disabled={submitting} // Disable button while submitting
          >
            {submitting ? (
              <Spinner aria-label="Submitting" size="sm" className="" />
            ) : (
              'Confirm Prebook'
            )}
          </Button>
          <Button
            onClick={() => setIsModalOpen(false)}
            className="ml-2 bg-gray-500 text-white"
            disabled={submitting}
          >
            Cancel
          </Button>
        </div>
      </Modal.Body>
    </Modal>

      {/* Display average rating */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg font-semibold">Average Rating:</span>
        <div className="flex items-center">
          {[...Array(5)].map((_, index) => (
            <FaStar
              key={index}
              className={index < Math.floor(averageRating) ? "text-yellow-500" : "text-gray-300"}
            />
          ))}
        </div>
        <span>({averageRating.toFixed(1)})</span>
      </div>

      {/* Rating submission section */}
      {!hasRated && currentUser && currentUser.Login_Role === 'User' && (
        <div className="mt-4">
          <p className="text-lg font-semibold mb-2">Rate this mess:</p>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, index) => {
              const ratingValue = index + 1;
              return (
                <FaStar
                  key={index}
                  className={`cursor-pointer text-2xl ${
                    hover >= ratingValue ? "text-yellow-500" : "text-gray-300"
                  }`}
                  onClick={() => handleRating(ratingValue)}
                  onMouseEnter={() => setHover(ratingValue)}
                  onMouseLeave={() => setHover(null)}
                />
              );
            })}
          </div>
        </div>
      )}

      {hasRated && (
        <div className="mt-4">
          <p className="text-sm text-gray-600">
            You have already rated this mess
          </p>
          <div className="flex items-center gap-1 mt-1">
            {[...Array(5)].map((_, index) => (
              <FaStar
                key={index}
                className={`text-2xl ${
                  index < userRating ? "text-yellow-500" : "text-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MessMenu;
