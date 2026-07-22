import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api/endpoints';
import { User, Role } from '../types';
import { Pagination } from '../components/common/Pagination';
import { SearchInput } from '../components/common/SearchInput';
import { Badge } from '../components/ui/Badge';
import { TableSkeleton } from '../components/ui/Skeleton';
import { useToast } from '../components/ui/Toast';
import { ShieldCheck, UserCheck, ShieldAlert, Edit3 } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';

export const UsersPage: React.FC = () => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [roleSelect, setRoleSelect] = useState<Role>('SALES');
  const [isActiveSelect, setIsActiveSelect] = useState(true);

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, search],
    queryFn: async () => {
      const res = await usersApi.getUsers({
        page,
        limit: 10,
        search: search || undefined,
      });
      return res.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      usersApi.updateUser(editingUser!.id, {
        role: roleSelect,
        isActive: isActiveSelect,
      }),
    onSuccess: () => {
      showToast('User account role and status updated', 'success');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setEditingUser(null);
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to update user', 'error');
    },
  });

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setRoleSelect(user.role);
    setIsActiveSelect(user.isActive);
  };

  const getRoleBadgeVariant = (role: Role) => {
    switch (role) {
      case 'ADMIN':
        return 'danger';
      case 'SALES':
        return 'info';
      case 'WAREHOUSE':
        return 'warning';
      case 'ACCOUNTS':
        return 'purple';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
          <ShieldCheck className="w-6 h-6 text-brand-600" />
          System User & RBAC Access Control
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Manage system users, assign operational roles, and toggle account activation state.
        </p>
      </div>

      {/* Search Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl">
        <SearchInput
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search users by name or email..."
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-6">
            <TableSkeleton rows={6} cols={5} />
          </div>
        ) : !data?.data || data.data.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No user accounts found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">User Name & Email</th>
                  <th className="px-6 py-4 font-semibold">Assigned Role</th>
                  <th className="px-6 py-4 font-semibold">Account Status</th>
                  <th className="px-6 py-4 font-semibold">Registered Date</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {data.data.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {user.name}
                      </div>
                      <div className="text-xs text-slate-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      {user.isActive ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="danger">Inactive</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openEditModal(user)}
                        className="p-2 text-slate-500 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Edit User Role"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data?.meta && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800">
            <Pagination
              currentPage={data.meta.page}
              totalPages={data.meta.totalPages}
              total={data.meta.total}
              limit={data.meta.limit}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </div>

      {/* Edit User Role Modal */}
      <Modal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title={`Update Role for ${editingUser?.name}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Select Role
            </label>
            <select
              value={roleSelect}
              onChange={(e) => setRoleSelect(e.target.value as Role)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
            >
              <option value="ADMIN">ADMIN (Full Access)</option>
              <option value="SALES">SALES (CRM & Orders)</option>
              <option value="WAREHOUSE">WAREHOUSE (Stock & Fulfillment)</option>
              <option value="ACCOUNTS">ACCOUNTS (Sales Audit & Reports)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Account Status
            </label>
            <select
              value={isActiveSelect ? 'true' : 'false'}
              onChange={(e) => setIsActiveSelect(e.target.value === 'true')}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="true font-semibold">Active</option>
              <option value="false font-semibold">Inactive (Suspended)</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => updateMutation.mutate()}
              isLoading={updateMutation.isPending}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
