import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import {
  Bell,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  LayoutDashboard,
  FileText,
  Calendar,
  FileCheck,
  CheckCircle2,
  Users,
  Layers,
  Clock,
  History,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';
import { useModalMobileAIButton } from '../../hooks/useModalMobileAIButton';

export const Header: React.FC = () => {
  const { user, isAuthenticated, isResident, isStaff, isApprover, isAdmin, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { modalMobile, setModalMobile } = useModalMobileAIButton();
  const [showNotifs, setShowNotifs] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const adminMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
      if (adminMenuRef.current && !adminMenuRef.current.contains(e.target as Node)) {
        setAdminMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setAdminMenuOpen(false);
    setShowNotifs(false);
  }, [location.pathname]);

  const getRoleLabel = () => {
    if (isAdmin) return 'Administrator';
    if (isApprover) return 'Approver';
    if (isStaff) return 'Barangay Staff';
    if (isResident) return 'Resident';
    return user?.roles?.[0]?.replace('ROLE_', '') || 'User';
  };

  const getRoleBadgeStyle = () => {
    if (isAdmin) {
      return {
        backgroundColor: 'rgba(242, 182, 0, 0.22)',
        color: '#F2B600',
        border: '1px solid rgba(242, 182, 0, 0.55)',
      };
    }
    if (isApprover) {
      return {
        backgroundColor: 'rgba(46, 139, 87, 0.22)',
        color: '#4ade80',
        border: '1px solid rgba(46, 139, 87, 0.55)',
      };
    }
    if (isStaff) {
      return {
        backgroundColor: 'rgba(59, 130, 196, 0.22)',
        color: '#93c5fd',
        border: '1px solid rgba(59, 130, 196, 0.55)',
      };
    }
    return {
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      color: '#DDE3EA',
      border: '1px solid rgba(255, 255, 255, 0.25)',
    };
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const brandHomeLink = isAuthenticated
    ? isAdmin
      ? '/admin/dashboard'
      : isStaff || isApprover
        ? '/staff/dashboard'
        : '/dashboard'
    : '/';

  const portalSubtitle = isAuthenticated
    ? isAdmin
      ? 'Administrator Portal • Talisay City, Cebu'
      : isStaff || isApprover
        ? 'Staff Operations • Talisay City, Cebu'
        : 'Resident Portal • Talisay City, Cebu'
    : 'e-Services Portal • Talisay City, Cebu';

  const navLinkStyle = (path: string) => {
    const isActive = location.pathname === path;
    return {
      color: isActive ? '#FFFFFF' : '#DDE3EA',
      backgroundColor: isActive ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
      padding: '0.4rem 0.65rem',
      borderRadius: '6px',
      fontWeight: isActive ? 600 : 500,
      fontSize: '0.85rem',
      transition: 'all 0.15s ease',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.35rem',
      whiteSpace: 'nowrap' as const,
      border: isActive ? '1px solid rgba(242, 182, 0, 0.4)' : '1px solid transparent',
    };
  };

  const isAdminSubActive = ['/admin/users', '/admin/services', '/admin/slots', '/admin/audit-logs', '/admin/ai'].some(
    (p) => location.pathname === p
  );

  const mobileNavLinkStyle = (path: string) => {
    const isActive = location.pathname === path;
    return {
      display: 'flex',
      alignItems: 'center',
      gap: '0.65rem',
      padding: '0.75rem 1rem',
      borderRadius: '8px',
      color: isActive ? '#FFFFFF' : '#DDE3EA',
      backgroundColor: isActive ? 'rgba(255, 255, 255, 0.14)' : 'transparent',
      fontWeight: isActive ? 600 : 500,
      fontSize: '0.925rem',
    };
  };

  return (
    <header
      style={{
        backgroundColor: '#0F2A4A',
        color: '#ffffff',
        borderBottom: '3px solid #F2B600',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 4px 14px rgba(15, 42, 74, 0.15)',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0.65rem clamp(0.75rem, 3vw, 1.5rem)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          minWidth: 0,
        }}
      >
        {/* Brand */}
        <Link
          to={brandHomeLink}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            minWidth: 0,
            flexShrink: 1,
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              flexShrink: 0,
            }}
          >
            <ShieldCheck size={24} color="#1E4E8C" />
          </div>
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <div
              className='brand-title'
              style={{
                fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                fontSize: 'clamp(1.05rem, 3.5vw, 1.25rem)',
                fontWeight: 700,
                letterSpacing: '-0.01em',
                lineHeight: 1.15,
                color: '#FFFFFF',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              Barangay Cansojong
            </div>
            <div
              style={{
                fontSize: '0.7rem',
                color: '#F2B600',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              <span className="brand-subtitle-full">{portalSubtitle}</span>
              <span className="brand-subtitle-mobile">Talisay City, Cebu</span>
            </div>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="desktop-nav" aria-label="Main Navigation">
          {!isAuthenticated ? (
            <>
              <Link to="/services" style={navLinkStyle('/services')}>
                Services
              </Link>
              <Link to="/track" style={navLinkStyle('/track')}>
                Track Request
              </Link>
              <Link to="/verify" style={navLinkStyle('/verify')}>
                Verify Document
              </Link>
            </>
          ) : (
            <>
              {isResident && !isStaff && !isAdmin && (
                <>
                  <Link to="/dashboard" style={navLinkStyle('/dashboard')}>
                    <LayoutDashboard size={15} />
                    <span>Dashboard</span>
                  </Link>
                  <Link to="/my-requests" style={navLinkStyle('/my-requests')}>
                    <FileCheck size={15} />
                    <span>My Requests</span>
                  </Link>
                  <Link to="/my-appointments" style={navLinkStyle('/my-appointments')}>
                    <Calendar size={15} />
                    <span>Appointments</span>
                  </Link>
                </>
              )}

              {(isStaff || isApprover) && !isAdmin && (
                <>
                  <Link to="/staff/dashboard" style={navLinkStyle('/staff/dashboard')}>
                    <LayoutDashboard size={15} />
                    <span>Operations</span>
                  </Link>
                  <Link to="/staff/requests" style={navLinkStyle('/staff/requests')}>
                    <FileText size={15} />
                    <span>Applications</span>
                  </Link>
                  <Link to="/staff/appointments" style={navLinkStyle('/staff/appointments')}>
                    <Calendar size={15} />
                    <span>Schedule</span>
                  </Link>
                  <Link to="/staff/releases" style={navLinkStyle('/staff/releases')}>
                    <CheckCircle2 size={15} />
                    <span>Releases</span>
                  </Link>
                </>
              )}

              {isAdmin && (
                <>
                  <Link to="/admin/dashboard" style={navLinkStyle('/admin/dashboard')}>
                    <LayoutDashboard size={15} />
                    <span>Overview</span>
                  </Link>
                  <Link to="/staff/requests" style={navLinkStyle('/staff/requests')}>
                    <FileText size={15} />
                    <span>Applications</span>
                  </Link>

                  {/* System Management Dropdown */}
                  <div style={{ position: 'relative' }} ref={adminMenuRef}>
                    <button
                      type="button"
                      onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                      style={{
                        color: isAdminSubActive || adminMenuOpen ? '#FFFFFF' : '#DDE3EA',
                        backgroundColor: isAdminSubActive || adminMenuOpen ? 'rgba(255, 255, 255, 0.16)' : 'transparent',
                        padding: '0.4rem 0.65rem',
                        borderRadius: '6px',
                        fontWeight: isAdminSubActive || adminMenuOpen ? 600 : 500,
                        fontSize: '0.85rem',
                        transition: 'all 0.15s ease',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        whiteSpace: 'nowrap',
                        border: isAdminSubActive || adminMenuOpen ? '1px solid rgba(242, 182, 0, 0.45)' : '1px solid transparent',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                      aria-haspopup="true"
                      aria-expanded={adminMenuOpen}
                    >
                      <Layers size={15} />
                      <span>System Management</span>
                      <ChevronDown
                        size={14}
                        style={{
                          transition: 'transform 0.2s ease',
                          transform: adminMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        }}
                      />
                    </button>

                    {adminMenuOpen && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 'calc(100% + 8px)',
                          left: 0,
                          width: '270px',
                          backgroundColor: '#FFFFFF',
                          borderRadius: '12px',
                          boxShadow: '0 12px 32px rgba(15, 42, 74, 0.25), 0 4px 10px rgba(15, 42, 74, 0.08)',
                          border: '1px solid #DDE3EA',
                          padding: '0.45rem',
                          zIndex: 100,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px',
                        }}
                      >
                        <div
                          style={{
                            padding: '6px 10px 4px',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            color: '#94A3B8',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                          }}
                        >
                          Governance & Configuration
                        </div>

                        <Link
                          to="/admin/users"
                          onClick={() => setAdminMenuOpen(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '8px 10px',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            color: location.pathname === '/admin/users' ? '#1E4E8C' : '#1F2933',
                            backgroundColor: location.pathname === '/admin/users' ? '#EFF5FC' : 'transparent',
                            fontSize: '0.85rem',
                            fontWeight: location.pathname === '/admin/users' ? 600 : 500,
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => {
                            if (location.pathname !== '/admin/users') e.currentTarget.style.backgroundColor = '#F8FAFC';
                          }}
                          onMouseLeave={(e) => {
                            if (location.pathname !== '/admin/users') e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <div style={{ color: '#1E4E8C', display: 'flex', alignItems: 'center' }}>
                            <Users size={16} />
                          </div>
                          <div>
                            <div style={{ lineHeight: 1.2 }}>User Accounts</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '1px' }}>Manage residents & personnel</div>
                          </div>
                        </Link>

                        <Link
                          to="/admin/services"
                          onClick={() => setAdminMenuOpen(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '8px 10px',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            color: location.pathname === '/admin/services' ? '#1E4E8C' : '#1F2933',
                            backgroundColor: location.pathname === '/admin/services' ? '#EFF5FC' : 'transparent',
                            fontSize: '0.85rem',
                            fontWeight: location.pathname === '/admin/services' ? 600 : 500,
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => {
                            if (location.pathname !== '/admin/services') e.currentTarget.style.backgroundColor = '#F8FAFC';
                          }}
                          onMouseLeave={(e) => {
                            if (location.pathname !== '/admin/services') e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <div style={{ color: '#1E4E8C', display: 'flex', alignItems: 'center' }}>
                            <Layers size={16} />
                          </div>
                          <div>
                            <div style={{ lineHeight: 1.2 }}>Services & Fees</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '1px' }}>Clearances, rates & forms</div>
                          </div>
                        </Link>

                        <Link
                          to="/admin/slots"
                          onClick={() => setAdminMenuOpen(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '8px 10px',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            color: location.pathname === '/admin/slots' ? '#1E4E8C' : '#1F2933',
                            backgroundColor: location.pathname === '/admin/slots' ? '#EFF5FC' : 'transparent',
                            fontSize: '0.85rem',
                            fontWeight: location.pathname === '/admin/slots' ? 600 : 500,
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => {
                            if (location.pathname !== '/admin/slots') e.currentTarget.style.backgroundColor = '#F8FAFC';
                          }}
                          onMouseLeave={(e) => {
                            if (location.pathname !== '/admin/slots') e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <div style={{ color: '#1E4E8C', display: 'flex', alignItems: 'center' }}>
                            <Clock size={16} />
                          </div>
                          <div>
                            <div style={{ lineHeight: 1.2 }}>Appointment Slots</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '1px' }}>Capacity limits & schedule</div>
                          </div>
                        </Link>

                        <Link
                          to="/admin/audit-logs"
                          onClick={() => setAdminMenuOpen(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '8px 10px',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            color: location.pathname === '/admin/audit-logs' ? '#1E4E8C' : '#1F2933',
                            backgroundColor: location.pathname === '/admin/audit-logs' ? '#EFF5FC' : 'transparent',
                            fontSize: '0.85rem',
                            fontWeight: location.pathname === '/admin/audit-logs' ? 600 : 500,
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => {
                            if (location.pathname !== '/admin/audit-logs') e.currentTarget.style.backgroundColor = '#F8FAFC';
                          }}
                          onMouseLeave={(e) => {
                            if (location.pathname !== '/admin/audit-logs') e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <div style={{ color: '#1E4E8C', display: 'flex', alignItems: 'center' }}>
                            <History size={16} />
                          </div>
                          <div>
                            <div style={{ lineHeight: 1.2 }}>Audit Trail</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '1px' }}>System security & activity</div>
                          </div>
                        </Link>

                        <div style={{ height: '1px', backgroundColor: '#E2E8F0', margin: '3px 6px' }} />

                        <Link
                          to="/admin/ai"
                          onClick={() => setAdminMenuOpen(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '8px 10px',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            color: location.pathname === '/admin/ai' ? '#1E4E8C' : '#1F2933',
                            backgroundColor: location.pathname === '/admin/ai' ? '#EFF5FC' : 'transparent',
                            fontSize: '0.85rem',
                            fontWeight: location.pathname === '/admin/ai' ? 600 : 500,
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => {
                            if (location.pathname !== '/admin/ai') e.currentTarget.style.backgroundColor = '#F8FAFC';
                          }}
                          onMouseLeave={(e) => {
                            if (location.pathname !== '/admin/ai') e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <div style={{ color: '#F2B600', display: 'flex', alignItems: 'center' }}>
                            <Sparkles size={16} />
                          </div>
                          <div>
                            <div style={{ lineHeight: 1.2, display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>Barangay AI Engine</span>
                              <span style={{ fontSize: '10px', backgroundColor: '#DCFCE7', color: '#166534', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>Active</span>
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '1px' }}>In-house model intelligence</div>
                          </div>
                        </Link>
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </nav>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          {isAuthenticated ? (
            <>
              {/* Notifications Dropdown */}
              <div style={{ position: 'relative' }} ref={notifRef}>
                <button
                  onClick={() => setShowNotifs(!showNotifs)}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.12)',
                    color: '#fff',
                    padding: '0.5rem',
                    borderRadius: '50%',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background-color 0.2s',
                  }}
                  aria-label="Notifications"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-3px',
                        right: '-3px',
                        backgroundColor: '#D64545',
                        color: '#fff',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '1px 5px',
                        borderRadius: '999px',
                        border: '2px solid #0F2A4A',
                      }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifs && (
                  <div
                    className="header-notif-dropdown"
                    style={{
                      backgroundColor: '#FFFFFF',
                      color: '#1F2933',
                      borderRadius: '12px',
                      border: '1px solid #DDE3EA',
                      zIndex: 110,
                      maxHeight: 'min(450px, 75vh)',
                      overflowY: 'auto',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 1rem',
                        borderBottom: '1px solid #DDE3EA',
                        backgroundColor: '#F5F7FA',
                      }}
                    >
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1F2933' }}>
                        Notifications
                      </span>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          style={{
                            fontSize: '0.75rem',
                            color: '#1E4E8C',
                            fontWeight: 600,
                            background: 'none',
                          }}
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div>
                      {notifications.length === 0 ? (
                        <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#616E7C', fontSize: '0.85rem' }}>
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.slice(0, 10).map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              markAsRead(n.id);
                              if (n.referenceNumber) {
                                navigate(`/track/${n.referenceNumber}`);
                              }
                              setShowNotifs(false);
                            }}
                            style={{
                              padding: '0.75rem 1rem',
                              borderBottom: '1px solid #F5F7FA',
                              backgroundColor: n.isRead ? '#FFFFFF' : '#eff5fc',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s',
                            }}
                          >
                            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1F2933' }}>
                              {n.title}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#616E7C', marginTop: '0.2rem' }}>
                              {n.message}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#8A94A0', marginTop: '0.35rem' }}>
                              {formatDateTime(n.createdAt)}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile Info Capsule */}
              <div
                className="header-desktop-actions"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.3rem 0.65rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: '999px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#1E4E8C',
                    border: '1.5px solid #F2B600',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    flexShrink: 0,
                  }}
                >
                  {getInitials(user?.fullName)}
                </div>

                <div className="user-desktop-name" style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                  <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#FFFFFF', lineHeight: 1.15, maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.fullName}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '1px' }}>
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '1px 5px',
                        borderRadius: '3px',
                        lineHeight: 1.2,
                        letterSpacing: '0.03em',
                        ...getRoleBadgeStyle(),
                      }}
                    >
                      {getRoleLabel()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="header-desktop-actions"
                style={{
                  backgroundColor: 'rgba(214, 69, 69, 0.15)',
                  color: '#ffcaca',
                  border: '1px solid rgba(214, 69, 69, 0.4)',
                  padding: '0.45rem 0.8rem',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#D64545';
                  e.currentTarget.style.color = '#FFFFFF';
                  e.currentTarget.style.borderColor = '#D64545';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(214, 69, 69, 0.15)';
                  e.currentTarget.style.color = '#ffcaca';
                  e.currentTarget.style.borderColor = 'rgba(214, 69, 69, 0.4)';
                }}
                title="Sign out of account"
              >
                <LogOut size={16} />
                <span className="user-desktop-name">Logout</span>
              </button>
            </>
          ) : (
            <div className="header-desktop-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link
                to="/login"
                style={{
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '8px',
                  transition: 'background-color 0.2s',
                }}
              >
                Log In
              </Link>
              <Link
                to="/register"
                style={{
                  backgroundColor: '#F2B600',
                  color: '#0F2A4A',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  padding: '0.45rem 1.15rem',
                  borderRadius: '8px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                  transition: 'all 0.2s',
                }}
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => {
              setMobileMenuOpen(!mobileMenuOpen);
              setModalMobile(!modalMobile);
            }}
            className="mobile-nav-toggle"
            style={{
              backgroundColor: 'rgba(255,255,255,0.12)',
              color: '#FFFFFF',
              padding: '0.45rem',
              borderRadius: '8px',
            }}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          className="mobile-nav-drawer"
          style={{
            backgroundColor: '#0F2A4A',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '1rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
            maxHeight: 'calc(100vh - 72px)',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {!isAuthenticated ? (
            <>
              <Link to="/services" style={mobileNavLinkStyle('/services')}>
                Services & Requirements
              </Link>
              <Link to="/track" style={mobileNavLinkStyle('/track')}>
                Track Request
              </Link>
              <Link to="/verify" style={mobileNavLinkStyle('/verify')}>
                Verify Document
              </Link>
              <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', margin: '0.5rem 0' }} />
              <Link to="/login" style={{ ...mobileNavLinkStyle('/login'), justifyContent: 'center'}}>
                Log In
              </Link>
              <Link
                to="/register"
                style={{
                  ...mobileNavLinkStyle('/register'),
                  backgroundColor: '#F2B600',
                  color: '#0F2A4A',
                  fontWeight: 700,
                  justifyContent: 'center',
                }}
              >
                Register
              </Link>
            </>
          ) : (
            <>
              {/* User mobile card */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  borderRadius: '10px',
                  marginBottom: '0.5rem',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#1E4E8C',
                    border: '2px solid #F2B600',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    flexShrink: 0,
                  }}
                >
                  {getInitials(user?.fullName)}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {user?.fullName}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '2px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                        ...getRoleBadgeStyle(),
                      }}
                    >
                      {getRoleLabel()}
                    </span>
                  </div>
                </div>
              </div>

              {isResident && !isStaff && !isAdmin && (
                <>
                  <Link to="/dashboard" style={mobileNavLinkStyle('/dashboard')}>
                    <LayoutDashboard size={18} />
                    <span>Resident Dashboard</span>
                  </Link>
                  <Link to="/my-requests" style={mobileNavLinkStyle('/my-requests')}>
                    <FileCheck size={18} />
                    <span>My Requests</span>
                  </Link>
                  <Link to="/my-appointments" style={mobileNavLinkStyle('/my-appointments')}>
                    <Calendar size={18} />
                    <span>My Appointments</span>
                  </Link>
                </>
              )}

              {(isStaff || isApprover) && !isAdmin && (
                <>
                  <Link to="/staff/dashboard" style={mobileNavLinkStyle('/staff/dashboard')}>
                    <LayoutDashboard size={18} />
                    <span>Operations Dashboard</span>
                  </Link>
                  <Link to="/staff/requests" style={mobileNavLinkStyle('/staff/requests')}>
                    <FileText size={18} />
                    <span>Review Applications</span>
                  </Link>
                  <Link to="/staff/appointments" style={mobileNavLinkStyle('/staff/appointments')}>
                    <Calendar size={18} />
                    <span>Appointment Schedule</span>
                  </Link>
                  <Link to="/staff/releases" style={mobileNavLinkStyle('/staff/releases')}>
                    <CheckCircle2 size={18} />
                    <span>Document Releases</span>
                  </Link>
                </>
              )}

              {isAdmin && (
                <>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0.4rem 0.5rem 0.2rem' }}>
                    Operations
                  </div>
                  <Link to="/admin/dashboard" style={mobileNavLinkStyle('/admin/dashboard')}>
                    <LayoutDashboard size={18} />
                    <span>Admin Dashboard</span>
                  </Link>
                  <Link to="/staff/requests" style={mobileNavLinkStyle('/staff/requests')}>
                    <FileText size={18} />
                    <span>Review Applications</span>
                  </Link>

                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0.6rem 0.5rem 0.2rem' }}>
                    System Governance
                  </div>
                  <Link to="/admin/users" style={mobileNavLinkStyle('/admin/users')}>
                    <Users size={18} />
                    <span>User Accounts</span>
                  </Link>
                  <Link to="/admin/services" style={mobileNavLinkStyle('/admin/services')}>
                    <Layers size={18} />
                    <span>Services & Fees</span>
                  </Link>
                  <Link to="/admin/slots" style={mobileNavLinkStyle('/admin/slots')}>
                    <Clock size={18} />
                    <span>Slot Capacities</span>
                  </Link>
                  <Link to="/admin/audit-logs" style={mobileNavLinkStyle('/admin/audit-logs')}>
                    <History size={18} />
                    <span>Audit Trail</span>
                  </Link>
                  <Link to="/admin/ai" style={mobileNavLinkStyle('/admin/ai')}>
                    <Sparkles size={18} color="#F2B600" />
                    <span>Barangay AI Engine</span>
                  </Link>
                </>
              )}

              <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', margin: '0.5rem 0' }} />

              <button
                onClick={logout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(214, 69, 69, 0.15)',
                  color: '#ffcaca',
                  border: '1px solid rgba(214, 69, 69, 0.35)',
                  fontWeight: 600,
                  fontSize: '0.925rem',
                  width: '100%',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
};
