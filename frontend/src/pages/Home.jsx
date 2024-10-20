import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import MenuCard from "../components/MenuCard";
import { Button } from "flowbite-react";
import { HashLoader } from "react-spinners";
import axios from "axios";
import heroImage from "../assets/images/hero.jpg";

export default function Home() {
  const [messes, setMesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMesses = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/mess`
        );
        setMesses(res.data.messes);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch messes:", error);
        setLoading(false);
      }
    };
    fetchMesses();
  }, []);

  const topMesses = messes
    .sort((a, b) => {
      const avgRatingA = a.Ratings.length > 0 ? a.Ratings.reduce((acc, rating) => acc + rating, 0) / a.Ratings.length : 0;
      const avgRatingB = b.Ratings.length > 0 ? b.Ratings.reduce((acc, rating) => acc + rating, 0) / b.Ratings.length : 0;
      return avgRatingB - avgRatingA;
    })
    .slice(0, 4);

  return (
    <div>
      <section className="flex flex-col lg:flex-row justify-between items-center text-center lg:text-left px-4 py-8">
        <div className="flex-1">
          <h1 className="mt-9 font-serif text-3xl font-semibold mb-4 lg:text-4xl hover:text-teal-400 text-center">
            Seamless Meals, Smarter Choices
          </h1>
          <p className="text-md mb-6 max-w-4xl text-center">
            Discover menus, insights, and updates that simplify mess and canteen
            management. From daily menu updates to real-time capacity checks,
            MessBuddy is the ultimate platform for students, managers, and food
            enthusiasts. Stay informed, engaged, and connected with your dining
            community.
          </p>
          <div className="flex justify-center">
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
          </div>
        </div>
        <div className="hidden md:flex flex-1">
          <img
            src={heroImage}
            alt="Hero"
            className="w-full h-[calc(100vh-20rem)] object-cover rounded-lg" // Set the height relative to the viewport
          />
        </div>
      </section>

      <div className="w-full p-3 flex flex-col items-center gap-3 py-7">
        {loading ? (
          <div className="flex justify-center min-h-screen">
            <HashLoader color="#35c9e1" />
          </div>
        ) : topMesses && topMesses.length > 0 ? (
          <div className="flex flex-col gap-6 items-center">
            <h2 className="font-serif text-3xl font-semibold text-center">
              Best Rated Messes
            </h2>
            <div className="flex flex-wrap justify-center gap-14">
              {topMesses.map((mess) => (
                <MenuCard key={mess._id} menu={mess} />
              ))}
            </div>
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