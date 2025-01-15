import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import MenuCard from "../components/MenuCard";
import { Button } from "flowbite-react";
import axios from "axios";
import heroImage from "../assets/images/hero.jpg";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import Header from "../components/Header";
import Feedback from "../components/feedback";
import { LuCirclePlus, LuCircleMinus } from "react-icons/lu";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function Home() {
  const location = useLocation();

  const [activeIndex, setActiveIndex] = useState(null);
  const [isHeaderTransparent, setIsHeaderTransparent] = useState(true);
  const [messes, setMesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booklength, setBooklength] = useState(0);
  const [stats, setStats] = useState({
    totalMesses: 0,
    mealsPreBooked: 0,
    avgRating: "0/5",
  });

  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [location]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setIsHeaderTransparent(false);
      } else {
        setIsHeaderTransparent(true);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/prebooking`
        );
        setBooklength(res.data.prebooking.length);
      } catch (error) {
        console.error("Failed to fetch bookings:", error);
      }
    };

    const fetchMesses = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/mess`
        );
        setMesses(res.data.messes);
        setLoading(false);

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
          mealsPreBooked: booklength,
          avgRating: `${avgRating.toFixed(1)}/5`,
        });
      } catch (error) {
        console.error("Failed to fetch messes:", error);
        setLoading(false);
      }
    };

    fetchMesses();
    fetchBookings();
  }, [booklength]);

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

  const toggleAnswer = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "What is MessBuddy?",
      answer:
        "MessBuddy is an innovative platform designed to enhance dining experiences by allowing users to explore mess menus, pre-book meals, and discover highly rated dining options.",
    },
    {
      question: "How does the pre-booking feature work?",
      answer:
        "Simply browse the available menu items, select your preferred meal, and confirm your booking. Your meal will be reserved and ready when you arrive.",
    },
    {
      question: "Can mess owners update menus in real time?",
      answer:
        "Yes, mess owners can easily update menus in real time through their dedicated dashboard, ensuring diners always see the latest options.",
    },
    {
      question: "Is MessBuddy free to use?",
      answer:
        "Yes! MessBuddy offers free access to its features, including menu browsing and meal pre-booking.",
    },
  ];

  return (
    <div className="w-full font-rubik">
      {/* header */}
      <Header transparent={isHeaderTransparent} />
      {/* Hero Section */}
      <section className="h-[100vh] w-full relative flex flex-col lg:flex-row justify-center items-center text-center lg:text-left px-4 py-8 max-w-screen overflow-hidden mb-10">
        <div
          className="absolute inset-0 bg-cover bg-center overflow-hidden"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>
        <div className="absolute inset-0 bg-gray-700 opacity-70"></div>
        <div className="relative z-10 flex justify-center flex-col items-center text-white">
          <motion.h1
            className="mt-9 font-poppins text-3xl font-black mb-4 md:text-5xl text-center"
            initial={{ opacity: 0, scale: 1 }} // Scale-up and fade-in effect
            animate={{
              opacity: 1,
              scale: 1,
              y: [0, -15, 0, 10, 0], // Floating effect
              color: ["#f87171", "#fb923c", "#facc15", "#f87171"],
            }}
            transition={{
              duration: 1,
              ease: "easeOut",
              y: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              },
              color: {
                duration: 7, // Color transition duration
                repeat: Infinity, // Continuous color cycling
                ease: "linear",
              },
            }}
          >
            Seamless Meals, Smarter Choices
          </motion.h1>
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
      <section
        id="topratedmess"
        className="w-full p-3 flex flex-col items-center justify-center gap-1 py-2 max-w-screen overflow-hidden"
      >
        {loading ? (
          // Skeleton Loader during loading
          <div className="flex flex-col items-center justify-center text-black dark:text-white min-h-screen">
            <h2 className="dark:text-white text-black font-poppins text-3xl font-semibold text-center">
              Best Rated Messes
            </h2>
            <p className="dark:text-gray-300 text-black text-lg text-center max-w-3xl mt-2 mb-10 font-rubik">
              Loading the top messes offering great meals and trusted ratings
              from the community...
            </p>
            <div className="flex flex-wrap justify-center gap-14 mb-10">
              {[...Array(4)].map((_, index) => (
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
          </div>
        ) : topMesses && topMesses.length > 0 ? (
          // Actual messes when data is available
          <div className="flex flex-col items-center justify-center text-black dark:text-white min-h-screen">
            <h2 className="dark:text-white text-black font-poppins text-3xl font-semibold text-center">
              Best Rated Messes
            </h2>
            <p className="dark:text-gray-300 text-black text-lg text-center max-w-3xl mt-2 mb-10 font-rubik">
              Explore the top messes offering great meals and trusted ratings
              from the community.
            </p>
            <div className="flex flex-wrap justify-center gap-14 mb-10">
              {topMesses.map((mess) => (
                <MenuCard key={mess._id} menu={mess} />
              ))}
            </div>
          </div>
        ) : (
          // Message when no messes are available
          <div className="flex flex-col items-center justify-center text-black dark:text-white min-h-screen">
            <h2 className="dark:text-white text-black font-poppins text-3xl font-semibold text-center">
              Best Rated Messes
            </h2>
            <p className="dark:text-gray-300 text-black text-lg text-center max-w-3xl mt-2 mb-10 font-rubik">
              Explore the top messes offering great meals and trusted ratings
              from the community.
            </p>
            <p className="dark:text-gray-400 text-black text-lg text-center max-w-3xl mt-2 mb-10 font-rubik">
              No messes available at the moment. Please check back later.
            </p>
          </div>
        )}
      </section>
      ;{/* Features Section */}
      <section className="min-h-screen bg-white dark:bg-gray-800 py-10 px-6 rounded-lg max-w-screen overflow-hidden mt-12 font-rubik ">
        <div className="text-center mb-8">
          <h2 className="text-black dark:text-white text-3xl font-semibold font-poppins">
            Why Choose MessBuddy?
          </h2>
          <h1 className="text-black dark:text-gray-300 text-lg mt-2 ">
            Our platform is designed to make your dining experience seamless and
            enjoyable.
          </h1>
        </div>
        <div className="flex flex-wrap justify-center gap-10 max-w-7xl mx-auto mb-12">
          {[
            {
              title: "Real-Time Menu Updates",
              description:
                "Access live updates of your favorite mess menus anytime, ensuring you're always informed about available dishes. Avoid the hassle of outdated or unavailable menu options with our real-time system.",
              icon: "🍴",
              link: "/search",
            },
            {
              title: "Pre-Booking Made Easy",
              description:
                "Effortlessly reserve your meals in advance to save time and guarantee availability. Our intuitive pre-booking feature lets you plan your meals ahead, making dining stress-free and efficient.",
              icon: "📅",
              link: "/prebooking",
            },
            {
              title: "Top-Rated Recommendations",
              description:
                "Explore the highest-rated messes in your area, backed by genuine reviews from real users. Discover quality dining options and make informed choices with the help of community feedback.",
              icon: "⭐",
              link: "/",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-900  flex flex-col items-center text-center p-6 border rounded-lg shadow-md transform transition-transform hover:scale-105 hover:shadow-xl cursor-pointer  w-full sm:w-80 m-4"
            >
              <div className="text-gray-900 dark:text-white text-3xl mb-4">
                {feature.icon}
              </div>
              <h3 className="text-gray-700 dark:text-white text-lg font-semibold">
                {feature.title}
              </h3>
              <p className="text-gray-500 dark:text-white mt-2 text-justify">
                {feature.description}
              </p>
              <motion.div
                className="text-right bottom-4 right-4"
                whileTap={{
                  scale: 1,
                  rotate: -10,
                  transition: { type: "spring", stiffness: 300 },
                }}
              >
                <Link
                  to={feature.link}
                  onClick={(e) => {
                    const targetElement =
                      document.getElementById("topratedmess");
                    if (targetElement) {
                      targetElement.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }
                  }}
                  className="text-blue-500 text-md font-semibold"
                >
                  Click Here
                </Link>
              </motion.div>
            </div>
          ))}
        </div>
      </section>
      {/* Dynamic Stats Section */}
      <section className="max-w-screen overflow-hidden mb-12 font-poppins ">
        <motion.section
          className="relative flex justify-around py-6 bg-gradient-to-r from-purple-500 to-pink-500 mt-10 text-white overflow-hidden"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={{
            visible: { transition: { staggerChildren: 0.2 } },
            hidden: {},
          }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-300 to-purple-400 opacity-40 blur-lg"
            animate={{
              scale: [1, 1.05, 1],
              x: [-10, 10, -10],
              y: [-10, 10, -10],
            }}
            transition={{
              repeat: Infinity,
              repeatType: "reverse",
              duration: 10,
            }}
          />

          {[
            { label: "Total Messes", value: stats.totalMesses },
            { label: "Meals Pre-Booked", value: stats.mealsPreBooked },
            { label: "Average Rating", value: stats.avgRating },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="relative text-center"
              custom={index}
              variants={{
                hidden: (i) => ({
                  opacity: 0,
                  x: i === 0 ? -50 : i === 1 ? 0 : 50,
                }),
                visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
              }}
              whileHover={{
                scale: 1.05,
                transition: { duration: 0.3 },
              }}
              animate={{
                y: [0, -7, 0],
                transition: {
                  repeat: Infinity,
                  repeatType: "reverse",
                  duration: 2,
                },
              }}
            >
              <h3 className="text-lg sm:text-3xl font-bold">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{
                    duration: 0.3,
                    times: [0.8, 1],
                    delay: 2.5,
                  }}
                >
                  <CountUp
                    end={
                      typeof stat.value === "string"
                        ? parseFloat(stat.value)
                        : stat.value
                    }
                    duration={6}
                    decimals={stat.label === "Average Rating" ? 1 : 0}
                  />
                  {stat.label === "Average Rating" && "/5"}
                </motion.div>
              </h3>
              <p className="text-sm mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </motion.section>
      </section>
      {/* Testimonials Section */}
      {/* <section className=" py-16 px-8 bg-white dark:bg-[#1E1E2F]">
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
              className="flex flex-col items-center justify-between p-8 dark:bg-gray-700 border dark:text-white border-black text-black rounded-xl shadow-lg h-68 sm:h-80 w-64 sm:w-80"
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
      </section> */}
      <Feedback />
      {/* FAQ Section */}
      <section className="min-h-screen py-12 px-6 bg-gray-100 dark:bg-[#1E1E2F] font-rubik">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="font-poppins text-3xl font-semibold text-black dark:text-white mb-6 ">
            Frequently Asked Questions
          </h2>
          <p className="text-black dark:text-gray-300 text-lg mb-10 max-w-4xl mx-auto font-rubik">
            Have questions? Find answers to the most commonly asked questions
            about MessBuddy and its features below.
          </p>
          <div className="space-y-4 max-w-2xl mx-auto">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border-b-2 border-black dark:border-gray-700  relative "
              >
                <button
                  onClick={() => toggleAnswer(index)}
                  className="w-full text-left p-4 flex justify-between items-center text-gray-900 dark:text-gray-100"
                >
                  <span className="text-lg font-medium">{faq.question}</span>
                  <span className=" absolute right-0 b h-6 w-6">
                    {activeIndex === index ? (
                      <LuCircleMinus className="h-full w-full" />
                    ) : (
                      <LuCirclePlus className="h-full w-full" />
                    )}
                  </span>
                </button>
                {activeIndex === index && (
                  <div className="p-2 text-gray-700 dark:text-gray-300 text-base ml-4 text-justify">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
