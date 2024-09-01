import { Avatar, Button, Dropdown, Navbar, TextInput } from "flowbite-react";
import { Link, useLocation } from "react-router-dom";
import { AiOutlineSearch, AiOutlinePlus } from "react-icons/ai";
import { FaMoon, FaSun } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { toggleTheme } from "../redux/theme/themeSlice";
import { signoutsuccess } from "../redux/user/userSlice";

function Header() {
  const path = useLocation().pathname;
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const { theme } = useSelector((state) => state.theme);

  const handlesignout = async () => {
    try {
      const res = await fetch(`/api/user/signout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (res.ok) {
        dispatch(signoutsuccess(data));
      } else {
        setErrorMessage("User signout failed");
      }
    } catch (error) {
      setErrorMessage("User signout failed");
    }
  };

  return (
    <Navbar className="border-b-2">
      <Link
        to="/"
        className="self-center whitespace-nowrap text-sm sm:text-xl font-semibold dark:text-white">
        <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-2 py-1 rounded-md text-white">
          BlogBreeze
        </span>
      </Link>

      <form>
        <TextInput
          type="text"
          placeholder="Search..."
          rightIcon={AiOutlineSearch}
          className="hidden text-bold lg:inline"
        />
      </form>

      <Button className="w-12 h-10 lg:hidden" color="gray" pill>
        <AiOutlineSearch />
      </Button>

      <div className="flex gap-5 md:order-2">
        <Button className="w-12 h-10 hidden sm:inline" color="gray" pill onClick={() => dispatch(toggleTheme())}>
          {theme === 'light' ? <FaMoon /> : <FaSun />}
        </Button>
        {currentUser ? (
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <Avatar alt='user' img={currentUser.profilePicture} rounded className="object-cover" />
            }
          >
            <Dropdown.Header>
              <span className='block text-sm'>@{currentUser.username}</span>
              <span className='block text-sm font-medium truncate'>
                {currentUser.email}
              </span>
            </Dropdown.Header>
            <Link to={'/dashboard?tab=profile'}>
              <Dropdown.Item>Profile</Dropdown.Item>
            </Link>
            <Dropdown.Divider />
            <Dropdown.Item onClick={() => dispatch(toggleTheme())}>
              {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={handlesignout}>Sign out</Dropdown.Item>
          </Dropdown>
        ) : (
          <Link to="/signin">
            <Button gradientDuoTone="purpleToBlue" outline>Sign In</Button>
          </Link>
        )}

        <Navbar.Toggle />
      </div>

  <Navbar.Collapse >
  <Navbar.Link className="mt-2" active={path === '/'} as={'div'}>
    <Link to="/" className="text-lg">Home</Link>
  </Navbar.Link>
  <Navbar.Link className="mt-2" active={path === '/about'} as={'div'}>
    <Link to="/about" className="text-lg ">About</Link>
  </Navbar.Link>

  {currentUser && (
    <Navbar.Link className=" hidden md:block"active={path === '/create-post'} as={'div'}>
      <Link to="/create-post">
        <Button type="submit" gradientDuoTone="purpleToPink" outline>
           Create Post
        </Button>
      </Link>
    </Navbar.Link>
  )}
</Navbar.Collapse>
    </Navbar>
  );
}

export default Header;