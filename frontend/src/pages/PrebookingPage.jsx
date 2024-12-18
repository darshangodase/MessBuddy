import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { HashLoader } from 'react-spinners';
import toast from 'react-hot-toast';

const PrebookingsPage = () => {
  const [prebookings, setPrebookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = useSelector((state) => state.user.currentUser);

  // Fetch user prebookings
  useEffect(() => {
    const fetchUserPrebookings = async () => {
      if (!currentUser?._id) {
        toast.error('User is not logged in!');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/prebooking/${currentUser._id}`);
        setPrebookings(response.data);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        toast.error('Failed to fetch prebookings.');
      }
    };

    fetchUserPrebookings();
  }, [currentUser]);

  return (
    <div className="p-8">
      {loading ? (
        <div className="h-[80vh] w-full flex justify-center items-center">
          <HashLoader color="#35c9e1" />
        </div>
      ) : prebookings.length === 0 ? (
        <div className="text-center mt-20">
          <h2 className="text-2xl font-semibold">No Prebookings Found</h2>
          <p className="text-gray-500 mt-2">You have not made any prebookings yet.</p>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto mt-10">
          <h2 className="text-3xl font-semibold mb-6 text-center">My Prebookings</h2>
          <ul className="space-y-4">
            {prebookings.map((booking) => (
              <li
                key={booking._id}
                className="p-4 border border-gray-200 rounded-lg shadow-sm bg-white dark:bg-gray-800"
              >
                <h3 className="text-xl font-medium">{booking.menuId?.Menu_Name || 'Unknown Menu'}</h3>
                <p className="text-gray-600 mt-1">
                  Mess: <span className="font-medium">{booking.messId?.Mess_Name || 'Unknown Mess'}</span>
                </p>
                <p className="text-gray-600 mt-1">
                  Date: <span className="font-medium">{booking.date}</span>
                </p>
                <p className="text-gray-600 mt-1">
                  Time: <span className="font-medium">{booking.time}</span>
                </p>
                <p
                  className={`mt-2 font-semibold ${
                    booking.status === 'Confirmed'
                      ? 'text-green-600'
                      : booking.status === 'Cancelled'
                      ? 'text-red-600'
                      : 'text-yellow-600'
                  }`}
                >
                  Status: {booking.status}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PrebookingsPage;
