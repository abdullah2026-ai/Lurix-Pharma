"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Edit2, 
  Lock, 
  RefreshCw, 
  AlertTriangle, 
  Check, 
  X,
  UserCheck,
  Percent
} from "lucide-react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { useAuth } from "@/context/AuthContext";
import { IUserProfile } from "@/lib/types";
import { USER_ROLES, USER_STATUS, ALL_PERMISSIONS, Permission, UserRole, UserStatus } from "@/lib/constants";
import { formatDhakaDateTime } from "@/lib/timezone";
import { toast } from "sonner";
import { auth } from "@/lib/firebase/client";

export default function UsersManagementPage() {
  const { userProfile, hasPermission } = useAuth();
  const [users, setUsers] = useState<IUserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit user modal
  const [editingUser, setEditingUser] = useState<IUserProfile | null>(null);
  const [role, setRole] = useState<UserRole>("Employee");
  const [status, setStatus] = useState<UserStatus>("Active");
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [maxDiscountPercent, setMaxDiscountPercent] = useState<number>(10);
  const [maxDiscountFixed, setMaxDiscountFixed] = useState<number>(500);
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = await auth?.currentUser?.getIdToken();
      if (!token) return;

      const res = await fetch("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to load staff list");
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err: any) {
      console.error(err);
      toast.error("Could not fetch user accounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenEdit = (user: IUserProfile) => {
    setEditingUser(user);
    setRole(user.role);
    setStatus(user.status);
    setPermissions(user.permissions || []);
    setMaxDiscountPercent(user.maxDiscountPercent || 0);
    setMaxDiscountFixed(user.maxDiscountFixed || 0);
  };

  const handleTogglePermission = (perm: Permission) => {
    if (permissions.includes(perm)) {
      setPermissions(permissions.filter((p) => p !== perm));
    } else {
      setPermissions([...permissions, perm]);
    }
  };

  const handleSelectAllPermissions = () => {
    setPermissions([...ALL_PERMISSIONS]);
  };

  const handleClearPermissions = () => {
    setPermissions([]);
  };

  const handleQuickApprove = async (user: IUserProfile) => {
    try {
      const token = await auth?.currentUser?.getIdToken();
      if (!token) return;

      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user._id,
          status: "Active",
          permissions: ["view_dashboard", "manage_sales", "view_stock"],
          maxDiscountPercent: 10,
          maxDiscountFixed: 500,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Approval failed");

      toast.success(`${user.displayName || user.email} approved as Active Staff!`);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Failed to approve staff");
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser?._id) return;

    try {
      setSaving(true);
      const token = await auth?.currentUser?.getIdToken();
      if (!token) return;

      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: editingUser._id,
          role,
          status,
          permissions,
          maxDiscountPercent: Number(maxDiscountPercent),
          maxDiscountFixed: Number(maxDiscountFixed),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update user");

      toast.success("User access and permissions updated successfully!");
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Failed to save user changes");
    } finally {
      setSaving(false);
    }
  };

  const pendingUsers = users.filter((u) => u.status === "Pending");

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F2F5F3]">
      <DashboardHeader title="Staff Approvals & Access" />

      <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* Header Bar */}
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-emerald-950/5 shadow-neu-flat flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Staff & Security Management</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Approve employee registrations, configure roles, and assign discount limits
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchUsers}
              className="p-2.5 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 transition-all"
              title="Refresh staff list"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-brand-600" : ""}`} />
            </button>
          </div>
        </div>

        {/* Pending Approvals Alert Banner */}
        {pendingUsers.length > 0 && (
          <div className="p-5 rounded-3xl bg-amber-50 border border-amber-200/80 shadow-neu-flat flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-900">
                  {pendingUsers.length} Registration(s) Awaiting Review
                </h3>
                <p className="text-xs text-amber-700/80 mt-0.5">
                  New staff accounts cannot access business stock or create sales until approved.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Users Table Card */}
        <div className="bg-white rounded-3xl border border-emerald-950/5 shadow-neu-flat overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] border-b border-gray-100">
                <tr>
                  <th className="py-4 px-5">Staff Member</th>
                  <th className="py-4 px-4">Role</th>
                  <th className="py-4 px-4">Account Status</th>
                  <th className="py-4 px-4">Assigned Permissions</th>
                  <th className="py-4 px-4">Discount Cap</th>
                  <th className="py-4 px-4">Registered Date</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400">
                      Loading staff records...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400">
                      No user accounts registered.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => {
                    const isPending = u.status === "Pending";
                    const isActive = u.status === "Active";
                    const isSuper = u.role === "SuperAdmin";

                    return (
                      <tr key={u._id?.toString()} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-4 px-5">
                          <div className="font-bold text-gray-900">{u.displayName || "Staff"}</div>
                          <div className="text-[11px] text-gray-500 font-mono">{u.email}</div>
                        </td>

                        <td className="py-4 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              isSuper
                                ? "bg-purple-100 text-purple-900"
                                : u.role === "Admin"
                                ? "bg-blue-100 text-blue-900"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              isActive
                                ? "bg-emerald-100 text-emerald-800"
                                : isPending
                                ? "bg-amber-100 text-amber-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          {isSuper ? (
                            <span className="text-[11px] font-bold text-purple-700">All System Access</span>
                          ) : u.permissions && u.permissions.length > 0 ? (
                            <span className="text-[11px] font-semibold text-gray-700">
                              {u.permissions.length} module(s)
                            </span>
                          ) : (
                            <span className="text-[11px] text-gray-400">None</span>
                          )}
                        </td>

                        <td className="py-4 px-4 font-semibold text-gray-800">
                          {isSuper ? "Unlimited" : `${u.maxDiscountPercent || 0}% / ৳${u.maxDiscountFixed || 0}`}
                        </td>

                        <td className="py-4 px-4 text-gray-500 text-[11px]">
                          {formatDhakaDateTime(u.createdAt)}
                        </td>

                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isPending && (
                              <button
                                onClick={() => handleQuickApprove(u)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm transition-all"
                              >
                                Approve
                              </button>
                            )}

                            <button
                              onClick={() => handleOpenEdit(u)}
                              className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200"
                              title="Edit Permissions & Role"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit User Modal */}
        {editingUser && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 my-8 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-base font-bold text-gray-900">Manage Staff Permissions</h2>
                  <p className="text-xs text-gray-500">{editingUser.displayName} ({editingUser.email})</p>
                </div>
                <button onClick={() => setEditingUser(null)}>
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSaveUser} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      System Role
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as UserRole)}
                      className="w-full px-3 py-2 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-900"
                    >
                      {USER_ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Account Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as UserStatus)}
                      className="w-full px-3 py-2 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-900"
                    >
                      {USER_STATUS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Max Discount (%) Limit
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={maxDiscountPercent}
                      onChange={(e) => setMaxDiscountPercent(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Max Fixed Discount (৳)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={maxDiscountFixed}
                      onChange={(e) => setMaxDiscountFixed(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-900"
                    />
                  </div>
                </div>

                {/* Granular Permissions Checkbox Grid */}
                <div className="border-t border-gray-100 pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-gray-900">Module Permissions</span>
                      <p className="text-[11px] text-gray-500">Fine-grained access rights for this employee</p>
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                      <button
                        type="button"
                        onClick={handleSelectAllPermissions}
                        className="text-brand-600 font-semibold hover:underline"
                      >
                        All
                      </button>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={handleClearPermissions}
                        className="text-gray-400 font-semibold hover:underline"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1">
                    {ALL_PERMISSIONS.map((perm) => {
                      const isChecked = permissions.includes(perm);
                      return (
                        <label
                          key={perm}
                          className={`flex items-center gap-2.5 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                            isChecked
                              ? "bg-brand-50 border-brand-200 text-brand-900 font-semibold"
                              : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleTogglePermission(perm)}
                            className="rounded text-brand-600 focus:ring-brand-500 w-3.5 h-3.5"
                          />
                          <span className="truncate">{perm.replace(/_/g, " ")}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 rounded-2xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-neu-flat"
                  >
                    {saving ? "Saving..." : "Save Settings"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
