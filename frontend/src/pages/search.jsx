import { Button, Select, TextInput } from "flowbite-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MenuCard from "../components/MenuCard"; // Import the MenuCard component
import { HashLoader } from "react-spinners";

export default function Search() {
  const [sidebarData, setSidebarData] = useState({
    searchTerm: "",
    sort: "desc",
    category: "all",
  });

  const [messes, setMesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get("searchTerm");
    const sortFromUrl = urlParams.get("sort");
    const categoryFromUrl = urlParams.get("category");
    if (searchTermFromUrl || sortFromUrl || categoryFromUrl) {
      setSidebarData({
        ...sidebarData,
        searchTerm: searchTermFromUrl || "",
        sort: sortFromUrl || "desc",
        category: categoryFromUrl || "all",
      });
    }

    const fetchMesses = async () => {
      setLoading(true);
      if (urlParams.get("category") === "all") {
        urlParams.delete("category");
      }
      urlParams.set("limit", 9); // Set the limit to 9 messes
      const searchQuery = urlParams.toString();
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/mess?${searchQuery}`
      );
      if (!res.ok) {
        setLoading(false);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setMesses(data.messes);
        setLoading(false);
        if (data.messes.length === 9) {
          setShowMore(true);
        } else {
          setShowMore(false);
        }
      }
    };
    fetchMesses();
  }, [location.search]);

  const handleChange = (e) => {
    if (e.target.id === "searchTerm") {
      setSidebarData({ ...sidebarData, searchTerm: e.target.value });
    }
    if (e.target.id === "sort") {
      const order = e.target.value || "desc";
      setSidebarData({ ...sidebarData, sort: order });
    }
    if (e.target.id === "category") {
      const category = e.target.value || "all";
      setSidebarData({ ...sidebarData, category });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(location.search);
    urlParams.set("searchTerm", sidebarData.searchTerm);
    urlParams.set("sort", sidebarData.sort);
    if (sidebarData.category === "all") {
      urlParams.delete("category");
    } else {
      urlParams.set("category", sidebarData.category);
    }
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  const handleShowMore = async () => {
    const numberOfMesses = messes.length;
    const startIndex = numberOfMesses;
    const urlParams = new URLSearchParams(location.search);
    urlParams.set("startIndex", startIndex);
    urlParams.set("limit", 9);
    if (sidebarData.category === "all") {
      urlParams.delete("category");
    }
    const searchQuery = urlParams.toString();
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/mess?${searchQuery}`
    );
    if (!res.ok) {
      return;
    }
    if (res.ok) {
      const data = await res.json();
      setMesses([...messes, ...data.messes]);
      if (data.messes.length === 9) {
        setShowMore(true);
      } else {
        setShowMore(false);
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row">
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
              value={sidebarData.searchTerm}
              onChange={handleChange}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="font-semibold">Sort:</label>
            <Select onChange={handleChange} value={sidebarData.sort} id="sort">
              <option value="desc">Latest</option>
              <option value="asc">Oldest</option>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <label className="font-semibold">Category:</label>
            <Select
              onChange={handleChange}
              value={sidebarData.category}
              id="category"
            >
              <option value="all">Select a category</option>
              <option value="Veg">Veg</option>
              <option value="Non-Veg">Non-Veg</option>
              <option value="Mixed">Mixed</option>
            </Select>
          </div>
          <Button type="submit" outline gradientDuoTone="purpleToPink">
            Apply Filters
          </Button>
        </form>
      </div>

      <div className="w-full">
        <h1 className="text-center text-3xl font-semibold sm:border-b border-gray-500 p-3 mt-5">
          Mess Results
        </h1>
        <div className="p-7 flex flex-wrap gap-4 justify-center'">
          {!loading && messes.length === 0 && (
            <p className="text-xl text-gray-500">No messes found.</p>
          )}
          {loading && (
            <div className="h-[80vh] w-full flex justify-center items-center">
              <HashLoader color="#35c9e1" />
            </div>
          )}
          {!loading &&
            messes &&
            messes.map((mess) => <MenuCard key={mess._id} menu={mess} />)}
        </div>
        {showMore && (
          <div className="flex justify-center p-7">
            <Button
              onClick={handleShowMore}
              gradientDuoTone="purpleToBlue"
              outline
              className="h-12"
            >
              Show More
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}