import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AuthProvider } from './contexts/authContext';
import './index.css';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
    <AuthProvider>
        <App />
    </AuthProvider>
);
