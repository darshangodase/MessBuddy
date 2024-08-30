import React from 'react';
import { useSelector } from 'react-redux';
import { Outlet, Navigate } from 'react-router-dom';

function PrivateRouteAdminOnly() {
  const { currentUser } = useSelector((state) => state.user);
  
  return currentUser? <Outlet /> : <Navigate to='/signin' />;
}

export default PrivateRouteAdminOnly;