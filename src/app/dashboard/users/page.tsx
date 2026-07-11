'use client';

import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import {
  NoSymbolIcon,
  CheckCircleIcon,
  XCircleIcon,
  EllipsisVerticalIcon,
  UserIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import {
  useCreateUserMutation,
  useGetPaginatedUsersQuery,
  useGetUserStatsQuery,
  useToggleUserActiveMutation,
  useDeleteUserMutation,
} from '../../store/api/userApi';
import { useCancelSubscriptionMutation } from '../../store/api/subscriptionApi';
import { useAppSelector } from '../../store/hooks';
import { selectCurrentUser } from '../../store/slices/authSlice';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  subscriptionId: string | null;
  preferences: { quality: string; notifications: boolean; autoplay: boolean };
  createdAt: string;
  updatedAt: string;
  lastLoginTime?: string;
}

const columnHelper = createColumnHelper<User>();

const CREATE_ROLE_OPTIONS: Record<string, { value: string; label: string }[]> = {
  admin: [
    { value: 'viewer', label: 'Viewer' },
    { value: 'creator', label: 'Creator' },
  ],
  superadmin: [
    { value: 'viewer', label: 'Viewer' },
    { value: 'creator', label: 'Creator' },
    { value: 'admin', label: 'Admin' },
    { value: 'superadmin', label: 'Super Admin' },
  ],
};

