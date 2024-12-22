import { Avatar, Button, Dropdown, Navbar } from "flowbite-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaMoon, FaSun } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { toggleTheme } from "../redux/theme/themeSlice";
import { signoutsuccess } from "../redux/user/userSlice";

function Header({ transparent = false }) {
  const path = useLocation().pathname;
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const { theme } = useSelector((state) => state.theme);

 
  const handleSignOut = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/signout`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (res.ok) {
        dispatch(signoutsuccess(data));
      } else {
        console.error("User signout failed");
      }
    } catch (error) {
      console.error("User signout failed");
    }
  };

  return (
    <Navbar className={`w-full z-50  ${
      transparent ? "bg-transparent text-white dark:bg-transparent fixed top-0 shadow-xl" : "bg-white text-black shadow-md"
    }`}>
      <Link
        to="/"
        className="self-center whitespace-nowrap text-sm sm:text-xl font-semibold dark:text-white"
      >
        <span className="bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-1 rounded-md text-white">
          MessBuddy
        </span>
      </Link>
      <div className="flex gap-5 md:order-2 z-30">
        <Button
          className={` w-12 h-10 hidden sm:inline ${transparent ? "dark:bg-slate-800 " : ""}`}
          color="gray"
          pill
          onClick={() => dispatch(toggleTheme())}
        >
          {theme === "light" ? <FaMoon /> : <FaSun className="text-white" />}
        </Button>
        {currentUser ? (
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <Avatar
                alt="user"
                img={currentUser.profilePicture}
                rounded
                className="object-cover"
              />
            }
          >
            <Dropdown.Header>
              <span className="block text-sm">@{currentUser.username}</span>
              <span className="block text-sm font-medium truncate">
                {currentUser.email}
              </span>
            </Dropdown.Header>
            <Link to={"/dashboard?tab=profile"}>
              <Dropdown.Item>Profile</Dropdown.Item>
            </Link>
            <Dropdown.Divider />
            <Link to={"/prebookings"}>
              <Dropdown.Item>Prebookings</Dropdown.Item>
            </Link>
            <Dropdown.Divider />
            <Dropdown.Item onClick={() => dispatch(toggleTheme())}>
              {theme === "light" ? "Dark Mode" : "Light Mode"}
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={handleSignOut}>Sign out</Dropdown.Item>
          </Dropdown>
        ) : (
          <Link to="/signin">
            <Button gradientDuoTone="purpleToPink">
              Sign In
            </Button>
          </Link>
        )}
        <Navbar.Toggle />
      </div>
      <Navbar.Collapse className={`${transparent ? " bg-white md:bg-transparent text-black" : ""}`}>
        <Navbar.Link className="mt-2" active={path === "/"} as={"div"}>
          <Link to="/" className={` text-lg ${transparent ? "md:text-teal-500 font-bold" : ""}`}>
            Home
          </Link>
        </Navbar.Link>
        <Navbar.Link className="mt-2" active={path === "/about"} as={"div"}>
          <Link to="/about" className={` text-lg ${transparent ? "md:text-white" : ""}`}>
            About
          </Link>
        </Navbar.Link>
        <Navbar.Link className="mt-2" active={path === "/prebooking"} as={"div"}>
          <Link to="/prebooking" className={` text-lg ${transparent ? "md:text-white" : ""}`}>
            Prebooking
          </Link>
        </Navbar.Link>
        <Navbar.Link className="mt-2" active={path === "/prebooking"} as={"div"}>
          <Link to="/prebooking" className={` text-lg ${transparent ? "md:text-white" : ""}`}>
            Support
          </Link>
        </Navbar.Link>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default Header;
