import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Dashboardsidebar from '../components/dashboardsidebar';
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
        {/* {tab === 'profile' && <Dashboardprofile />} */}
      </div>
    </div>
  );
}

export default Dashboard;