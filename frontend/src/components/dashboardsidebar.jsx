import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signoutsuccess } from '../redux/user/userSlice';
import axios from 'axios';
import { Sidebar } from 'flowbite-react';
import { HiUser, HiArrowSmRight } from 'react-icons/hi';

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
        console.error('Signout failed:', res.data.message);
      }
    } catch (error) {
      console.error('Signout error:', error);
    }
  };

  return (
    <Sidebar className="bg-slate-300 text-white h-full">
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

          <Link to="/dashboard?tab=add-mess">
            <Sidebar.Item
              active={tab === "add-mess"}
              icon={HiUser}
              as="div">
              Add Mess
            </Sidebar.Item>
          </Link>

          <Link to="/dashboard?tab=manage-mess">
            <Sidebar.Item
              active={tab === "manage-mess"}
              icon={HiUser}
              as="div">
              Manage Mess
            </Sidebar.Item>
          </Link>

          <Sidebar.Item icon={HiArrowSmRight} onClick={handleSignout}>
            Sign Out
          </Sidebar.Item>
        </Sidebar.ItemGroup>
      </Sidebar.Items>
    </Sidebar>
  );
}

export default DashboardSidebar;