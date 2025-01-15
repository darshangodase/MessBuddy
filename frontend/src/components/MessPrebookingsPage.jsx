import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { HashLoader, ClipLoader } from "react-spinners";
import toast from "react-hot-toast";
import ReactPaginate from "react-paginate"; // Importing react-paginate
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { FaTrash } from "react-icons/fa";
import { Modal, Button, Spinner } from "flowbite-react"; // Importing flowbite-react components

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
  const [currentPage, setCurrentPage] = useState(0); // Changed to 0 for react-paginate
  const [itemsPerPage] = useState(5);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);
  const [bookingToUpdate, setBookingToUpdate] = useState(null);
  const [dateValue, setDateValue] = useState(new Date());
  const [modalLoading, setModalLoading] = useState(false);

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
    setModalLoading(true);
    try {
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/prebooking/${prebookingId}`,
        { status: newStatus }
      );
      toast.success(
        "Prebooking status updated successfully, and email notification sent"
      );
      setPrebookings((prev) =>
        prev.map((b) =>
          b._id === prebookingId ? { ...b, status: newStatus } : b
        )
      );
      setShowConfirmModal(false);
      setShowRejectModal(false);
    } catch (err) {
      toast.error("Failed to update prebooking status.");
    } finally {
      setModalLoading(false);
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
    setCurrentPage(0); // Reset to first page when filters change
  }, [filters, prebookings]);

  const handlePageChange = (selectedPage) => {
    setCurrentPage(selectedPage.selected); // `selected` is the new page index
  };

  const indexOfLastItem = (currentPage + 1) * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBookings.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

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
            <div className="overflow-x-auto scrollbar-none rounded-lg mt-10">
              <table className="w-full table-auto text-left">
                <thead className="bg-blue-700 text-white">
                  <tr>
                    <th className="p-2 text-center">Menu Name</th>
                    <th className="p-2 text-center">Quantity</th>
                    <th className="p-2 text-center">Status</th>
                    <th className="p-2 text-center">User</th>
                    <th className="p-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((prebooking) => (
                    <tr key={prebooking._id} className="border-b border-gray-300">
                      <td className="p-2 text-center">{prebooking.menuId?.Menu_Name}</td>
                      <td className="p-2 text-center">{prebooking.quantity}</td>
                      <td
                        className={`p-2 text-center ${
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
                      <td className="p-2 text-center">{prebooking.userId?.username}</td>
                      <td className="p-2 text-center">
                        {prebooking.status === "Pending" ? (
                          <>
                            <button
                              className="text-green-500"
                              onClick={() => {
                                setShowConfirmModal(true);
                                setBookingToUpdate(prebooking._id);
                              }}
                            >
                              Confirm
                            </button>
                            <button
                              className="text-red-500 ml-2"
                              onClick={() => {
                                setShowRejectModal(true);
                                setBookingToUpdate(prebooking._id);
                              }}
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

          {totalPages > 1 && (
            <ReactPaginate
              pageCount={totalPages}
              pageRangeDisplayed={2}
              marginPagesDisplayed={2}
              onPageChange={handlePageChange}
              containerClassName="pagination flex items-center justify-center gap-2 mt-6"
              pageClassName="px-3 py-1 bg-gray-600 rounded-lg text-white dark:text-white"
              activeClassName="bg-blue-500 text-white"
              breakLabel="..."
              breakClassName="px-3 py-1 bg-gray-600 rounded-lg text-white dark:text-white"
            />
          )}

          {/* Delete Modal */}
          <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
            <Modal.Body>
              <h3 className="text-xl font-semibold mb-4">Delete Prebooking</h3>
              <p>Are you sure you want to delete this prebooking?</p>
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={handleDeleteBooking}
                  className="bg-red-500 text-white"
                >
                  Yes, Delete
                </Button>
                <Button
                  onClick={() => setShowDeleteModal(false)}
                  className="ml-2 bg-gray-500 text-white"
                >
                  Cancel
                </Button>
              </div>
            </Modal.Body>
          </Modal>

          {/* Confirm Modal */}
          <Modal show={showConfirmModal} onClose={() => setShowConfirmModal(false)}>
            <Modal.Body>
              <h3 className="text-xl font-semibold mb-4">Confirm Prebooking</h3>
              <p>Are you sure you want to confirm this prebooking?</p>
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={() => handleStatusUpdate(bookingToUpdate, "Confirmed")}
                  className="bg-green-500 text-white"
                  disabled={modalLoading}
                >
                  {modalLoading ? <Spinner aria-label="Submitting" size="sm" /> : "Yes, Confirm"}
                </Button>
                <Button
                  onClick={() => setShowConfirmModal(false)}
                  className="ml-2 bg-gray-500 text-white"
                  disabled={modalLoading}
                >
                  Cancel
                </Button>
              </div>
            </Modal.Body>
          </Modal>

          {/* Reject Modal */}
          <Modal show={showRejectModal} onClose={() => setShowRejectModal(false)}>
            <Modal.Body>
              <h3 className="text-xl font-semibold mb-4">Reject Prebooking</h3>
              <p>Are you sure you want to reject this prebooking?</p>
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={() => handleStatusUpdate(bookingToUpdate, "Cancelled")}
                  className="bg-red-500 text-white"
                  disabled={modalLoading}
                >
                  {modalLoading ? <Spinner aria-label="Submitting" size="sm" /> : "Yes, Reject"}
                </Button>
                <Button
                  onClick={() => setShowRejectModal(false)}
                  className="ml-2 bg-gray-500 text-white"
                  disabled={modalLoading}
                >
                  Cancel
                </Button>
              </div>
            </Modal.Body>
          </Modal>
        </div>
      )}
    </div>
  );
};

export default MessPrebookingsPage;