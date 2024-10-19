import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = () => {
  const currentUser = useSelector((state) => state.user.currentUser);

  if (!currentUser) {
    return <Navigate to="/signin" />;
  }

  if (currentUser.Login_Role !== 'Mess Owner') {
    return <Navigate to="/" />;
  }

  return <Outlet />;
};

export default PrivateRoute;