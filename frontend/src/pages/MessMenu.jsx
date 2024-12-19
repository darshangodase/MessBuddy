import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { HashLoader } from "react-spinners";
import { Card, Table, Modal, Button } from "flowbite-react";
import axios from "axios";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { useNavigate } from 'react-router-dom';

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
    const time = new Date().toLocaleTimeString("en-GB", { timeZone: "Asia/Kolkata" }); // IST Time
    
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
          <FaStar
            key={i}
            className="text-yellow-500"
            onClick={() => handleStarClick(i)}
          />
        ))}
        {halfStar && (
          <FaStarHalfAlt
            className="text-yellow-500"
            onClick={() => handleStarClick(fullStars)}
          />
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <FaRegStar
            key={i}
            className="text-yellow-500"
            onClick={() => handleStarClick(fullStars + (halfStar ? 1 : 0) + i)}
          />
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
    <div className="p-8 min-h-screen w-full overflow-x-auto scrollbar-none flex flex-col justify-center">
      <Card
        className={`${
          theme === "dark"
            ? "bg-gray-800"
            : "bg-gradient-to-r from-green-100 via-blue-100 to-purple-100"
        } md:w-3/4 shadow-lg transition-transform transform hover:scale-105 hover:shadow-2xl mb-5 duration-300 ease-in-out mx-auto`}
      >
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

      <div className="flex justify-end mt-4">
        <Button onClick={handlePrebook} className=" text-white" disabled={!userId || selectedItems.length === 0}>
          Prebook Meals
        </Button>
      </div>

      <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)} >
        <Modal.Body >
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
            <p className="font-semibold text-lg">
              Total Amount: ₹{totalAmount}
            </p>
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              onClick={handleConfirmPrebooking}
              className="bg-green-500 text-white"
            >
              Confirm Prebook
            </Button>
            <Button
              onClick={() => setIsModalOpen(false)}
              className="ml-2 bg-gray-500 text-white"
            >
              Cancel
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default MessMenu;
