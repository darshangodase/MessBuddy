import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import MenuCard from "../components/MenuCard";
import { Button } from "flowbite-react";
import { HashLoader } from "react-spinners";
import axios from "axios";
import heroImage from "../assets/images/hero.jpg";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import Header from "../components/Header";
import { LuCirclePlus,LuCircleMinus } from "react-icons/lu";


export default function Home() {
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
  const headingVariants = {
    hidden: { opacity: 0, y: -100 }, // Start above with opacity 0
    visible: {
      opacity: 1,
      y: 0, // Moves to its original position
      transition: {
        duration: 1, // Animation duration
        type: "easeIn", // Adds a spring-like bounce
      },
    },
  };

  const circleVariants = {
    hidden: { opacity: 0, x: 50, y: 50 },
    visible: (index) => ({
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 1,
        delay: index * 0.3,
        type: "easeIn",
      },
    }),
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setIsHeaderTransparent(false);
      } else {
        setIsHeaderTransparent(true);
      }
    };

    // Attach the scroll event listener
    window.addEventListener("scroll", handleScroll);

    // Cleanup the event listener on component unmount
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
  
    const toggleAnswer = (index) => {
      setActiveIndex(activeIndex === index ? null : index); 
    };

  return (
    <div className="w-full">
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
            className="mt-9 font-serif text-3xl font-black mb-4 md:text-5xl text-red-400 text-center"
            variants={headingVariants}
            initial="hidden"
            animate="visible"
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
      <section className="w-full p-3 flex flex-col items-center gap-3 py-7 max-w-screen overflow-hidden">
        {loading ? (
          <div className="flex justify-center min-h-screen">
            <HashLoader color="#35c9e1" />
          </div>
        ) : topMesses && topMesses.length > 0 ? (
          <div className="flex flex-col  items-center text-black dark:text-white">
            <h2 className="font-serif text-3xl font-semibold text-center">
              Best Rated Messes
            </h2>
            <p className="text-lg text-center max-w-3xl mt-2 mb-10 font-serif">
              Explore the top messes offering great meals and trusted ratings
              from the community.
            </p>
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
      <section className="bg-white dark:bg-[#1E1E2F] py-10 px-6 rounded-lg max-w-screen overflow-hidden mt-12 " >
        <div className="text-center mb-8">
          <h2 className="text-black dark:text-white text-3xl font-semibold font-serif">
            Why Choose MessBuddy?
          </h2>
          <h1 className="text-black dark:text-white text-lg mt-2 font-serif">
            Our platform is designed to make your dining experience seamless and
            enjoyable.
          </h1>
        </div>
        <div className="flex flex-wrap justify-center gap-10 max-w-7xl mx-auto mb-10">
          {[
            {
              title: "Real-Time Menu Updates",
              description:
                "Access live updates of your favorite mess menus anytime, ensuring you're always informed about available dishes. Avoid the hassle of outdated or unavailable menu options with our real-time system.",
              icon: "🍴", // Replace with your desired icon
            },
            {
              title: "Pre-Booking Made Easy",
              description:
                "Effortlessly reserve your meals in advance to save time and guarantee availability. Our intuitive pre-booking feature lets you plan your meals ahead, making dining stress-free and efficient.",
              icon: "📅", // Replace with your desired icon
            },
            {
              title: "Top-Rated Recommendations",
              description:
                "Explore the highest-rated messes in your area, backed by genuine reviews from real users. Discover quality dining options and make informed choices with the help of community feedback.",
              icon: "⭐", // Replace with your desired icon
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-700  flex flex-col items-center text-center p-6 border rounded-lg shadow-md transform transition-transform hover:scale-105 hover:shadow-xl cursor-pointer  w-full sm:w-80"
            >
              <div className="text-gray-900 dark:text-white text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-gray-700 dark:text-white text-lg font-semibold">
                {feature.title}
              </h3>
              <p className="text-gray-500 dark:text-white mt-2 text-justify">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    
      {/* Dynamic Stats Section */}
      <section className=" max-w-screen overflow-hidden mb-10 font-serif">
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
                  duration={6}
                  decimals={stat.label === "Average Rating" ? 1 : 0}
                />
                {stat.label === "Average Rating" && "/5"}
              </h3>
              <p className="text-sm mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </motion.section>
      </section>

      <section className=" py-16 px-8 bg-white dark:bg-[#1E1E2F]">
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
      </section>


      {/* FAQ Section */}
      <section className="py-12 px-6 bg-gray-100 dark:bg-[#1E1E2F] ">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="font-serif text-3xl font-semibold text-black dark:text-white mb-6 ">
          Frequently Asked Questions
        </h2>
        <p className="text-gray-700 dark:text-gray-300 text-lg mb-10 max-w-4xl mx-auto font-serif">
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
                <span className=" absolute right-0 b h-6 w-6">{activeIndex === index ? <LuCircleMinus className="h-full w-full"/>: <LuCirclePlus className="h-full w-full"/>}</span>
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
