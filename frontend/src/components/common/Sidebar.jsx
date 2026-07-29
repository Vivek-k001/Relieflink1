import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import {
  LayoutDashboard, AlertTriangle, Package, MapPin, Bell,
  LogOut, Menu, X, Users, Settings, ClipboardList,
  Truck, BarChart3, Heart, ShieldAlert, Radio, Award, Phone
} from 'lucide-react';

const navConfig = {
  affected: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/safety', icon: Radio, label: '🟢 Safety Map' },
    { to: '/sos', icon: AlertTriangle, label: 'Send SOS', highlight: true },
    { to: '/relief-request', icon: Package, label: 'Request Relief' },
    { to: '/camp-finder', icon: MapPin, label: 'Find Camps' },
    { to: '/my-requests', icon: ClipboardList, label: 'My Requests' },
    { to: '/alerts', icon: Radio, label: 'Live Alerts' },
  ],
  volunteer: [
    { to: '/volunteer', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/safety', icon: Radio, label: '🟢 Safety Map' },
    { to: '/volunteer/nearby', icon: MapPin, label: 'Nearby Requests' },
    { to: '/volunteer/skills', icon: Award, label: 'My Skills' },
    { to: '/volunteer/history', icon: ClipboardList, label: 'Task History' },
    { to: '/alerts', icon: Radio, label: 'Live Alerts' },
  ],
  ngo: [
    { to: '/ngo', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/safety', icon: Radio, label: '🟢 Safety Map' },
    { to: '/ngo/camps', icon: MapPin, label: 'My Camps' },
    { to: '/ngo/inventory', icon: Package, label: 'Inventory' },
    { to: '/ngo/approvals', icon: ClipboardList, label: 'Relief Approvals' },
    { to: '/ngo/donations', icon: Heart, label: 'Donations' },
    { to: '/ngo/reports', icon: BarChart3, label: 'Reports' },
  ],
  admin: [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/safety', icon: Radio, label: '🟢 Safety Map' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/alerts', icon: ShieldAlert, label: 'Broadcast Alert' },
    { to: '/admin/sos', icon: AlertTriangle, label: 'SOS Management' },
    { to: '/ngo/camps', icon: MapPin, label: 'Camps' },
    { to: '/ngo/approvals', icon: ClipboardList, label: 'Relief Requests' },
    { to: '/admin/reports', icon: BarChart3, label: 'System Reports' },
  ],
};


const roleLabels = { affected: 'Affected Person', volunteer: 'Volunteer', ngo: 'NGO / Relief Center', admin: 'Administrator' };

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const nav = navConfig[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const SidebarContent = () => (
    <>
      <div className="sidebar-logo">
        <div className="flex items-center gap-2">
          <div style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            🆘
          </div>
          <div>
            <div className="sidebar-logo-text">ReliefLink</div>
            <div className="sidebar-logo-sub">{roleLabels[user?.role]}</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}${item.highlight ? ' sos-nav-item' : ''}`}
            style={item.highlight ? ({ isActive }) => ({
              background: isActive ? 'rgba(239,68,68,0.3)' : 'rgba(239,68,68,0.15)',
              color: '#FCA5A5',
              border: '1px solid rgba(239,68,68,0.3)',
              marginBottom: '0.5rem',
            }) : undefined}
            onClick={() => setMobileOpen(false)}
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: 'white', fontWeight: 600, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name || 'User'}
            </div>
            <div style={{ color: 'var(--blue-300)', fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email || user?.phone || ''}
            </div>
          </div>
          <button onClick={handleLogout} className="btn-ghost" style={{ color: 'var(--blue-300)', padding: '0.4rem' }} title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <button
        className="btn-ghost"
        style={{ position: 'fixed', top: '1rem', left: '1rem', zIndex: 200, display: 'none' }}
        id="mobile-menu-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Desktop Sidebar */}
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }}
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}