export default function UserManagement() {
  const currentUser = useAppSelector(selectCurrentUser);
  const [toggleUserActive] = useToggleUserActiveMutation();
  const [cancelSubscription] = useCancelSubscriptionMutation();
  const [deleteUser] = useDeleteUserMutation();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [createUserForm, setCreateUserForm] = useState({ name: '', email: '', password: '', role: 'viewer' });
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 10;

  const creatableRoles = useMemo(
    () => CREATE_ROLE_OPTIONS[currentUser?.role || ''] || CREATE_ROLE_OPTIONS.admin,
    [currentUser?.role]
  );

  const { data: stats } = useGetUserStatsQuery();
  const { data, isLoading, refetch: refetchUsers } = useGetPaginatedUsersQuery({ page, limit, search: searchTerm });

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const handleCreateUser = async () => {
    try {
      await createUser(createUserForm).unwrap();
      toast.success('User created successfully');
      setShowCreateUserModal(false);
      setCreateUserForm({ name: '', email: '', password: '', role: 'viewer' });
      refetchUsers();
    } catch (error: any) {
      const errorObject = error?.data?.errors || {};
      Object.values(errorObject).forEach((msg) => toast.error(msg + ''));
      if (error?.data?.message) toast.error(error.data.message);
    }
  };

  const handleBlockUnblock = async () => {
    if (!selectedUser) return;
    try {
      await toggleUserActive(selectedUser._id).unwrap();
      toast.success(`User has been ${selectedUser.isActive ? 'blocked' : 'activated'}`);
      setShowUserDetails(false);
      refetchUsers();
    } catch {
      toast.error('Failed to update user status');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    if (!confirm(`Delete user "${selectedUser.name}"? This action is irreversible.`)) return;
    try {
      await deleteUser(selectedUser._id).unwrap();
      toast.success('User deleted successfully');
      setShowUserDetails(false);
      refetchUsers();
    } catch {
      toast.error('Failed to delete user');
    }
  };

  const handleCancelSubscription = async () => {
    if (!selectedUser) return;
    if (!confirm(`Cancel subscription for "${selectedUser.name}"?`)) return;
    try {
      await cancelSubscription().unwrap();
      toast.success('Subscription cancelled');
      setShowUserDetails(false);
      refetchUsers();
    } catch {
      toast.error('Failed to cancel subscription');
    }
  };

  const users: User[] = useMemo(() => {
    if (!data) return [];
    return data.users.map((user: any) => ({
      ...user,
      lastLoginTime: user.lastLoginTime ? new Date(user.lastLoginTime).toLocaleString() : 'Never',
    }));
  }, [data]);

  // Client-side role + status filter
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchRole = !roleFilter || u.role === roleFilter;
      const matchStatus =
        !statusFilter ||
        (statusFilter === 'active' && u.isActive) ||
        (statusFilter === 'blocked' && !u.isActive);
      return matchRole && matchStatus;
    });
  }, [users, roleFilter, statusFilter]);

  const columns = [
    columnHelper.accessor('name', {
      header: 'Name',
      cell: (info) => (
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-full bg-dark-15 flex items-center justify-center text-xs text-grey-70 font-semibold">
            {info.getValue()?.charAt(0)?.toUpperCase()}
          </div>
          <span className="font-medium">{info.getValue()}</span>
        </div>
      ),
    }),
    columnHelper.accessor('email', { header: 'Email' }),
    columnHelper.accessor('role', {
      header: 'Role',
      cell: (info) => (
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${info.getValue() === 'admin' || info.getValue() === 'superadmin'
            ? 'bg-purple-900 text-purple-300'
            : info.getValue() === 'creator'
              ? 'bg-blue-900 text-blue-300'
              : 'bg-gray-800 text-gray-300'
          }`}>
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('isActive', {
      header: 'Status',
      cell: (info) => (
        <span className={`px-2 py-0.5 rounded text-xs ${info.getValue() ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
          {info.getValue() ? 'Active' : 'Blocked'}
        </span>
      ),
    }),
    columnHelper.accessor('subscriptionId', {
      header: 'Subscription',
      cell: (info) => (
        <span className={`px-2 py-0.5 rounded text-xs ${info.getValue() ? 'bg-blue-900 text-blue-300' : 'bg-gray-800 text-gray-400'}`}>
          {info.getValue() ? 'Active' : 'None'}
        </span>
      ),
    }),
    columnHelper.accessor('lastLoginTime', {
      header: 'Last Login',
      cell: (info) => <span className="text-grey-70 text-xs">{info.getValue()}</span>,
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (info) => (
        <button
          onClick={() => { setSelectedUser(info.row.original); setShowUserDetails(true); }}
          className="bg-dark-15 text-primary px-2 py-1 rounded hover:bg-dark-20 flex items-center space-x-1"
        >
          <EllipsisVerticalIcon className="h-4 w-4" />
        </button>
      ),
    }),
  ];

  const table = useReactTable({ data: filteredUsers, columns, getCoreRowModel: getCoreRowModel() });
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h1 className="text-2xl font-bold text-primary">User Management</h1>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-grey-70" />
            <input type="text" placeholder="Search users..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-dark-10 text-grey-70 pl-9 pr-4 py-2 rounded-lg w-52 text-sm focus:outline-none focus:ring-1 focus:ring-red-45 border border-dark-20" />
          </div>
          {/* Role filter */}
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-dark-10 text-primary px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-red-45 border border-dark-20">
            <option value="">All Roles</option>
            <option value="viewer">Viewer</option>
            <option value="creator">Creator</option>
            <option value="admin">Admin</option>
            <option value="superadmin">Super Admin</option>
          </select>
          {/* Status filter */}
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-dark-10 text-primary px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-red-45 border border-dark-20">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
          <button onClick={() => setShowCreateUserModal(true)}
            className="bg-red-45 text-white px-4 py-2 rounded-lg hover:bg-red-60 text-sm">
            + Create User
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatBox title="Total Users" value={stats?.totalUsers ?? 0} Icon={UserIcon} color="text-blue-400" />
        <StatBox title="Active Users" value={stats?.activeUsers ?? 0} Icon={CheckCircleIcon} color="text-green-400" />
        <StatBox title="With Subscriptions" value={stats?.activeSubscriptions ?? 0} Icon={ClockIcon} color="text-yellow-400" />
      </div>

      {/* Table */}
      <div className="bg-dark-8 rounded-lg overflow-hidden border border-dark-20">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-gray-800">
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-800">
                    {columns.map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-dark-20 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-8 text-gray-400">
                    <UserIcon className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    <p>No users found.</p>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-800">
          <span className="text-sm text-gray-400">
            Page {page} of {totalPages} &bull; {data?.total ?? 0} total users
          </span>
          <div className="flex items-center space-x-2">
            <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1}
              className="px-3 py-1 text-sm text-gray-400 hover:text-primary disabled:opacity-40 bg-dark-15 rounded">
              ← Prev
            </button>
            <button onClick={() => setPage((p) => Math.min(p + 1, totalPages))} disabled={page >= totalPages}
              className="px-3 py-1 text-sm text-gray-400 hover:text-primary disabled:opacity-40 bg-dark-15 rounded">
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateUserModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-8 rounded-xl p-6 max-w-md w-full border border-dark-20">
            <h2 className="text-xl font-bold text-primary mb-5">Create New User</h2>
            <div className="space-y-4">
              {[
                { label: 'Name', field: 'name', type: 'text' },
                { label: 'Email', field: 'email', type: 'email' },
                { label: 'Password', field: 'password', type: 'password' },
              ].map(({ label, field, type }) => (
                <div key={field}>
                  <label className="text-grey-70 block mb-1 text-sm">{label}</label>
                  <input type={type} value={(createUserForm as any)[field]}
                    onChange={(e) => setCreateUserForm((prev) => ({ ...prev, [field]: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-dark-10 text-primary text-sm border border-dark-20 focus:outline-none focus:ring-1 focus:ring-red-45" />
                </div>
              ))}
              <div>
                <label className="text-grey-70 block mb-1 text-sm">Role</label>
                <select value={createUserForm.role}
                  onChange={(e) => setCreateUserForm((prev) => ({ ...prev, role: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-dark-10 text-primary text-sm border border-dark-20 focus:outline-none focus:ring-1 focus:ring-red-45">
                  {creatableRoles.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end mt-6 space-x-3">
              <button onClick={() => setShowCreateUserModal(false)} className="px-4 py-2 text-grey-70 hover:text-primary text-sm">Cancel</button>
              <button onClick={handleCreateUser} disabled={isCreating}
                className="bg-red-45 hover:bg-red-60 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-60">
                {isCreating ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-8 rounded-xl p-6 max-w-lg w-full border border-dark-20">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-primary">User Details</h2>
              <button onClick={() => setShowUserDetails(false)} className="text-grey-70 hover:text-primary">
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-5">
              <DetailItem label="Name" value={selectedUser.name} />
              <DetailItem label="Email" value={selectedUser.email} />
              <DetailItem label="Role" value={selectedUser.role} />
              <DetailItem label="Status" value={selectedUser.isActive ? 'Active' : 'Blocked'} />
              <DetailItem label="Join Date" value={new Date(selectedUser.createdAt).toLocaleDateString()} />
              <DetailItem label="Last Login" value={selectedUser.lastLoginTime || 'Never'} />
              <DetailItem label="Subscription" value={selectedUser.subscriptionId ? 'Active' : 'None'} />
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={handleBlockUnblock}
                className={`${selectedUser.isActive ? 'bg-red-45 hover:bg-red-60' : 'bg-green-600 hover:bg-green-700'} text-white px-4 py-2 rounded-lg flex items-center space-x-2 text-sm`}>
                {selectedUser.isActive ? <NoSymbolIcon className="h-4 w-4" /> : <CheckCircleIcon className="h-4 w-4" />}
                <span>{selectedUser.isActive ? 'Block User' : 'Activate User'}</span>
              </button>
              {selectedUser.subscriptionId && (
                <button onClick={handleCancelSubscription}
                  className="bg-yellow-700 hover:bg-yellow-800 text-white px-4 py-2 rounded-lg flex items-center space-x-2 text-sm">
                  <XCircleIcon className="h-4 w-4" />
                  <span>Cancel Subscription</span>
                </button>
              )}
              <button onClick={handleDeleteUser}
                className="bg-red-900 hover:bg-red-800 text-red-300 px-4 py-2 rounded-lg flex items-center space-x-2 text-sm ml-auto">
                <TrashIcon className="h-4 w-4" />
                <span>Delete User</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatBox({ title, value, Icon, color }: { title: string; value: number; Icon: any; color: string }) {
  return (
    <div className="bg-dark-8 p-4 rounded-lg border border-dark-20">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-grey-70 text-sm">{title}</p>
          <h3 className={`text-2xl font-bold mt-1 ${color}`}>{value.toLocaleString()}</h3>
        </div>
        <Icon className={`h-7 w-7 ${color}`} />
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-grey-70 text-xs">{label}</p>
      <p className="text-primary text-sm font-medium">{value}</p>
    </div>
  );
}
