import React from 'react'
import { Navigate } from 'react-router-dom'

export const LandingPageRedirect = () => {
    return <Navigate to="/note" replace />;
}
