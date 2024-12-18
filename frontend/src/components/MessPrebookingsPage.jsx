import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { HashLoader } from 'react-spinners';
import toast from 'react-hot-toast';
import { Pagination } from 'flowbite-react';

const MessPrebookingsPage = () => {
  const [prebookings, setPrebookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: 'All', search: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const currentMess = useSelector((state) => state.mess.currentMess); // Fetch current logged-in mess info

  useEffect(() => {
    const fetchMessPrebookings = async () => {
      if (!currentMess?._id) {
        toast.error('Please log in as a mess owner to view prebookings.');
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/mess/prebookings/${currentMess._id}`
        );
        setPrebookings(response.data);
        setFilteredBookings(response.data);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        toast.error('Failed to fetch prebookings.');
      }
    };

    fetchMessPrebookings();
  }, [currentMess]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleStatusUpdate = async (prebookingId, newStatus) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/mess/prebookings/${prebookingId}`,
        { status: newStatus }
      );
      toast.success('Prebooking status updated successfully.');
      setPrebookings((prev) =>
        prev.map((b) => (b._id === prebookingId ? { ...b, status: newStatus } : b))
      );
      setFilteredBookings((prev) =>
        prev.map((b) => (b._id === prebookingId ? { ...b, status: newStatus } : b))
      );
    } catch (err) {
      toast.error('Failed to update prebooking status.');
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

  useEffect(() => {
    let bookings = [...prebookings];

    if (filters.status !== 'All') {
      bookings = bookings.filter((b) => b.status === filters.status);
    }
    if (filters.search) {
      bookings = bookings.filter((b) =>
        b.menuId?.Menu_Name?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setFilteredBookings(bookings);
    setCurrentPage(1);
  }, [filters, prebookings]);

  return (
    <div className="p-8 min-h-screen">
      {loading ? (
        <div className="h-[80vh] w-full flex justify-center items-center">
          <HashLoader color="#35c9e1" />
        </div>
      ) : (
        <div className="max-w-5xl mx-auto mt-10">
          <h2 className="text-3xl font-semibold mb-6 text-center">Manage Prebookings</h2>

          {/* Filters */}
          <div className="flex justify-between items-center mb-6 gap-2 flex-wrap">
            <select
              className="p-2 border rounded-md dark:bg-gray-800"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Pending">Pending</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <input
              type="text"
              placeholder="Search by menu name"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="p-2 border rounded-md dark:bg-gray-800"
            />
          </div>

          {/* Prebooking List */}
          {filteredBookings.length === 0 ? (
            <p className="text-center text-gray-500">No prebookings found for the selected filters.</p>
          ) : (
            <ul className="space-y-4">
              {currentItems.map((booking) => (
                <li
                  key={booking._id}
                  className="p-4 border border-gray-200 rounded-lg shadow-sm bg-white dark:bg-gray-800 relative hover:shadow-lg transition"
                >
                  <h3 className="text-xl font-bold">{booking.menuId?.Menu_Name || 'Unknown Menu'}</h3>
                  <p className="dark:text-gray-400 mt-1">
                    User: <span className="font-semibold text-md">{booking.userId?.name || 'Unknown User'}</span>
                  </p>
                  <p className="dark:text-gray-400 mt-1">
                    Date: <span className="font-semibold text-md">{booking.date}</span>
                  </p>
                  <p className="dark:text-gray-400 mt-1">
                    Time: <span className="font-semibold text-md">{booking.time}</span>
                  </p>
                  <p
                    className={`mt-2 font-semibold ${
                      booking.status === 'Confirmed'
                        ? 'text-green-400'
                        : booking.status === 'Cancelled'
                        ? 'text-red-600'
                        : 'text-yellow-400'
                    }`}
                  >
                    Status: {booking.status}
                  </p>
                  <div className="mt-3 flex justify-end gap-3 ">
                    {booking.status === 'Pending' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(booking._id, 'Confirmed')}
                          className="bg-green-600 px-3 py-2 rounded-lg font-semibold text-white"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(booking._id, 'Cancelled')}
                          className="bg-red-600 px-3 py-2 rounded-lg font-semibold text-white"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 w-full flex items-center justify-center">
              <Pagination
                currentPage={currentPage}
                onPageChange={handlePageChange}
                totalPages={totalPages}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MessPrebookingsPage;
