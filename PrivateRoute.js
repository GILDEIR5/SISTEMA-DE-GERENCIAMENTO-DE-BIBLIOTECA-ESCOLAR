import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './contexts/authContext';

function PrivateRoute() {
    const { currentUser } = useAuth();

    return currentUser ? <Outlet /> : <Navigate to="/LoginPage" />;
}

export default PrivateRoute;
