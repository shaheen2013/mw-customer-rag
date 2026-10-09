"use client";

import Header from "@/components/Header";
import ProfileBanner from "@/components/ProfileBanner";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/lib/api/auth";
import {
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  Phone,
  Save,
  Shield,
  User as UserIcon,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

interface ProfileViewProps {
  isAdminView?: boolean;
}

export default function ProfileView({ isAdminView = false }: ProfileViewProps) {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    "profile" | "password" | "account"
  >("profile");

  // Profile Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Status & Feedback States
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Avatar Upload States
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarSuccess, setAvatarSuccess] = useState<string | null>(null);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // User meta
  const [userRole, setUserRole] = useState(
    user?.role || (isAdminView ? "super_admin" : "tenant_admin"),
  );
  const [tenantName, setTenantName] = useState(
    user?.tenantName ||
      (isAdminView ? "Platform Root" : "Workspace Organization"),
  );
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  // Fetch live profile from backend on mount
  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      setIsLoading(true);
      try {
        const profile = await authApi.getProfile();
        if (isMounted && profile) {
          setName(profile.name || user?.name || "");
          setEmail(profile.email || user?.email || "");
          setPhoneNumber(
            profile.phone_number || user?.phoneNumber || user?.phone || "",
          );
          setAvatarUrl(profile.avatar_url || user?.avatarUrl || null);
          if (profile.role) setUserRole(profile.role as typeof userRole);
          if (profile.tenant_name) setTenantName(profile.tenant_name);
          if (profile.created_at) setCreatedAt(profile.created_at);
          if (profile.updated_at) setUpdatedAt(profile.updated_at);

          // Sync into Auth store
          updateUser({
            name: profile.name || user?.name || "",
            email: profile.email || user?.email || "",
            phoneNumber: profile.phone_number || undefined,
            avatarUrl: profile.avatar_url || undefined,
            tenantName: profile.tenant_name || user?.tenantName,
          });
        }
      } catch {
        // Fallback to local user state if backend is offline or dev token
        if (isMounted) {
          setName(
            user?.name || (isAdminView ? "Super Admin" : "Workspace User"),
          );
          setEmail(
            user?.email ||
              (isAdminView ? "admin@mediusware.ai" : "user@company.com"),
          );
          setPhoneNumber(user?.phoneNumber || user?.phone || "");
          setAvatarUrl(user?.avatarUrl || null);
          setUserRole(
            user?.role || (isAdminView ? "super_admin" : "tenant_admin"),
          );
          setTenantName(
            user?.tenantName || (isAdminView ? "Platform Root" : "Acme Corp"),
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [
    user?.name,
    user?.email,
    user?.phoneNumber,
    user?.phone,
    user?.avatarUrl,
    user?.role,
    user?.tenantName,
    isAdminView,
    updateUser,
  ]);

  // Handle Profile Update Submission
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

    try {
      const updated = await authApi.updateProfile({
        name: name.trim(),
        // email update is disabled — email cannot be changed from this form
        // email: email.trim().toLowerCase(),
        phone_number: phoneNumber.trim(),
        avatar_url: avatarUrl || undefined,
      });

      // Update local context
      updateUser({
        name: updated.name || name,
        // email: updated.email || email,
        phoneNumber: updated.phone_number || phoneNumber,
        avatarUrl: updated.avatar_url || avatarUrl || undefined,
      });

      setSaveSuccess("Profile information updated successfully.");
      setTimeout(() => setSaveSuccess(null), 3500);
    } catch (err: unknown) {
      const errorMsg =
        (err as { data?: { detail?: string }; message?: string })?.data
          ?.detail ||
        (err as { message?: string })?.message ||
        "Failed to save profile changes. Please try again.";
      setSaveError(
        typeof errorMsg === "string" ? errorMsg : JSON.stringify(errorMsg),
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Avatar Image Selection & Upload
  const handleAvatarFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarError(null);
    setAvatarSuccess(null);

    // Validate size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("Avatar image size must be less than 5MB.");
      return;
    }

    // Validate type
    const validTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
      "image/svg+xml",
      "image/gif",
    ];
    if (!validTypes.includes(file.type)) {
      setAvatarError(
        "Supported image formats: PNG, JPG, JPEG, WEBP, SVG, GIF.",
      );
      return;
    }

    setIsUploadingAvatar(true);

    try {
      const res = await authApi.uploadAvatar(file);
      if (res && res.avatar_url) {
        setAvatarUrl(res.avatar_url);
        updateUser({ avatarUrl: res.avatar_url });
        setAvatarSuccess("Avatar photo updated successfully.");
        setTimeout(() => setAvatarSuccess(null), 3000);
      }
    } catch {
      // Local preview fallback if backend storage is unavailable
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const localDataUrl = uploadEvent.target?.result as string;
        setAvatarUrl(localDataUrl);
        updateUser({ avatarUrl: localDataUrl });
        setAvatarSuccess("Avatar preview updated.");
        setTimeout(() => setAvatarSuccess(null), 3000);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Remove Avatar
  const handleRemoveAvatar = async () => {
    setIsUploadingAvatar(true);
    setAvatarError(null);
    try {
      await authApi.updateProfile({ avatar_url: "" });
      setAvatarUrl(null);
      updateUser({ avatarUrl: undefined });
      setAvatarSuccess("Profile photo removed.");
      setTimeout(() => setAvatarSuccess(null), 3000);
    } catch {
      setAvatarUrl(null);
      updateUser({ avatarUrl: undefined });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword) {
      setPasswordError("Please enter your current password.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError(
        "New password cannot be identical to your current password.",
      );
      return;
    }

    setIsUpdatingPassword(true);

    try {
      const res = await authApi.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });

      setPasswordSuccess(
        res.message || "Password has been updated successfully.",
      );
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(null), 3500);
    } catch (err: unknown) {
      const detail =
        (err as { data?: { detail?: string }; message?: string })?.data
          ?.detail ||
        (err as { message?: string })?.message ||
        "Failed to change password. Please verify your current password.";
      setPasswordError(
        typeof detail === "string" ? detail : JSON.stringify(detail),
      );
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: "", color: "bg-slate-700" };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 10) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) return { score: 1, label: "Weak", color: "bg-red-500" };
    if (score <= 4)
      return { score: 2, label: "Moderate", color: "bg-amber-500" };
    return { score: 3, label: "Strong", color: "bg-emerald-500" };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  return (
    <div className="w-full space-y-4 pb-4">
      <Header
        title={isAdminView ? "Super Admin Profile" : "Account Profile"}
        subtitle="Manage your personal identity, contact details, profile picture, and account credentials."
      />

      {/* Top Profile Card Banner - Compact Executive Header */}
      <ProfileBanner
        isAdminView={isAdminView}
        name={name}
        email={email}
        phoneNumber={phoneNumber}
        tenantName={tenantName}
        userRole={userRole}
        createdAt={createdAt}
        isLoading={isLoading}
        avatarUrl={avatarUrl}
        isUploadingAvatar={isUploadingAvatar}
        avatarSuccess={avatarSuccess}
        avatarError={avatarError}
        fileInputRef={fileInputRef}
        onAvatarFileChange={handleAvatarFileChange}
        onRemoveAvatar={handleRemoveAvatar}
      />

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-[#1b2a47] gap-1 mt-8">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-t-lg transition border-b-2 cursor-pointer ${
            activeTab === "profile"
              ? "border-blue-500 text-blue-400 bg-[#0d1527]"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#0d1527]/50"
          }`}
        >
          <UserIcon className="w-3.5 h-3.5" />
          <span>Profile Details</span>
        </button>

        <button
          onClick={() => setActiveTab("password")}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-t-lg transition border-b-2 cursor-pointer ${
            activeTab === "password"
              ? "border-blue-500 text-blue-400 bg-[#0d1527]"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#0d1527]/50"
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Change Password</span>
        </button>

        <button
          onClick={() => setActiveTab("account")}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-t-lg transition border-b-2 cursor-pointer ${
            activeTab === "account"
              ? "border-blue-500 text-blue-400 bg-[#0d1527]"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#0d1527]/50"
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Role & Workspace</span>
        </button>
      </div>

      {/* Tab 1: Profile Details Form - Compact 2-column Layout */}
      {activeTab === "profile" && (
        <div className="card-panel p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1b2a47] pb-2.5">
            <div>
              <h3 className="text-md font-bold text-white">
                Personal Information
              </h3>
              <p className="text-[11px] text-slate-400">
                Update your public display name and contact phone number.
              </p>
            </div>
          </div>

          {saveSuccess && (
            <div className="p-2.5 bg-emerald-950/60 border border-emerald-700/50 rounded-md flex items-center gap-2 text-xs text-emerald-300">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{saveSuccess}</span>
            </div>
          )}

          {saveError && (
            <div className="p-2.5 bg-red-950/60 border border-red-700/50 rounded-md flex items-center gap-2 text-xs text-red-300">
              <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-3.5">
            {/* 2-Column Row: Full Name & Phone Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Full / Display Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Johnathan Doe"
                    className="input-dark w-full !pl-10 text-xs"
                    style={{ paddingLeft: "2.5rem" }}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 019-2834"
                    className="input-dark w-full !pl-10 text-xs"
                    style={{ paddingLeft: "2.5rem" }}
                  />
                </div>
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  // onChange={(e) => setEmail(e.target.value)}
                  disabled
                  placeholder="name@company.com"
                  className="input-dark w-full !pl-10 text-xs"
                  style={{ paddingLeft: "2.5rem" }}
                  required
                />
              </div>
            </div>

            {/* Action Row */}
            <div className="pt-2 flex items-center justify-end">
              {/* <span className="text-[11px] text-slate-500">
                Updating your email modifies your login credentials across
                sessions.
              </span> */}
              <button
                type="submit"
                disabled={isSaving}
                className="btn-primary text-xs py-1.5 px-3.5 flex items-center gap-1.5 font-semibold shadow-md shadow-blue-600/20 disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Profile Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Security & Password Form - Compact 2-column Layout */}
      {activeTab === "password" && (
        <div className="card-panel p-4 sm:p-5 space-y-4">
          <div className="border-b border-[#1b2a47] pb-2.5">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-blue-400" />
              <span>Change Password</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Ensure your account is protected with a secure password of at
              least 6 characters.
            </p>
          </div>

          {passwordSuccess && (
            <div className="p-2.5 bg-emerald-950/60 border border-emerald-700/50 rounded-md flex items-center gap-2 text-xs text-emerald-300">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className="p-2.5 bg-red-950/60 border border-red-700/50 rounded-md flex items-center gap-2 text-xs text-red-300">
              <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-3.5">
            {/* Current Password */}
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Current Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current account password"
                  className="input-dark w-full !pl-10 !pr-10 text-xs"
                  style={{ paddingLeft: "2.5rem", paddingRight: "2.5rem" }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* 2-Column Row: New Password & Confirm New Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new strong password (min 6 characters)"
                    className="input-dark w-full !pl-10 !pr-10 text-xs"
                    style={{ paddingLeft: "2.5rem", paddingRight: "2.5rem" }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {newPassword && (
                  <div className="mt-1.5 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">Strength:</span>
                      <span className="font-semibold text-slate-300">
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="w-full bg-[#121e36] h-1 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{
                          width: `${(passwordStrength.score / 3) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="input-dark w-full !pl-10 !pr-10 text-xs"
                    style={{ paddingLeft: "2.5rem", paddingRight: "2.5rem" }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Passwords do not match.
                  </p>
                )}
                {confirmPassword && newPassword === confirmPassword && (
                  <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Passwords match!
                  </p>
                )}
              </div>
            </div>

            {/* Action Row */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={
                  isUpdatingPassword ||
                  (!!confirmPassword && newPassword !== confirmPassword)
                }
                className="btn-primary text-xs py-1.5 px-3.5 flex items-center gap-1.5 font-semibold shadow-md shadow-blue-600/20 disabled:opacity-50 cursor-pointer"
              >
                {isUpdatingPassword ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Update Password</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Role & Workspace Metadata - Compact Grid */}
      {activeTab === "account" && (
        <div className="card-panel p-4 sm:p-5 space-y-4">
          <div className="border-b border-[#1b2a47] pb-2.5">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              <span>Assigned Roles & Workspace</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              System access permissions and tenant organization metadata
              assigned to your profile.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-[#121e36]/70 border border-[#1b2a47] rounded-lg space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                User Role
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-300 capitalize">
                  {userRole.replace("_", " ")}
                </span>
                <span className="text-[9px] bg-blue-900/60 text-blue-300 border border-blue-700 px-1.5 py-0.2 rounded font-mono">
                  {userRole}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {userRole.includes("admin")
                  ? "Full administrative permissions to configure tenant resources and audit systems."
                  : "Standard workspace permissions to interact with AI agents and chat sessions."}
              </p>
            </div>

            <div className="p-3 bg-[#121e36]/70 border border-[#1b2a47] rounded-lg space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Workspace / Tenant
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">
                  {tenantName}
                </span>
                {user?.tenantSlug && (
                  <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded font-mono">
                    {user.tenantSlug}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Documents and conversational context are isolated strictly to
                this workspace.
              </p>
            </div>

            <div className="p-3 bg-[#121e36]/70 border border-[#1b2a47] rounded-lg space-y-0.5">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                User Identifier
              </span>
              <p className="text-xs font-mono text-slate-300 select-all truncate">
                {user?.id || "sys-local-user-id"}
              </p>
            </div>

            <div className="p-3 bg-[#121e36]/70 border border-[#1b2a47] rounded-lg space-y-0.5">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Last Profile Update
              </span>
              <p className="text-xs text-slate-300">
                {updatedAt
                  ? new Date(updatedAt).toLocaleString()
                  : "Recently updated"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
