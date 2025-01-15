import { Button, TextInput } from "flowbite-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MenuCard from "../components/MenuCard"; // Import the MenuCard component
import { HashLoader } from "react-spinners";

export default function Search() {
  const [searchTerm, setSearchTerm] = useState("");
  const [messes, setMesses] = useState([]);
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate(); // Navigation hook

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
      setMesses(data.messes);
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

  return (
    <div className="flex flex-col md:flex-row font-rubik">
      <div className="p-7 border-b md:border-r md:min-h-screen border-gray-500">
        <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
          <div className="flex items-center gap-2">
            <label className="whitespace-nowrap font-semibold">
              Search Term:
            </label>
            <TextInput
              placeholder="Search..."
              id="searchTerm"
              type="text"
              value={searchTerm}
              onChange={handleChange}
            />
          </div>
          <Button
            type="submit"
            onSubmit={handleSubmit}
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
        <div className=" p-11 flex flex-wrap gap-4 justify-center ">
          {!loading && messes.length === 0 && (
            <p className="text-xl text-gray-500">No messes found.</p>
          )}
          {loading && (
            <div className="h-[80vh] w-full flex justify-center items-center">
              <HashLoader color="#35c9e1" />
            </div>
          )}
          {!loading && (
            <div className=" h-full w-full flex gap-6 flex-wrap md:justify-evenly">
              {messes.map((mess) => (
                <MenuCard key={mess._id} menu={mess} />
                
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
