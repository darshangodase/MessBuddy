import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Dashboardsidebar from '../components/dashboardsidebar';
import MessForm from '../components/MessForm';
import Menu from '../components/Menu';
import MessPrebookingsPage from '../components/MessPrebookingsPage';


function Dashboard() {
  const location = useLocation();
  const [tab, settab] = useState();

  useEffect(() => {
    const urlparams = new URLSearchParams(location.search);
    const tabformurl = urlparams.get('tab');
    if (tabformurl) {
      settab(tabformurl);
    }
  }, [location.search]);

  return (
    <div className='min-h-screen flex flex-col md:flex-row overflow-x-hidden'>
      <div className="md:w-56">
        <Dashboardsidebar />
      </div>
      <div className="flex-1 flex justify-center items-center overflow-x-auto">
        {tab === 'profile' && <MessForm />}
        {tab === 'menu' && <Menu />}
        {tab === 'Prebookings' && <MessPrebookingsPage />}
      </div>
    </div>
  );
}

export default Dashboard;