import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { HashLoader } from 'react-spinners';
import { Spinner } from 'flowbite-react';

const PrebookingForm = () => {
  const [menus, setMenus] = useState([]);
  const [messes, setMesses] = useState([]);
  const [filteredMenus, setFilteredMenus] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState('');
  const [selectedMess, setSelectedMess] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false); // State for submission
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.user.currentUser);

  // Fetch messes and menus data from API
  useEffect(() => {
    if (currentUser && currentUser.Login_Role !== 'User') {
      navigate('/');
      toast.error('Prebooking feature is only available for users');
      return;
    }
    const fetchMessesAndMenus = async () => {
      try {
        const messRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/mess`);
        const menuRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/menu`);
        setMesses(messRes.data.messes);
        setMenus(menuRes.data.menus);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        toast.error('Failed to fetch messes or menus.');
      }
    };

    fetchMessesAndMenus();
  }, [currentUser]);

  // Filter menus when a mess is selected
  useEffect(() => {
    if (selectedMess) {
      const selectedMessData = messes.find((mess) => mess._id === selectedMess);
      const ownerId = selectedMessData?.Owner_ID;

      if (ownerId) {
        const filtered = menus.filter(
          (menu) => menu.Owner_ID === ownerId && menu.Availability === 'Yes'
        );
        setFilteredMenus(filtered);
      } else {
        setFilteredMenus([]);
      }
    } else {
      setFilteredMenus([]);
    }
  }, [selectedMess, menus, messes]);

  const isFutureDateAndTime = (date, time) => {
    const selectedDateTime = new Date(`${date}T${time}`);
    return selectedDateTime > new Date();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedMenu || !selectedMess || !selectedDate || !selectedTime || !selectedQuantity) {
      toast.error('All fields are required!');
      return;
    }

    if (selectedQuantity <= 0) {
      toast.error('Quantity must be greater than 0.');
      return;
    }

    if (!isFutureDateAndTime(selectedDate, selectedTime)) {
      toast.error('Please select a valid future date and time.');
      return;
    }

    const userId = currentUser?._id;
    if (!userId) {
      toast.error('You need to sign in to your account to proceed with prebooking.');
      navigate('/');
      return;
    }

    setSubmitting(true); // Start submission state
    try {
      const prebookingData = {
        menuId: selectedMenu,
        messId: selectedMess,
        userId,
        date: selectedDate,
        time: selectedTime,
        quantity: selectedQuantity,
      };

      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/prebooking`, prebookingData);
      toast.success('Prebooking created successfully, and email notification sent.');
      navigate('/prebookings');
    } catch (err) {
      toast.error('Error in creating prebooking!');
    } finally {
      setSubmitting(false); // Reset submission state
    }
  };

  return (
    <div>
      {loading ? (
        <div className="h-[80vh] w-full flex justify-center items-center">
          <HashLoader color="#35c9e1" />
        </div>
      ) : (
        <div className="flex w-full justify-center items-center p-6 font-rubik">
          <div className="p-8 mb-20 w-96 dark:bg-gray-800 shadow-lg rounded-lg mt-10 mx-auto bg-white">
            <h2 className="text-2xl font-semibold mb-4 text-center font-poppins">Prebook a Meal</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-lg font-medium" htmlFor="mess">
                  Select Mess
                </label>
                <select
                  id="mess"
                  className="w-full px-3 py-2 border rounded dark:bg-[#1E1E2F]"
                  value={selectedMess}
                  onChange={(e) => setSelectedMess(e.target.value)}
                >
                  <option value="">Select a Mess</option>
                  {messes.map((mess) => (
                    <option key={mess._id} value={mess._id}>
                      {mess.Mess_Name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-lg font-medium" htmlFor="menu">
                  Select Menu Item
                </label>
                <select
                  id="menu"
                  className="w-full px-3 py-2 border rounded dark:bg-[#1E1E2F]"
                  value={selectedMenu}
                  onChange={(e) => setSelectedMenu(e.target.value)}
                >
                  <option value="">Select a Menu</option>
                  {filteredMenus.map((menu) => (
                    <option key={menu._id} value={menu._id}>
                      {menu.Menu_Name} - ₹{menu.Price}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-lg font-medium" htmlFor="date">
                  Select Date
                </label>
                <input
                  type="date"
                  id="date"
                  className="w-full px-3 py-2 border rounded dark:bg-[#1E1E2F]"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="block text-lg font-medium" htmlFor="time">
                  Select Time
                </label>
                <input
                  type="time"
                  id="time"
                  className="w-full px-3 py-2 border rounded dark:bg-[#1E1E2F]"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="block text-lg font-medium" htmlFor="quantity">
                  Quantity
                </label>
                <input
                  type="number"
                  id="quantity"
                  min="1"
                  className="w-full px-3 py-2 border rounded dark:bg-[#1E1E2F]"
                  value={selectedQuantity}
                  onChange={(e) => setSelectedQuantity(Number(e.target.value))}
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 flex justify-center items-center"
                disabled={submitting}
              >
                {submitting ? <Spinner aria-label="Submitting" size="sm" /> : 'Prebook Meal'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrebookingForm;
