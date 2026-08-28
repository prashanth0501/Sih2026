import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { Button } from '@/components/ui/Button';

export type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  year: number;
  usn: string | null;
  gender: string | null;
  email_verified: boolean;
  is_disabled: boolean;
  failed_login_attempts?: number;
  locked_until?: string | null;
  created_at: string;
};

export function UserDirectory() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);

  const { data: users = [], isLoading } = useQuery<UserRow[]>({
    queryKey: ['admin-users-list', query, roleFilter, deptFilter],
    queryFn: async () => {
      const params: any = { limit: 1000 };
      if (query.trim()) params.q = query.trim();
      if (roleFilter) params.role = roleFilter;
      if (deptFilter) params.dept = deptFilter;
      const { data } = await api.get<UserRow[]>('/admin/users', { params });
      return data;
    },
    refetchInterval: 5000,
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async (input: { id: string; disabled: boolean }) => {
      const { data } = await api.patch<{ success: boolean; is_disabled: boolean }>(`/admin/users/${input.id}/status`, {
        disabled: input.disabled,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users-list'] });
      setSelectedUser(null);
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data } = await api.post<{ success: boolean; message: string }>(`/admin/users/${userId}/reset-password`);
      return data;
    },
    onSuccess: (data) => {
      alert(data.message || 'Password reset link sent successfully.');
    },
  });

  // Calculate user metrics
  const totalUsers = users.length;
  const totalParticipants = users.filter((u) => u.role === 'participant').length;
  const totalCoordinators = users.filter((u) => u.role === 'coordinator').length;
  const totalSpocs = users.filter((u) => u.role === 'spoc').length;
  const unverifiedCount = users.filter((u) => !u.email_verified).length;
  const disabledCount = users.filter((u) => u.is_disabled).length;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[1.6rem] font-bold">User Directory &amp; Account Roster</h1>
          <p className="mt-1 text-[0.85rem] text-ink-soft">
            {isLoading ? 'Loading registered accounts...' : `${totalUsers} total registered user accounts in portal database`}
          </p>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="mt-5 grid grid-cols-2 sm:grid-cols-6 gap-3 text-center">
        <div className="rounded-xl border border-line bg-paper p-3">
          <div className="text-xl font-bold text-ink">{totalUsers}</div>
          <div className="text-[0.68rem] font-semibold text-ink-soft uppercase tracking-wider">Total Accounts</div>
        </div>
        <div className="rounded-xl border border-line bg-paper p-3">
          <div className="text-xl font-bold text-emerald-700">{totalParticipants}</div>
          <div className="text-[0.68rem] font-semibold text-ink-soft uppercase tracking-wider">Participants</div>
        </div>
        <div className="rounded-xl border border-line bg-paper p-3">
          <div className="text-xl font-bold text-amber-700">{totalCoordinators}</div>
          <div className="text-[0.68rem] font-semibold text-ink-soft uppercase tracking-wider">Coordinators</div>
        </div>
        <div className="rounded-xl border border-line bg-paper p-3">
          <div className="text-xl font-bold text-purple-700">{totalSpocs}</div>
          <div className="text-[0.68rem] font-semibold text-ink-soft uppercase tracking-wider">SPOCs</div>
        </div>
        <div className="rounded-xl border border-line bg-paper p-3">
          <div className="text-xl font-bold text-amber-900">{unverifiedCount}</div>
          <div className="text-[0.68rem] font-semibold text-ink-soft uppercase tracking-wider">Unverified Email</div>
        </div>
        <div className="rounded-xl border border-line bg-paper p-3">
          <div className="text-xl font-bold text-red-700">{disabledCount}</div>
          <div className="text-[0.68rem] font-semibold text-ink-soft uppercase tracking-wider">Disabled</div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="mt-5 flex flex-wrap gap-2.5 items-center">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, email, or USN..."
          className="w-72 border border-line bg-paper px-4 py-2 text-[0.85rem] rounded-xl outline-none focus-visible:border-marigold"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="border border-line bg-paper px-3 py-2 text-[0.85rem] rounded-xl outline-none focus-visible:border-marigold"
        >
          <option value="">All Roles</option>
          <option value="participant">Participant</option>
          <option value="coordinator">Coordinator</option>
          <option value="spoc">SPOC</option>
          <option value="admin">Admin</option>
        </select>

        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="border border-line bg-paper px-3 py-2 text-[0.85rem] rounded-xl outline-none focus-visible:border-marigold"
        >
          <option value="">All Departments</option>
          <option value="CSE">CSE</option>
          <option value="ISE">ISE</option>
          <option value="AI & ML">AI &amp; ML</option>
          <option value="ECE">ECE</option>
          <option value="CIVIL">CIVIL</option>
          <option value="MECH">MECH</option>
        </select>
      </div>

      {/* User Data Table */}
      <div className="mt-5 overflow-x-auto border border-line bg-paper rounded-2xl shadow-xs">
        <table className="w-full min-w-[900px] border-collapse text-[0.85rem]">
          <thead>
            <tr className="border-b border-line text-left text-[0.7rem] font-semibold text-ink-soft uppercase tracking-wider bg-paper-2">
              <th className="px-4 py-3.5">Name</th>
              <th className="px-4 py-3.5">Email</th>
              <th className="px-4 py-3.5">USN</th>
              <th className="px-4 py-3.5">Role</th>
              <th className="px-4 py-3.5">Dept &amp; Year</th>
              <th className="px-4 py-3.5">Verification</th>
              <th className="px-4 py-3.5">Account Status</th>
              <th className="px-4 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-line last:border-0 hover:bg-paper-2/60">
                <td className="px-4 py-3.5 font-bold text-ink">{u.name}</td>
                <td className="font-mono px-4 py-3.5 text-ink-soft text-[0.8rem] lowercase">{u.email}</td>
                <td className="font-mono px-4 py-3.5 text-ink text-[0.82rem]">{u.usn || '—'}</td>
                <td className="px-4 py-3.5">
                  <span className={`inline-block border px-2 py-0.5 text-[0.68rem] font-bold rounded uppercase tracking-wider ${
                    u.role === 'admin' || u.role === 'spoc' ? 'border-purple-600/30 bg-purple-50 text-purple-900' :
                    u.role === 'coordinator' ? 'border-amber-600/30 bg-amber-50 text-amber-900' :
                    'border-emerald-600/30 bg-emerald-50 text-emerald-900'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-ink-soft">
                  {u.department} (Yr {u.year})
                </td>
                <td className="px-4 py-3.5">
                  {u.email_verified ? (
                    <span className="inline-block border border-emerald-600/30 bg-emerald-50 text-emerald-800 px-1.5 py-0.5 text-[0.65rem] font-bold rounded uppercase">
                      VERIFIED
                    </span>
                  ) : (
                    <span className="inline-block border border-amber-600/30 bg-amber-50 text-amber-800 px-1.5 py-0.5 text-[0.65rem] font-bold rounded uppercase">
                      UNVERIFIED
                    </span>
                  )}
                </td>
                <td className="px-4 py-3.5">
                  {u.is_disabled ? (
                    <span className="inline-block border border-red-600/30 bg-red-50 text-red-800 px-1.5 py-0.5 text-[0.65rem] font-bold rounded uppercase">
                      DISABLED
                    </span>
                  ) : (
                    <span className="inline-block border border-emerald-600/30 bg-emerald-50 text-emerald-800 px-1.5 py-0.5 text-[0.65rem] font-bold rounded uppercase">
                      ACTIVE
                    </span>
                  )}
                </td>
                <td className="px-4 py-3.5 text-right flex gap-1 justify-end">
                  <Button
                    variant="secondary"
                    onClick={() => setSelectedUser(u)}
                  >
                    Manage
                  </Button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-ink-soft">
                  {isLoading ? 'Loading user accounts...' : 'No registered users match your search criteria.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* USER MANAGEMENT MODAL */}
      {selectedUser && (
        <div
          onClick={() => setSelectedUser(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-xs p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl border border-line bg-paper shadow-2xl overflow-hidden p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h2 className="font-display text-lg font-bold text-ink">Manage User Account</h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-line text-ink hover:bg-paper-3 text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-[0.85rem]">
              <div><strong>Name:</strong> {selectedUser.name}</div>
              <div><strong>Email:</strong> {selectedUser.email}</div>
              <div><strong>USN:</strong> <code>{selectedUser.usn || 'Not Set'}</code></div>
              <div><strong>Role:</strong> {selectedUser.role}</div>
              <div><strong>Department:</strong> {selectedUser.department} (Year {selectedUser.year})</div>
              <div><strong>Email Verification:</strong> {selectedUser.email_verified ? 'Verified' : 'Unverified'}</div>
              <div><strong>Account Status:</strong> {selectedUser.is_disabled ? 'Disabled' : 'Active'}</div>
              <div><strong>Created Date:</strong> {new Date(selectedUser.created_at).toLocaleString('en-IN')}</div>
            </div>

            <div className="border-t border-line pt-4 flex flex-col gap-2">
              <Button
                variant="secondary"
                disabled={resetPasswordMutation.isPending}
                onClick={() => resetPasswordMutation.mutate(selectedUser.id)}
              >
                📧 Trigger Password Reset Link Email
              </Button>

              {selectedUser.role !== 'admin' && (
                <Button
                  variant={selectedUser.is_disabled ? 'primary' : 'secondary'}
                  disabled={toggleStatusMutation.isPending}
                  onClick={() =>
                    toggleStatusMutation.mutate({
                      id: selectedUser.id,
                      disabled: !selectedUser.is_disabled,
                    })
                  }
                >
                  {selectedUser.is_disabled ? 'Enable Account' : 'Disable Account'}
                </Button>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="ghost" onClick={() => setSelectedUser(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
