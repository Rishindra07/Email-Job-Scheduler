import { GoogleOAuthProvider } from '@react-oauth/google';
import React from 'react';

// Replace with your actual Client ID in .env
const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"; // Placed here for now, should be env

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            {children}
        </GoogleOAuthProvider>
    );
};
