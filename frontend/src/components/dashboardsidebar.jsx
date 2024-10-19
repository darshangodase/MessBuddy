import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signoutsuccess } from '../redux/user/userSlice';
import axios from 'axios';
import { Sidebar } from 'flowbite-react';
import { HiUser, HiArrowSmRight, HiTrash } from 'react-icons/hi';
import toast from 'react-hot-toast';

function DashboardSidebar() {
  const location = useLocation();
  const dispatch = useDispatch();
  const [tab, setTab] = useState();
  const currentUser = useSelector((state) => state.user.currentUser);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get("tab");
    if (tabFromUrl) {
      setTab(tabFromUrl);
    }
  }, [location.search]);

  const handleSignout = async () => {
    try {
      const res = await axios.post(`http://localhost:3000/api/user/signout`, {}, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });
      if (res.status === 200) {
        dispatch(signoutsuccess());
      } else {
        toast.error('Signout failed:');
      }
    } catch (error) {
      toast.error('Signout error:');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        const res = await axios.delete(`http://localhost:3000/api/user/delete-account/${currentUser._id}`, {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        });
        if (res.status === 200) {
          dispatch(signoutsuccess());
          toast.success('Account deleted successfully');
        } else {
          toast.error('Delete account failed:');
        }
      } catch (error) {
        toast.error('Delete account error:');
      }
    }
  };

  return (
    <Sidebar className="bg-slate-300 text-white h-full w-full">
      <Sidebar.Items>
        <Sidebar.ItemGroup className='grid gap-2'>
          <Link to="/dashboard?tab=profile">
            <Sidebar.Item
              active={tab === "profile"}
              icon={HiUser}
              as="div">
              Profile
            </Sidebar.Item>
          </Link>

          <Link to="/dashboard?tab=menu">
            <Sidebar.Item
              active={tab === "menu"}
              icon={HiUser}
              as="div">
              Menu
            </Sidebar.Item>
          </Link>

          <Sidebar.Item icon={HiArrowSmRight} onClick={handleSignout}>
            Sign Out
          </Sidebar.Item>

          <Sidebar.Item icon={HiTrash} onClick={handleDeleteAccount}>
            Delete Account
          </Sidebar.Item>
        </Sidebar.ItemGroup>
      </Sidebar.Items>
    </Sidebar>
  );
}

export default DashboardSidebar;