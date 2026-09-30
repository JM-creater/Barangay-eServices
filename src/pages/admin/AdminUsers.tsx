import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/layout/Layout';
import { adminService, CreateStaffPayload } from '../../services/adminService';
import { User } from '../../types/User';
import { Card } from '../../components/common/Card';
import { Table } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { formatDateTime } from '../../utils/formatters';
import { UserPlus, Search, RefreshCw, ShieldCheck } from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Create Staff Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [staffForm, setStaffForm] = useState<CreateStaffPayload>({
    username: '',
    email: '',
    password: '',
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: '',
    contactNumber: '',
    role: 'ROLE_STAFF',
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const fetchUsers = async (p = 0) => {
    setLoading(true);
    try {
      const res = await adminService.getAllUsers(search.trim() || undefined, p, 10);
      setUsers(res.content);
      setTotalPages(res.totalPages);
      setPage(res.pageNumber);
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(0);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(0);
  };

  const handleToggleStatus = async (user: User) => {
    const newStatus = user.accountStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await adminService.updateUserStatus(user.id, newStatus);
      fetchUsers(page);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    try {
      await adminService.createStaffAccount(staffForm);
      setShowCreateModal(false);
      setStaffForm({
        username: '',
        email: '',
        password: '',
        firstName: '',
        middleName: '',
        lastName: '',
        suffix: '',
        contactNumber: '',
        role: 'ROLE_STAFF',
      });
      fetchUsers(0);
    } catch (err: any) {
      setCreateError(err.response?.data?.message || 'Failed to create staff account');
    } finally {
      setCreating(false);
    }
  };

  const columns = [
    {
      header: 'Full Name',
      accessor: (u: User) => (
        <div>
          <div style={{ fontWeight: 600 }}>{u.fullName}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>@{u.username}</div>
        </div>
      ),
    },
    {
      header: 'Contact Info',
      accessor: (u: User) => (
        <div>
          <div style={{ fontSize: '0.85rem' }}>{u.email}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{u.contactNumber}</div>
        </div>
      ),
    },
    {
      header: 'Roles',
      accessor: (u: User) => (
        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
          {u.roles?.map((r) => (
            <Badge key={r} variant={r.includes('ADMIN') ? 'danger' : r.includes('APPROVER') ? 'warning' : r.includes('STAFF') ? 'info' : 'primary'}>
              {r.replace('ROLE_', '')}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (u: User) => (
        <Badge variant={u.accountStatus === 'ACTIVE' ? 'success' : 'danger'}>
          {u.accountStatus}
        </Badge>
      ),
    },
    {
      header: 'Registered',
      accessor: (u: User) => (
        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
          {formatDateTime(u.createdAt)}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (u: User) => (
        <Button
          variant={u.accountStatus === 'ACTIVE' ? 'outline' : 'primary'}
          size="sm"
          onClick={() => handleToggleStatus(u)}
        >
          {u.accountStatus === 'ACTIVE' ? 'Deactivate' : 'Activate'}
        </Button>
      ),
    },
  ];

  return (
    <Layout showSidebar>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', color: '#0f172a' }}>User & Personnel Management</h1>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
              Administer resident accounts, barangay staff, and authorized approvers
            </p>
          </div>
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            <UserPlus size={16} /> Create Staff / Approver
          </Button>
        </div>

        <Card>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', maxWidth: '400px' }}>
            <input
              type="text"
              placeholder="Search by name, username, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button type="submit" variant="primary">
              <Search size={16} />
            </Button>
          </form>

          <Table
            columns={columns}
            data={users}
            keyExtractor={(u) => u.id}
            isLoading={loading}
            emptyMessage="No users found."
          />

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => fetchUsers(page - 1)}>
                Previous
              </Button>
              <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.85rem', color: '#64748b' }}>
                Page {page + 1} of {totalPages}
              </span>
              <Button variant="outline" size="sm" disabled={page + 1 >= totalPages} onClick={() => fetchUsers(page + 1)}>
                Next
              </Button>
            </div>
          )}
        </Card>

        {/* Modal: Create Staff Account */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create Staff or Approver Account"
        >
          <form onSubmit={handleCreateStaff} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {createError && (
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: '0.75rem', borderRadius: '8px', color: '#b91c1c', fontSize: '0.85rem' }}>
                {createError}
              </div>
            )}

            <div className="form-grid-2">
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={staffForm.firstName}
                  onChange={(e) => setStaffForm({ ...staffForm, firstName: e.target.value })}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={staffForm.lastName}
                  onChange={(e) => setStaffForm({ ...staffForm, lastName: e.target.value })}
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Username *
                </label>
                <input
                  type="text"
                  required
                  value={staffForm.username}
                  onChange={(e) => setStaffForm({ ...staffForm, username: e.target.value })}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="min 6 chars"
                  value={staffForm.password}
                  onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={staffForm.email}
                  onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Contact Number *
                </label>
                <input
                  type="text"
                  required
                  value={staffForm.contactNumber}
                  onChange={(e) => setStaffForm({ ...staffForm, contactNumber: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                System Role *
              </label>
              <select
                value={staffForm.role}
                onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
              >
                <option value="ROLE_STAFF">Staff (Review requests, verify, issue)</option>
                <option value="ROLE_APPROVER">Authorized Approver (Captain / Secretary - Official sign)</option>
                <option value="ROLE_ADMIN">Administrator (Full system management)</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
              <Button variant="ghost" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={creating}>
                Create Account
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};
