import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Sidebar } from "flowbite-react";
import { signoutsuccess } from "../redux/user/userSlice";
import { HiUser, HiArrowSmRight, HiDocumentText ,HiChartPie} from "react-icons/hi";
import { useSelector, useDispatch } from "react-redux";

function Dashboardsidebar() {
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
      const res = await fetch(`http://localhost:3000/api/user/signout`, {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
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
    <Sidebar className="w-full md:w-56">
      <Sidebar.Items>

        <Sidebar.ItemGroup className="flex flex-col gap-1">

          <Link to="/dashboard?tab=profile">
            <Sidebar.Item
              active={tab === "profile"}
              icon={HiUser}
              as="div">
              Profile
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

export default Dashboardsidebar;
