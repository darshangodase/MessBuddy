import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import MenuCard from "../components/MenuCard"; 
import { Button } from "flowbite-react";
import { HashLoader } from "react-spinners";
import axios from "axios";

export default function Home() {
  const [messes, setMesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMesses = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/mess`);
        setMesses(res.data.messes);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch messes:", error);
        setLoading(false);
      }
    };
    fetchMesses();
  }, []);

  return (
    <div>
      <section className="flex flex-col justify-center items-center text-center px-4 py-8">
        <h1 className="mt-9 font-serif text-4xl font-semibold mb-4 lg:text-5xl hover:text-teal-400">
          Seamless Meals, Smarter Choices
        </h1>
        <p className="text-md mb-6 max-w-4xl">
          Discover menus, insights, and updates that simplify mess and canteen
          management. From daily menu updates to real-time capacity checks,
          MessBuddy is the ultimate platform for students, managers, and food
          enthusiasts. Stay informed, engaged, and connected with your dining
          community.
        </p>

        <Link to="/search">
          <Button
            type="submit"
            gradientDuoTone="purpleToPink"
            className="mt-4 mb-3"
            outline
          >
            View All Mess Menus
          </Button>
        </Link>
      </section>

      <div className="w-full p-3 flex flex-col items-center gap-3 py-7">
        {loading ? (
          <div className="flex justify-center min-h-screen">
            <HashLoader color="#35c9e1" />
          </div>
        ) : messes && messes.length > 0 ? (
          <div className="flex flex-col gap-6 items-center">
            <h2 className="font-serif text-3xl font-semibold text-center">
              Recent Menus
            </h2>
            <div className="flex flex-wrap justify-center gap-14">
              {messes.map((mess) => (
                <MenuCard key={mess._id} menu={mess} />
              ))}
            </div>
            <Link to="/search">
              <Button
                type="submit"
                gradientDuoTone="purpleToPink"
                className="mt-4 mb-3"
                outline
              >
                View all Menus
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex justify-center min-h-screen">
            <p>No menus available</p>
          </div>
        )}
      </div>
    </div>
  );
}