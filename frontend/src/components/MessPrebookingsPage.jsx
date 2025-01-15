import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { HashLoader } from "react-spinners";
import toast from "react-hot-toast";
import { Pagination } from "flowbite-react";
import { FaTrash } from "react-icons/fa";
import ReactPaginate from "react-paginate";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css"; // Import Calendar CSS

const MessPrebookingsPage = () => {
  const [prebookings, setPrebookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "All",
    search: "",
    sortBy: "date",
    startDate: "",
    endDate: "",
    minQuantity: "",
    maxQuantity: "",
    user: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);
  const [dateValue, setDateValue] = useState(new Date());

  const currentUser = useSelector((state) => state.user.currentUser);

  useEffect(() => {
    const fetchMessIdAndPrebookings = async () => {
      if (!currentUser?._id) {
        toast.error("Please log in as a mess owner to view prebookings.");
        setLoading(false);
        return;
      }

      try {
        const messResponse = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/mess/${currentUser._id}`
        );
        const messId = messResponse.data.mess._id;
        const prebookingResponse = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/prebooking/mess/${messId}`
        );
        setPrebookings(prebookingResponse.data);
        setFilteredBookings(prebookingResponse.data);
      } catch (err) {
        toast.error("Failed to fetch mess or prebookings.");
      } finally {
        setLoading(false);
      }
    };

    fetchMessIdAndPrebookings();
  }, [currentUser]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleStatusUpdate = async (prebookingId, newStatus) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/prebooking/${prebookingId}`,
        { status: newStatus }
      );
      toast.success("Prebooking status updated successfully.");
      setPrebookings((prev) =>
        prev.map((b) =>
          b._id === prebookingId ? { ...b, status: newStatus } : b
        )
      );
    } catch (err) {
      toast.error("Failed to update prebooking status.");
    }
  };

  const handleDeleteBooking = async () => {
    if (!bookingToDelete) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/prebooking/${bookingToDelete}`
      );
      toast.success("Prebooking deleted successfully.");

      setPrebookings((prev) => prev.filter((b) => b._id !== bookingToDelete));
      setFilteredBookings((prev) =>
        prev.filter((b) => b._id !== bookingToDelete)
      );

      setShowDeleteModal(false);
    } catch (err) {
      toast.error("Failed to delete prebooking.");
    }
  };

  // Filter the bookings based on the selected filters
  useEffect(() => {
    let bookings = [...prebookings];

    if (filters.status !== "All") {
      bookings = bookings.filter((b) => b.status === filters.status);
    }
    if (filters.search) {
      bookings = bookings.filter((b) =>
        b.menuId?.Menu_Name?.toLowerCase().includes(
          filters.search.toLowerCase()
        )
      );
    }
    if (filters.startDate && filters.endDate) {
      bookings = bookings.filter((b) => {
        const bookingDate = new Date(b.date);
        return (
          bookingDate >= new Date(filters.startDate) &&
          bookingDate <= new Date(filters.endDate)
        );
      });
    }
    if (filters.minQuantity) {
      bookings = bookings.filter((b) => b.quantity >= filters.minQuantity);
    }
    if (filters.maxQuantity) {
      bookings = bookings.filter((b) => b.quantity <= filters.maxQuantity);
    }
    if (filters.user) {
      bookings = bookings.filter((b) =>
        b.userId?.username?.toLowerCase().includes(filters.user.toLowerCase())
      );
    }

    // Sorting logic
    if (filters.sortBy === "date") {
      bookings = bookings.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (filters.sortBy === "quantity") {
      bookings = bookings.sort((a, b) => a.quantity - b.quantity);
    } else if (filters.sortBy === "status") {
      bookings = bookings.sort((a, b) => a.status.localeCompare(b.status));
    }

    setFilteredBookings(bookings);
    setCurrentPage(1);
  }, [filters, prebookings]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBookings.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

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
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - halfVisible) {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = totalPages - maxVisiblePages + 1; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (
          let i = currentPage - halfVisible;
          i <= currentPage + halfVisible;
          i++
        ) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers.map((page, index) =>
      page === "..." ? (
        <span key={index} className="px-2 text-gray-400">
          ...
        </span>
      ) : (
        <button
          key={page}
          className={`px-3 py-1 rounded-lg text-black ${
            page === currentPage ? "bg-blue-500 text-white" : "bg-gray-400"
          }`}
          onClick={() => handlePageChange(page)}
        >
          {page}
        </button>
      )
    );
  };

  const handleCalendarChange = (date) => {
    setDateValue(date);
    const filteredByDate = prebookings.filter(
      (b) => new Date(b.date).toDateString() === date.toDateString()
    );
    setFilteredBookings(filteredByDate);
  };

  return (
    <div className="p-8 min-h-screen w-full font-rubik">
      {loading ? (
        <div className="h-[80vh] w-full flex justify-center items-center">
          <HashLoader color="#35c9e1" />
        </div>
      ) : (
        <div className="max-w-5xl mx-auto mt-10">
          <h2 className="text-3xl font-semibold mb-6 text-center font-poppins">
            Manage Prebookings
          </h2>

          {/* Filters */}
          <div className="flex justify-between items-center mb-6 gap-2 flex-wrap">
            <select
              className="p-1 text-center border rounded-md dark:bg-gray-800"
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
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
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="p-1 text-center border rounded-md dark:bg-gray-800"
            />
            {/* User */}
            <input
              type="text"
              value={filters.user}
              onChange={(e) => handleFilterChange("user", e.target.value)}
              placeholder="Search by User"
              className="p-1 text-center border rounded-md dark:bg-gray-800"
            />

            {/* Quantity Range */}
            <input
              type="number"
              value={filters.minQuantity}
              onChange={(e) =>
                handleFilterChange("minQuantity", e.target.value)
              }
              placeholder="Min Quantity"
              className="p-1 text-center border rounded-md dark:bg-gray-800"
            />
            <input
              type="number"
              value={filters.maxQuantity}
              onChange={(e) =>
                handleFilterChange("maxQuantity", e.target.value)
              }
              placeholder="Max Quantity"
              className="p-1 text-center border rounded-md dark:bg-gray-800"
            />

            {/* Sorting Options */}
            <select
              className="p-2 border rounded-md dark:bg-gray-800"
              value={filters.sortBy}
              onChange={(e) => handleFilterChange("sortBy", e.target.value)}
            >
              <option value="date">Sort by Date</option>
              <option value="quantity">Sort by Quantity</option>
              <option value="status">Sort by Status</option>
            </select>
          </div>

          {/* Calendar */}
          <div className="mb-6  flex justify-center ">
            <Calendar
              onChange={handleCalendarChange}
              value={dateValue}
              className="dark:bg-gray-800 "
            />
          </div>

          {/* Prebooking Table */}
          {filteredBookings.length === 0 ? (
            <p className="text-center text-gray-500">
              No prebookings available.
            </p>
          ) : (
            <div className="overflow-x-auto scrollbar-none dark:border border-black border dark:border-white  rounded-lg mt-10">
            <table className="w-full table-auto text-left">
              <thead className=" bg-blue-700 dark:border border-black border  rounded-lg text-white">
                <tr>
                  <th className="p-2 dark:border dark:border-white border-black border text-center">
                    Menu Name
                  </th>
                  <th className="p-2 dark:border dark:border-white border-black border text-center">
                    Quantity
                  </th>
                  <th className="p-2 dark:border dark:border-white border-black border text-center">
                    Status
                  </th>
                  <th className="p-2 dark:border dark:border-white border-black border text-center">
                    User
                  </th>
                  <th className="p-2 dark:border dark:border-white border-black border text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="dark:border border-black border dark:border-white  rounded-lg">
                {currentItems.map((prebooking) => (
                  <tr key={prebooking._id}>
                    <td className="p-2 dark:border dark:border-white border-black border text-center">
                      {prebooking.menuId?.Menu_Name}
                    </td>
                    <td className="p-2 dark:border dark:border-white border-black border text-center">
                      {prebooking.quantity}
                    </td>

                    <td
                      className={`p-2 text-center dark:border dark:border-white border-black border ${
                        prebooking.status === "Confirmed"
                          ? "text-green-500"
                          : prebooking.status === "Pending"
                          ? "text-yellow-500"
                          : prebooking.status === "Cancelled"
                          ? "text-red-500"
                          : "text-gray-500"
                      }`}
                    >
                      {prebooking.status}
                    </td>

                    <td className="p-2 dark:border dark:border-white border-black border text-center">
                      {prebooking.userId?.username}
                    </td>
                    <td className="p-2 dark:border dark:border-white border-black border-b text-center">
                      {prebooking.status === "Pending" ? (
                        <>
                          <button
                            className="text-green-500"
                            onClick={() =>
                              handleStatusUpdate(prebooking._id, "Confirmed")
                            }
                          >
                            Confirm
                          </button>
                          <button
                            className="text-red-500 ml-2"
                            onClick={() =>
                              handleStatusUpdate(prebooking._id, "Cancelled")
                            }
                          >
                            Reject
                          </button>
                        </>
                      ) : prebooking.status === "Cancelled" ? (
                        <button
                          className="text-red-500"
                          onClick={() => {
                            setShowDeleteModal(true);
                            setBookingToDelete(prebooking._id);
                          }}
                        >
                          <FaTrash />
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
         

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 w-full flex items-center justify-center flex-wrap gap-2">
              {currentPage > 1 && (
                <button
                  className="px-3 py-1 bg-gray-600 rounded-lg text-white dark:text-white"
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  &lt;
                </button>
              )}
              {renderPaginationItems()}
              {currentPage < totalPages && (
                <button
                  className="px-3 py-1 bg-gray-600 rounded-lg text-white dark:text-white"
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  &gt;
                </button>
              )}
            </div>
          )}

          {/* Delete Modal */}
          {showDeleteModal && (
            <div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-50 flex justify-center items-center m-4 ">
              <div className="bg-white p-6 rounded-lg">
                <h3 className="text-xl mb-4 text-black">
                  Are you sure you want to delete this prebooking?
                </h3>
                <div className="flex justify-around">
                  <button
                    onClick={handleDeleteBooking}
                    className="bg-red-500 text-white px-4 py-2 rounded-md"
                  >
                    Yes, Delete
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MessPrebookingsPage;
