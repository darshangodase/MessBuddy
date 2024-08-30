import React from 'react';
import {BrowserRouter ,Routes,Route} from 'react-router-dom';
import PrivateRoute from './components/privateroute';
import Privateroute_admin_only from './components/privateroute_admin_only';
import Home from './pages/Home';
import About from './pages/About';
import SignIn from './pages/SignIn';
import SignUP from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Header from './components/Header';
import Footer from './components/footer';
import CreatePost from './pages/create_post';
import UpdatePost from './pages/updatePost';
import PostPage from './pages/postPage';
function App() {
  

  return (
       <BrowserRouter>
         <Header/>
        <Routes>
          <Route path="/" exact element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUP />} />

          <Route element={<PrivateRoute/>} >
          <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          <Route  element={<Privateroute_admin_only />}>
          <Route path="/create-post" element={<CreatePost />} />
          <Route path='/update-post/:postId' element={<UpdatePost />} />
          </Route>

          <Route path='/post/:postSlug' element={<PostPage />} />
        </Routes>
        <Footer/>
       </BrowserRouter>
  )
} 

export default App
