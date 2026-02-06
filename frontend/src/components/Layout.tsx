import { Link, Outlet, useNavigate } from 'react-router-dom';
import { googleLogout } from '@react-oauth/google';
import { LayoutDashboard, Mail, Send, LogOut } from 'lucide-react';

const SidebarItem = ({ to, icon, label }: { to: string, icon: any, label: string }) => {
    return (
        <Link to={to} className="nav-item">
            {icon}
            <span>{label}</span>
        </Link>
    );
};

export const Layout = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = () => {
        googleLogout();
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="layout-container">
            {/* Sidebar */}
            <div className="sidebar">
                <div className="sidebar-title">ReachInbox</div>

                <nav className="nav-container">
                    <SidebarItem to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" />
                    <SidebarItem to="/scheduled" icon={<Mail size={20} />} label="Scheduled Emails" />
                    <SidebarItem to="/sent" icon={<Send size={20} />} label="Sent Emails" />
                </nav>

                <div className="user-info">
                    <div className="user-profile">
                        {user.avatar && <img src={user.avatar} alt="User" className="user-avatar" />}
                        <div className="user-details">
                            <div>{user.name}</div>
                            <div>{user.email}</div>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="logout-btn">
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="main-content">
                <header className="header">
                    <h1>Dashboard</h1>
                </header>
                <main className="main-section">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
