import React, { useEffect, useState } from 'react'
import {Link, useLocation} from 'react-router-dom'
import {Sidebar,} from 'flowbite-react'
import {HiUser, HiArrowSmRight} from 'react-icons/hi'
function dashboardsidebar() {
  const location=useLocation();
  const [tab,settab]=useState();

  useEffect(()=>{
    const urlparams=new URLSearchParams(location.search)
    const tabformurl=urlparams.get('tab')
    if(tabformurl)
    {
      settab(tabformurl)
    }
  },[location.search])
  return (
    <Sidebar className='w-full md:w-56'>
      <Sidebar.Items>
        <Sidebar.ItemGroup>
          <Link to='/dashboard?tab=profile'>
          <Sidebar.Item active={tab==="profile"} icon={HiUser} label={'User'} labelColor="dark"as='div'>
            Profile
            </Sidebar.Item>
          </Link>
          <Sidebar.Item icon={HiArrowSmRight} >
                Sign Out
            </Sidebar.Item>
        </Sidebar.ItemGroup>
      </Sidebar.Items>
    </Sidebar>
  )
}

export default dashboardsidebar
