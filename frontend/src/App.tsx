import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Compose } from './pages/Compose';
import { ScheduledEmails, SentEmails } from './pages/EmailLists';

const PrivateRoute = ({ children }: any) => {
    const user = localStorage.getItem('user');
    return user ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/" element={
                <PrivateRoute>
                    <Layout />
                </PrivateRoute>
            }>
                <Route index element={<Navigate to="/compose" replace />} />
                <Route path="compose" element={<Compose />} />
                <Route path="scheduled" element={<ScheduledEmails />} />
                <Route path="sent" element={<SentEmails />} />
            </Route>
        </Routes>
    );
}

export default App;
