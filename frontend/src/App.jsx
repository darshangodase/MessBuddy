import React, { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import PrivateRoute from "./components/privateroute";
import Home from "./pages/Home";
import About from "./pages/About";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import Search from "./pages/search";
import MessMenu from "./pages/MessMenu";
import Header from "./components/Header";
import Footer from "./components/footer";
import ScrollToTop from "./components/scrollToTop";
import PrebookingForm from "./components/PrebookingForm";
import PrebookingsPage from "./pages/PrebookingPage";
import Subscriptions from "./pages/Subscriptions";
import Community from './pages/Community';
import ScannerDashboard from './pages/ScannerDashboard';
import MealPass from './pages/MealPass';

import toast, { Toaster } from "react-hot-toast";
import { useSelector } from "react-redux";

const UserOnlyRoute = ({ children }) => {
  const currentUser = useSelector((state) => state.user.currentUser);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser && currentUser.Login_Role !== "User") {
      toast.error("This feature is only available for users");
      navigate("/");
    }
  }, [currentUser, navigate]);

  return currentUser && currentUser.Login_Role === "User" ? children : null;
};

function App() {
  const location = useLocation();
  const hideNavbarPaths = ["/"];

  return (
    <>
      <div className="">
        <Toaster position="top-center" />
      </div>
      <ScrollToTop />
      {/* Conditionally render the Header */}
      {!hideNavbarPaths.includes(location.pathname) && <Header />}
      <Routes>
        <Route path="/" exact element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/community" element={<Community />} />

        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/search" element={<Search />} />
        <Route path="/mess/:messId" element={<MessMenu />} />
        <Route
          path="/prebooking"
          element={
            <UserOnlyRoute>
              <PrebookingForm />
            </UserOnlyRoute>
          }
        />
        <Route
          path="/prebookings"
          element={
            <UserOnlyRoute>
              <PrebookingsPage />
            </UserOnlyRoute>
          }
        />
        <Route
          path="/subscriptions"
          element={
            <UserOnlyRoute>
              <Subscriptions />
            </UserOnlyRoute>
          }
        />
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/scanner" element={<ScannerDashboard />} />
        </Route>
        <Route path="/meal-pass" element={<UserOnlyRoute><MealPass /></UserOnlyRoute>} />
      </Routes>
      <Footer />
    </>
  );
}

function RootApp() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

export default RootApp;
