import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PrivateRoute from './components/privateroute';
import Home from './pages/Home';
import About from './pages/About';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Search from './pages/search';
import MessMenu from './pages/MessMenu';
import Header from './components/Header';
import Footer from './components/footer';
import ScrollToTop from './components/scrollToTop';
import PrebookingForm from './components/PrebookingForm';

import toast, { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <div className="">
        <Toaster position="top-center" />
      </div>
      <BrowserRouter>
        <ScrollToTop />
        <Header />
        <Routes>
          <Route path="/" exact element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/search" element={<Search />} />
          <Route path="/mess/:messId" element={<MessMenu />} />
          <Route element={<PrivateRoute />}>
            <Route path="/prebooking" element={<PrebookingForm />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
        </Routes>
        <Footer />
      </BrowserRouter>
    </>
  );
}

export default App;