import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  FileText,
  Calendar,
  Users,
  Layers,
  History,
  ShieldAlert,
  Clock,
  CheckCircle2,
  FileCheck,
  Sparkles,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { isResident, isStaff, isApprover, isAdmin } = useAuth();

  const activeStyle = {
    backgroundColor: '#1E4E8C',
    color: '#ffffff',
    fontWeight: 600,
    boxShadow: '0 2px 6px rgba(30, 78, 140, 0.25)',
  };

  const normalStyle = {
    color: '#1F2933',
    backgroundColor: 'transparent',
    fontWeight: 500,
  };

  return (
    <aside
      className="app-sidebar"
      style={{
        width: '240px',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #DDE3EA',
        padding: '1.5rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        flexShrink: 0,
      }}
    >
      {/* Resident Menu */}
      {isResident && !isStaff && !isAdmin && (
        <>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', padding: '0.5rem 0.75rem' }}>
            Resident Portal
          </div>
          <NavLink
            to="/dashboard"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.65rem 0.75rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              ...(isActive ? activeStyle : normalStyle),
            })}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink
            to="/services"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.65rem 0.75rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              ...(isActive ? activeStyle : normalStyle),
            })}
          >
            <FileText size={18} />
            <span>Apply For Services</span>
          </NavLink>
          <NavLink
            to="/my-requests"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.65rem 0.75rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              ...(isActive ? activeStyle : normalStyle),
            })}
          >
            <FileCheck size={18} />
            <span>My Requests</span>
          </NavLink>
          <NavLink
            to="/my-appointments"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.65rem 0.75rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              ...(isActive ? activeStyle : normalStyle),
            })}
          >
            <Calendar size={18} />
            <span>My Appointments</span>
          </NavLink>
        </>
      )}

      {/* Staff / Approver Menu */}
      {(isStaff || isApprover || isAdmin) && (
        <>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', padding: '0.5rem 0.75rem' }}>
            Staff Operations
          </div>
          <NavLink
            to="/staff/dashboard"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.65rem 0.75rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              ...(isActive ? activeStyle : normalStyle),
            })}
          >
            <LayoutDashboard size={18} />
            <span>Operations Dashboard</span>
          </NavLink>
          <NavLink
            to="/staff/requests"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.65rem 0.75rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              ...(isActive ? activeStyle : normalStyle),
            })}
          >
            <FileText size={18} />
            <span>Review Applications</span>
          </NavLink>
          <NavLink
            to="/staff/appointments"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.65rem 0.75rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              ...(isActive ? activeStyle : normalStyle),
            })}
          >
            <Calendar size={18} />
            <span>Appointment Schedule</span>
          </NavLink>
          <NavLink
            to="/staff/releases"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.65rem 0.75rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              ...(isActive ? activeStyle : normalStyle),
            })}
          >
            <CheckCircle2 size={18} />
            <span>Document Releases</span>
          </NavLink>
        </>
      )}

      {/* Admin Menu */}
      {isAdmin && (
        <>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', padding: '0.75rem 0.75rem 0.25rem' }}>
            Administration
          </div>
          <NavLink
            to="/admin/dashboard"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.65rem 0.75rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              ...(isActive ? activeStyle : normalStyle),
            })}
          >
            <LayoutDashboard size={18} />
            <span>Admin Overview</span>
          </NavLink>
          <NavLink
            to="/admin/users"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.65rem 0.75rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              ...(isActive ? activeStyle : normalStyle),
            })}
          >
            <Users size={18} />
            <span>User Accounts</span>
          </NavLink>
          <NavLink
            to="/admin/services"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.65rem 0.75rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              ...(isActive ? activeStyle : normalStyle),
            })}
          >
            <Layers size={18} />
            <span>Services & Fees</span>
          </NavLink>
          <NavLink
            to="/admin/slots"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.65rem 0.75rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              ...(isActive ? activeStyle : normalStyle),
            })}
          >
            <Clock size={18} />
            <span>Slot Capacities</span>
          </NavLink>
          <NavLink
            to="/admin/audit-logs"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.65rem 0.75rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              ...(isActive ? activeStyle : normalStyle),
            })}
          >
            <History size={18} />
            <span>Audit Trail</span>
          </NavLink>
          <NavLink
            to="/admin/ai"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.65rem 0.75rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              ...(isActive ? activeStyle : normalStyle),
            })}
          >
            <Sparkles size={18} color="#F2B600" />
            <span>Barangay AI</span>
          </NavLink>
        </>
      )}
    </aside>
  );
};
