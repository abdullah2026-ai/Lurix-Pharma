"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { AvatarUploader } from "@/components/upload/AvatarUploader";
import { toast } from "sonner";
import { auth } from "@/lib/firebase/client";
import { 
  User, 
  Shield, 
  Mail, 
  CalendarDays, 
  BadgeCheck, 
  Pencil, 
  Check, 
  X, 
  Loader2,
  Lock,
  KeyRound
} from "lucide-react";
import { ALL_PERMISSIONS, APP_CONFIG } from "@/lib/constants";

const PERMISSION_LABELS: Record<string, string> = {
  view_dashboard: "View Dashboard",
  manage_sales: "Manage Sales (POS)",
  view_stock: "View Stock",
  manage_stock: "Manage Stock",
  manage_prices: "Edit Prices",
  manage_accounts: "Daily Accounts",
  manage_expenses: "Manage Expenses",
  view_reports: "View Reports",
  manage_users: "Manage Staff",
  manage_settings: "Pharmacy Settings",
  edit_cancel_sales: "Edit & Cancel Sales",
  csv_import_export: "CSV Import/Export",
};

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    SuperAdmin: "bg-amber-100 text-amber-800 border-amber-200",
    Admin: "bg-blue-100 text-blue-800 border-blue-200",
    Employee: "bg-emerald-100 text-emerald-800 border-emerald-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${styles[role] || styles.Employee}`}
    >
      <Shield className="w-3 h-3" />
      {role}
    </span>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
      <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-brand-700" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
        <div className="text-sm font-semibold text-gray-800 mt-0.5">{value}</div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { firebaseUser, userProfile, refreshSession } = useAuth();

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || "");
      setNameInput(userProfile.displayName || "");
      setPhotoUrl((userProfile as any).photoUrl || null);
    }
  }, [userProfile]);

  const handlePhotoChanged = (url: string | null) => {
    setPhotoUrl(url);
    refreshSession();
  };

  const handleSaveName = async () => {
    if (!nameInput.trim() || nameInput.trim() === displayName) {
      setEditingName(false);
      return;
    }

    if (nameInput.trim().length < 2) {
      toast.error("Name must be at least 2 characters");
      return;
    }

    try {
      setSavingName(true);
      const user = auth?.currentUser;
      const token = user ? await user.getIdToken() : "";

      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ displayName: nameInput.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update name");

      setDisplayName(nameInput.trim());
      setEditingName(false);
      toast.success("Display name updated successfully!");
      await refreshSession();
    } catch (err: any) {
      toast.error(err.message || "Failed to save name");
    } finally {
      setSavingName(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setSavingPassword(true);
      const { EmailAuthProvider, reauthenticateWithCredential, updatePassword } =
        await import("firebase/auth");

      const user = auth?.currentUser;
      if (!user || !user.email) throw new Error("Not authenticated");

      // Re-authenticate with current password before changing
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      toast.success("Password changed successfully!");
      setChangingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        toast.error("Current password is incorrect");
      } else if (err.code === "auth/weak-password") {
        toast.error("New password is too weak (min 6 characters)");
      } else {
        toast.error(err.message || "Failed to change password");
      }
    } finally {
      setSavingPassword(false);
    }
  };

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
      </div>
    );
  }

  const isSuperAdmin = userProfile.role === "SuperAdmin";
  const permissions = userProfile.permissions || [];

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader title="Settings & Profile" onMenuToggle={() => {}} />

      <main className="flex-1 p-4 sm:p-6 max-w-5xl mx-auto w-full space-y-6">
        {/* === Profile Card === */}
        <div className="bg-white rounded-3xl shadow-neu border border-gray-100 overflow-hidden">
          {/* Cover gradient */}
          <div className="h-28 bg-gradient-to-br from-[#0C332A] via-emerald-800 to-brand-600 relative">
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
          </div>

          <div className="px-6 pb-6">
            {/* Avatar positioned over cover */}
            <div className="-mt-14 mb-4 flex flex-col sm:flex-row sm:items-end gap-4">
              <AvatarUploader
                currentPhotoUrl={photoUrl}
                displayName={displayName}
                onPhotoChanged={handlePhotoChanged}
              />
              <div className="sm:mb-2 flex flex-col gap-1">
                <RoleBadge role={userProfile.role} />
                <p className="text-[11px] text-gray-400">{APP_CONFIG.name}</p>
              </div>
            </div>

            {/* Display Name Editor */}
            <div className="space-y-1 mb-5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Display Name
              </label>
              {editingName ? (
                <div className="flex items-center gap-2 max-w-xs">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveName();
                      if (e.key === "Escape") setEditingName(false);
                    }}
                    className="flex-1 px-3 py-2 border border-emerald-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-400"
                    autoFocus
                    maxLength={60}
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={savingName}
                    className="p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                  >
                    {savingName ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => { setEditingName(false); setNameInput(displayName); }}
                    className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-gray-900">{displayName}</span>
                  <button
                    onClick={() => setEditingName(true)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                    title="Edit display name"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoRow icon={Mail} label="Email" value={userProfile.email} />
              <InfoRow
                icon={BadgeCheck}
                label="Account Status"
                value={
                  <span className={`font-bold ${userProfile.status === "Active" ? "text-emerald-600" : "text-amber-600"}`}>
                    {userProfile.status}
                  </span>
                }
              />
              <InfoRow
                icon={Lock}
                label="Discount Limit"
                value={`${userProfile.maxDiscountPercent}% or ৳${userProfile.maxDiscountFixed}`}
              />
              <InfoRow
                icon={CalendarDays}
                label="Firebase UID"
                value={
                  <span className="font-mono text-[11px] text-gray-500 break-all">
                    {userProfile.firebaseUid}
                  </span>
                }
              />
            </div>
          </div>
        </div>

        {/* === Permissions Card === */}
        <div className="bg-white rounded-3xl shadow-neu border border-gray-100 p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center">
              <Shield className="w-4 h-4 text-brand-700" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Your Permissions</h2>
              <p className="text-[11px] text-gray-400">
                {isSuperAdmin ? "Full system access as Super Admin" : `${permissions.length} of ${ALL_PERMISSIONS.length} permissions granted`}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ALL_PERMISSIONS.map((perm) => {
              const granted = isSuperAdmin || permissions.includes(perm);
              return (
                <div
                  key={perm}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                    granted
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-gray-50 border-gray-100 text-gray-400"
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full flex-shrink-0 ${
                      granted ? "bg-emerald-500" : "bg-gray-300"
                    }`}
                  />
                  {PERMISSION_LABELS[perm] || perm}
                </div>
              );
            })}
          </div>
        </div>

        {/* === Change Password Card === */}
        <div className="bg-white rounded-3xl shadow-neu border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center">
                <KeyRound className="w-4 h-4 text-brand-700" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">Change Password</h2>
                <p className="text-[11px] text-gray-400">Update your account password securely</p>
              </div>
            </div>
            {!changingPassword && (
              <button
                onClick={() => setChangingPassword(true)}
                className="text-xs font-semibold text-brand-700 hover:text-brand-900 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-xl transition-colors"
              >
                Change
              </button>
            )}
          </div>

          {changingPassword && (
            <form onSubmit={handleChangePassword} className="space-y-3 max-w-sm">
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-gray-50"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-gray-50"
                  placeholder="Min. 6 characters"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-gray-50"
                  placeholder="Repeat new password"
                />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-700 text-white text-xs font-semibold rounded-xl hover:bg-brand-800 transition-colors disabled:opacity-60"
                >
                  {savingPassword ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {savingPassword ? "Saving..." : "Update Password"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setChangingPassword(false);
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-700 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
