import { Button, TextInput } from "flowbite-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MenuCard from "../components/MenuCard";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function Search() {
  const [searchTerm, setSearchTerm] = useState("");
  const [messes, setMesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1); // Pagination state

  const location = useLocation();
  const navigate = useNavigate();

  const pageSize = 6; // Number of messes per page

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get("searchTerm");
    if (searchTermFromUrl) {
      setSearchTerm(searchTermFromUrl);
    }

    const fetchMesses = async () => {
      setLoading(true);
      const searchQuery = urlParams.toString();
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/mess?${searchQuery}`
      );

      if (!res.ok) {
        setLoading(false);
        return;
      }

      const data = await res.json();
      setMesses(data.messes); // Store all messes
      setLoading(false);
    };

    fetchMesses();
  }, [location.search]);

  const handleChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(location.search);
    urlParams.set("searchTerm", searchTerm);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  // Calculate which messes to display based on the current page
  const startIndex = (page - 1) * pageSize;
  const currentMesses = messes.slice(startIndex, startIndex + pageSize);
  const totalPages = Math.ceil(messes.length / pageSize); // Calculate total pages from the total messes

  return (
    <div className="flex flex-col md:flex-row font-rubik">
      <div className="p-7 border-b md:border-r md:min-h-screen border-gray-500">
        <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
          <div className="flex items-center gap-2">
            <label className="whitespace-nowrap font-semibold">
              Search Mess:
            </label>
            <TextInput
              placeholder="Enter Mess Name "
              id="searchTerm"
              type="text"
              value={searchTerm}
              onChange={handleChange}
              className="placeholder:text-xs"
            />
          </div>

          <Button
            type="submit"
            outline
            gradientDuoTone="purpleToPink"
          >
            Apply Filters
          </Button>
        </form>
      </div>

      <div className="w-full">
        <h1 className="text-center text-3xl font-semibold sm:border-b border-gray-500 p-3 mt-5 font-poppins">
          Mess Results
        </h1>
        <div className="p-11 flex flex-wrap gap-4 justify-center">
          {!loading && messes.length === 0 && (
            <p className="text-xl text-gray-500">No messes found.</p>
          )}
          {loading && (
            <div className="flex flex-wrap justify-center gap-14 mb-10">
              {[...Array(pageSize)].map((_, index) => (
                <div
                  key={index}
                  className="w-64 h-80 bg-gray-300 dark:bg-gray-800 rounded-lg shadow-md px-6 pt-6 animate-pulse"
                >
                  <Skeleton height={160} className="rounded-t-lg" />
                  <div className="p-4">
                    <Skeleton width="80%" height={24} />
                    <Skeleton width="60%" height={18} className="mt-2" />
                    <Skeleton width="40%" height={18} className="mt-2" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {!loading && (
            <div className="h-full w-full flex gap-6 flex-wrap md:justify-evenly">
              {currentMesses.map((mess) => (
                <MenuCard key={mess._id} menu={mess} />
              ))}
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {!loading && messes.length > 0 && (
          <div className="flex justify-center gap-4 mt-6 mb-10">
            <Button
              disabled={page === 1}
              onClick={() => handlePageChange(page - 1)}
            >
              Previous
            </Button>
            <p className="flex items-center">{`Page ${page} of ${totalPages}`}</p>
            <Button
              disabled={page === totalPages}
              onClick={() => handlePageChange(page + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
