import React, { useEffect, useState } from 'react'
import {Link, useLocation} from 'react-router-dom'
import {Sidebar,} from 'flowbite-react'
import { signoutsuccess } from "../redux/user/userSlice"; 
import {HiUser, HiArrowSmRight} from 'react-icons/hi'
import {useSelector ,useDispatch} from "react-redux";

function dashboardsidebar() {


  const location=useLocation();
  const [tab,settab]=useState();
  const [errorMessage, setErrorMessage] = useState(null);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);

  useEffect(()=>{
    const urlparams=new URLSearchParams(location.search)
    const tabformurl=urlparams.get('tab')
    if(tabformurl)
    {
      settab(tabformurl)
    }
  },[location.search])

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
    <Sidebar className='w-full md:w-56'>
      <Sidebar.Items>
        <Sidebar.ItemGroup>
          <Link to='/dashboard?tab=profile'>
          <Sidebar.Item active={tab==="profile"} icon={HiUser} label={'User'} labelColor="dark"as='div'>
            Profile
            </Sidebar.Item>
          </Link>
          <Sidebar.Item icon={HiArrowSmRight} onClick={handlesignout} >
                Sign Out
            </Sidebar.Item>
        </Sidebar.ItemGroup>
      </Sidebar.Items>
    </Sidebar>
  )
}

export default dashboardsidebar
