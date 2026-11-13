import { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import ConfirmDialog from '../../components/ConfirmDialog';

export default function ManageUsers() {
  const { users, toggleUserStatus } = useAdmin();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pendingUser, setPendingUser] = useState(null); // user waiting for confirmation

  const visible = users.filter((u) => {
    const q = query.toLowerCase();
    const matchesText = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchesText && matchesStatus;
  });

  const suspending = pendingUser?.status === 'active';

  return (
    <>
      <h1 className="admin-title">Manage Users</h1>

      <div className="admin-toolbar">
        <input className="input" type="search" placeholder="Search by name or email…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <select className="select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {visible.length === 0 ? (
        <p className="empty-state">No users found.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Joined</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>
            {visible.map((u) => (
              <tr key={u.id}>
                {/* data-label is shown as the field name on mobile (see Admin.css) */}
                <td data-label="Name">{u.name}</td>
                <td data-label="Email">{u.email}</td>
                <td data-label="Joined">{u.joined}</td>
                <td data-label="Status"><span className={`badge badge-${u.status}`}>{u.status}</span></td>
                <td data-label="Action">
                  <button
                    className={`btn btn-sm ${u.status === 'active' ? 'btn-danger' : 'btn-success'}`}
                    onClick={() => setPendingUser(u)}
                  >
                    {u.status === 'active' ? 'Suspend' : 'Reactivate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {pendingUser && (
        <ConfirmDialog
          title={suspending ? 'Suspend account?' : 'Reactivate account?'}
          message={
            suspending
              ? `${pendingUser.name} will not be able to log in or post until reactivated.`
              : `${pendingUser.name} will regain full access to their account.`
          }
          confirmLabel={suspending ? 'Suspend account' : 'Reactivate account'}
          cancelLabel="Cancel"
          onConfirm={() => { toggleUserStatus(pendingUser.id); setPendingUser(null); }}
          onCancel={() => setPendingUser(null)}
        />
      )}
    </>
  );
}
