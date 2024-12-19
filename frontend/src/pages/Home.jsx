import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import MenuCard from "../components/MenuCard";
import { Button } from "flowbite-react";
import { HashLoader } from "react-spinners";
import axios from "axios";
import heroImage from "../assets/images/hero.jpg";
import { motion } from "framer-motion";
import CountUp from "react-countup";

export default function Home() {
  const [messes, setMesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]); // For upcoming bookings
  const [stats, setStats] = useState({
    totalMesses: 0,
    mealsPreBooked: 0,
    avgRating: "0/5",
  });

  const circleVariants = {
    hidden: { opacity: 0, x: 50, y: 50 },
    visible: (index) => ({
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 1,
        delay: index * 0.3,
        type: "spring",
      },
    }),
  };

  useEffect(() => {
    const fetchMesses = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/mess`
        );
        setMesses(res.data.messes);
        setLoading(false);

        // Compute dynamic stats
        const avgRating =
          res.data.messes.reduce(
            (acc, mess) =>
              acc +
              (mess.Ratings.length > 0
                ? mess.Ratings.reduce((sum, r) => sum + r, 0) /
                  mess.Ratings.length
                : 0),
            0
          ) / res.data.messes.length;
        setStats({
          totalMesses: res.data.messes.length,
          mealsPreBooked: 1200, // Example static value
          avgRating: `${avgRating.toFixed(1)}/5`,
        });
      } catch (error) {
        console.error("Failed to fetch messes:", error);
        setLoading(false);
      }
    };

    const fetchBookings = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/bookings`
        );
        setBookings(res.data.bookings);
      } catch (error) {
        console.error("Failed to fetch bookings:", error);
      }
    };

    fetchMesses();
    fetchBookings();
  }, []);

  const topMesses = messes
    .sort((a, b) => {
      const avgRatingA = a.Ratings.length
        ? a.Ratings.reduce((acc, rating) => acc + rating, 0) / a.Ratings.length
        : 0;
      const avgRatingB = b.Ratings.length
        ? b.Ratings.reduce((acc, rating) => acc + rating, 0) / b.Ratings.length
        : 0;
      return avgRatingB - avgRatingA;
    })
    .slice(0, 4);

  return (
    <div>
      {/* Hero Section */}
      <section className="h-[91vh] relative flex flex-col lg:flex-row justify-center items-center text-center lg:text-left px-4 py-8">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>
        <div className="absolute inset-0 bg-gray-700 opacity-70"></div>
        <div className="relative z-10 flex justify-center flex-col items-center text-white">
          <h1 className="mt-9 font-serif text-3xl font-semibold mb-4 lg:text-5xl text-red-500 text-center">
            Seamless Meals, Smarter Choices
          </h1>
          <p className="text-xl mb-6 max-w-4xl text-center">
            Discover and explore mess menus, pre-book meals effortlessly, and
            stay connected with your dining community. Simplify canteen
            management and enhance your dining experience with ease.
          </p>
          <div className="flex justify-center">
            <Link to="/search">
              <Button
                type="submit"
                gradientDuoTone="purpleToPink"
                className="mt-4 mb-3"
              >
                View All Mess Menus
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Top-Rated Messes */}
      <section className="w-full p-3 flex flex-col items-center gap-3 py-7">
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
      </section>

      {/* Features Section */}
      {/* Features Section */}
      <section className=" py-10 px-5 rounded-lg text-black dark:text-white">
        <div className="text-center mb-8">
          <h2 className="font-serif text-3xl font-semibold text-center">
            Why Choose MessBuddy?
          </h2>
          <p className="text-lg mt-2">
            Our platform is designed to make your dining experience seamless and
            enjoyable.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 justify-evenly px-2 ">
          {[
            {
              title: "Real-Time Menu Updates",
              description:
                "Stay informed with the latest menu updates from your favorite messes.",
              gradient: "bg-gradient-to-r from-purple-500 to-pink-500",
            },
            {
              title: "Pre-Booking Made Easy",
              description:
                "Reserve meals in advance and never worry about availability.",
              gradient: "bg-gradient-to-r from-purple-500 to-pink-500",
            },
            {
              title: "Top-Rated Recommendations",
              description:
                "Explore the best-rated messes in your area, backed by community reviews.",
              gradient: "bg-gradient-to-r from-purple-500 to-pink-500",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className={`text-white p-4 rounded-lg shadow-lg text-center w-96 ${feature.gradient}`}
            >
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
      {/* Testimonial Section */}
      {/* Dynamic Stats Section */}
      <motion.section
        className="flex justify-around py-6 bg-gradient-to-r from-purple-500 to-pink-500 mt-10 text-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
      >
        {[
          { label: "Total Messes", value: stats.totalMesses },
          { label: "Meals Pre-Booked", value: stats.mealsPreBooked },
          { label: "Average Rating", value: stats.avgRating },
        ].map((stat, index) => (
          <motion.div
            key={index}
            className="text-center"
            custom={index}
            variants={circleVariants}
          >
            <h3 className=" text-lg sm:text-3xl font-bold">
              <CountUp
                end={
                  typeof stat.value === "string"
                    ? parseFloat(stat.value)
                    : stat.value
                }
                duration={2}
                decimals={stat.label === "Average Rating" ? 1 : 0}
              />
              {stat.label === "Average Rating" && "/5"}
            </h3>
            <p className="text-sm ">{stat.label}</p>
          </motion.div>
        ))}
      </motion.section>

      <section className=" py-16 px-8">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl font-semibold text-center">
            What Our Users Say
          </h2>
          <p className="text-xl mt-4">
            Real experiences and feedback from our happy users.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          {[
            {
              name: "Rakesh Sharma",
              feedback:
                "MessBuddy has completely changed how I plan my meals. From discovering new messes to easily pre-booking meals, this website has made my life so much easier.",
              rating: "4.9★",
            },
            {
              name: "Harshal Gayakwad",
              feedback:
                "As a student, I can explore various messes and pre-book meals hassle-free, while my friend who run a canteen find it super convenient to update their menus and track feedback.",
              rating: "5★",
            },
            {
              name: "Raj Kumar",
              feedback:
                "The pre-booking feature is my favorite. It saves me so much time and ensures I never miss out on my favorite dishes. I also love how the app showcases the best-rated messes.",
              rating: "4.8★",
            },
          ].map((testimonial, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-between p-8 bg-white text-black rounded-lg shadow-lg h-68 sm:h-80 w-64 sm:w-80"
            >
              <div className="text-center">
                <h4 className=" text-lg sm:text-2xl font-bold">
                  {testimonial.name}
                </h4>
                <p className="text-sm sm:text-lg mt-6">
                  {testimonial.feedback}
                </p>
              </div>
              <div className="text-yellow-500 text-xl font-bold">
                {testimonial.rating}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
