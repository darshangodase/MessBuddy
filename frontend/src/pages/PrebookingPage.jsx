import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { FaTrash } from 'react-icons/fa';

const PrebookingsPage = () => {
  const [prebookings, setPrebookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: 'All', mess: 'All' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);

  const currentUser = useSelector((state) => state.user.currentUser);

  useEffect(() => {
    const fetchUserPrebookings = async () => {
      if (!currentUser?._id) {
        toast.error('Please log in to view your prebookings.');
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/prebooking/${currentUser._id}`
        );
        setPrebookings(response.data);
        setFilteredBookings(response.data);
      } catch (err) {
        toast.error('Failed to fetch prebookings.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserPrebookings();
  }, [currentUser]);

  const handleDeleteBooking = async () => {
    if (!bookingToDelete) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/prebooking/${bookingToDelete}`
      );
      toast.success('Prebooking deleted successfully.');
      setPrebookings((prev) => prev.filter((b) => b._id !== bookingToDelete));
      setFilteredBookings((prev) => prev.filter((b) => b._id !== bookingToDelete));
      setShowDeleteModal(false);
    } catch (err) {
      toast.error('Failed to delete prebooking.');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    let bookings = [...prebookings];

    if (filters.status !== 'All') {
      bookings = bookings.filter((b) => b.status === filters.status);
    }
    if (filters.mess !== 'All') {
      bookings = bookings.filter((b) => b.messId?.Mess_Name === filters.mess);
    }
    setFilteredBookings(bookings);
    setCurrentPage(1);
  }, [filters, prebookings]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

  const renderPaginationItems = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    const halfVisible = Math.floor(maxVisiblePages / 2);

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= halfVisible + 1) {
        for (let i = 1; i <= maxVisiblePages; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - halfVisible) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - maxVisiblePages + 1; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - halfVisible; i <= currentPage + halfVisible; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers.map((page, index) =>
      page === '...' ? (
        <span key={index} className="px-2 text-gray-400">
          ...
        </span>
      ) : (
        <button
          key={page}
          className={`px-3 py-1 rounded-lg text-black ${
            page === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-400'
          }`}
          onClick={() => handlePageChange(page)}
        >
          {page}
        </button>
      )
    );
  };

  const renderSkeleton = () => (
    <ul className="space-y-4">
      {Array.from({ length: itemsPerPage }).map((_, index) => (
        <li key={index} className="p-4 py-8 border border-gray-200 rounded-lg shadow-sm bg-gray-100 dark:bg-slate-800  animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-2/4 mb-2"></div>
          <div className="h-5 bg-gray-300 rounded w-1/3 mb-2"></div>
          <div className="h-5 bg-gray-300 rounded w-1/4 mb-2"></div>
          <div className="h-5 bg-gray-300 rounded w-1/5 mb-2"></div>
          <div className="h-5 bg-gray-300 rounded w-1/5"></div>

        </li>
      ))}
    </ul>
  );

  return (
    <div className="p-8 min-h-screen font-rubik">
      <div className="max-w-3xl mx-auto mt-10">
        <h2 className="text-3xl font-semibold mb-6 text-center font-poppins">My Prebookings</h2>
        {loading ? (
          renderSkeleton()
        ) : (
          <>
            <div className="flex justify-between items-center mb-6 gap-2 flex-wrap ">
              <select
                className="p-2 border rounded-md bg-gray-100 dark:bg-slate-800"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Pending">Pending</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              <select
                className="p-2 border rounded-md bg-gray-100 dark:bg-slate-800"
                value={filters.mess}
                onChange={(e) => handleFilterChange('mess', e.target.value)}
              >
                <option value="All">All Messes</option>
                {Array.from(new Set(prebookings.map((b) => b.messId?.Mess_Name))).map((mess) => (
                  <option key={mess} value={mess}>
                    {mess}
                  </option>
                ))}
              </select>
            </div>

            {filteredBookings.length === 0 ? (
              <p className="text-center text-gray-500">No prebookings found for the selected filters.</p>
            ) : (
              <ul className="space-y-4">
                {currentItems.map((booking) => (
                  <li
                    key={booking._id}
                    className="p-4 border border-gray-200 rounded-lg shadow-sm bg-gray-100 dark:bg-slate-800 relative hover:shadow-lg transition"
                  >
                    {booking.status !== 'Confirmed' && (
                      <FaTrash
                        className="absolute top-4 right-4 cursor-pointer"
                        onClick={() => {
                          setShowDeleteModal(true);
                          setBookingToDelete(booking._id);
                        }}
                      />
                    )}
                    <h3 className="text-xl font-bold">{booking.menuId?.Menu_Name || 'Unknown Menu'}</h3>
                    <p className="mt-1">
                      Mess: <span className="font-semibold">{booking.messId?.Mess_Name || 'Unknown Mess'}</span>
                    </p>
                    <p className="mt-1">
                      Date: <span className="font-semibold">{booking.date}</span>
                    </p>
                    <p className="mt-1">
                      Time: <span className="font-semibold">{booking.time}</span>
                    </p>
                    <p className="mt-1">
                      Quantity: <span className="font-semibold">{booking.quantity || 1}</span>
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
                  </li>
                ))}
              </ul>
            )}
            {totalPages > 1 && (
              <div className="mt-6 w-full flex items-center justify-center flex-wrap gap-2">
                {currentPage > 1 && (
                  <button
                    className="px-3 py-1 bg-gray-600 rounded-lg text-white"
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    Prev
                  </button>
                )}
                {renderPaginationItems()}
                {currentPage < totalPages && (
                  <button
                    className="px-3 py-1 bg-gray-600 rounded-lg text-white"
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    Next
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {showDeleteModal && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center  bg-black bg-opacity-50 z-50 ">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-md dark:bg-slate-800">
            <h2 className="text-2xl font-semibold mb-4">Delete Confirmation</h2>
            <p>Are you sure you want to delete this prebooking?</p>
            <div className="flex justify-end mt-4">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded-md mr-2"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md"
                onClick={handleDeleteBooking}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrebookingsPage;
