import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import { useLanguage } from '../../context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import {
  LayoutDashboard, AlertTriangle, Package, MapPin, Bell,
  LogOut, Menu, X, Users, Settings, ClipboardList,
  Truck, BarChart3, Heart, ShieldAlert, Radio, Award, Phone, LifeBuoy, UserCheck
} from 'lucide-react';

const getNavConfig = (t) => ({
  affected: [
    { to: '/dashboard', icon: LayoutDashboard, label: t('nav.dashboard', 'Dashboard') },
    { to: '/safety', icon: Radio, label: t('nav.safetyMap', '🟢 Safety Map') },
    { to: '/sos', icon: AlertTriangle, label: t('nav.sendSos', 'Send SOS'), highlight: true },
    { to: '/missing-persons', icon: UserCheck, label: t('nav.missingPersons', '👨‍👩‍👧 Missing Persons') },
    { to: '/relief-request', icon: Package, label: t('nav.requestRelief', 'Request Relief') },
    { to: '/camp-finder', icon: MapPin, label: t('nav.findCamps', 'Find Camps') },
    { to: '/my-requests', icon: ClipboardList, label: t('nav.myRequests', 'My Requests') },
    { to: '/alerts', icon: Radio, label: t('nav.liveAlerts', 'Live Alerts') },
  ],
  volunteer: [
    { to: '/volunteer', icon: LayoutDashboard, label: t('nav.dashboard', 'Dashboard') },
    { to: '/safety', icon: Radio, label: t('nav.safetyMap', '🟢 Safety Map') },
    { to: '/missing-persons', icon: UserCheck, label: t('nav.missingPersons', '👨‍👩‍👧 Missing Persons') },
    { to: '/volunteer/nearby', icon: MapPin, label: t('nav.nearbyRequests', 'Nearby Requests') },
    { to: '/volunteer/skills', icon: Award, label: t('nav.mySkills', 'My Skills') },
    { to: '/volunteer/history', icon: ClipboardList, label: t('nav.taskHistory', 'Task History') },
    { to: '/alerts', icon: Radio, label: t('nav.liveAlerts', 'Live Alerts') },
  ],
  ngo: [
    { to: '/ngo', icon: LayoutDashboard, label: t('nav.dashboard', 'Dashboard') },
    { to: '/ngo/sos', icon: AlertTriangle, label: t('nav.sosManagement', '🆘 SOS Management'), highlight: true },
    { to: '/ngo/alerts', icon: ShieldAlert, label: t('nav.broadcastAlert', 'Broadcast Alert') },
    { to: '/safety', icon: Radio, label: t('nav.safetyMap', '🟢 Safety Map') },
    { to: '/ngo/camps', icon: MapPin, label: t('nav.myCamps', 'My Camps') },
    { to: '/ngo/inventory', icon: Package, label: t('nav.inventory', 'Inventory') },
    { to: '/ngo/approvals', icon: ClipboardList, label: t('nav.reliefApprovals', 'Relief Approvals') },
    { to: '/ngo/volunteers', icon: Users, label: t('nav.volunteers', 'Volunteers Directory') },
    { to: '/missing-persons', icon: UserCheck, label: t('nav.missingPersons', '👨‍👩‍👧 Missing Persons') },
    { to: '/ngo/donations', icon: Heart, label: t('nav.donations', 'Donations') },
    { to: '/ngo/reports', icon: BarChart3, label: t('nav.reports', 'Reports') },
  ],
});

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const { t } = useLanguage();
  const { unreadCount } = useNotificationStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const navConfig = getNavConfig(t);
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
            <LifeBuoy size={18} color="white" />
          </div>
          <div>
            <div className="sidebar-logo-text">{t('brand', 'ReliefLink')}</div>
            <div className="sidebar-logo-sub">{t(`roles.${user?.role}`, user?.role)}</div>
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

      <div className="sidebar-footer" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ padding: '0 0.5rem' }}>
          <LanguageSwitcher direction="up" style={{ width: '100%' }} />
        </div>

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
          <button onClick={handleLogout} className="btn-ghost" style={{ color: 'var(--blue-300)', padding: '0.4rem' }} title={t('nav.logout', 'Logout')}>
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
