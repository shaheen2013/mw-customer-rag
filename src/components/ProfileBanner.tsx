/* eslint-disable @next/next/no-img-element */
"use client";

import {
  AlertCircle,
  Building,
  Calendar,
  Camera,
  CheckCircle,
  Loader2,
  Mail,
  Trash2,
} from "lucide-react";
import { useState, type RefObject } from "react";

interface ProfileBannerProps {
  isAdminView: boolean;
  name: string;
  email: string;
  phoneNumber: string;
  tenantName: string;
  userRole: string;
  createdAt: string | null;
  isLoading: boolean;
  avatarUrl: string | null;
  isUploadingAvatar: boolean;
  avatarSuccess: string | null;
  avatarError: string | null;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onAvatarFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveAvatar: () => void;
}

/** Top profile card banner: avatar with upload/remove controls, name, role/status badges, and contact meta. */
export default function ProfileBanner({
  isAdminView,
  name,
  email,
  phoneNumber,
  tenantName,
  userRole,
  createdAt,
  isLoading,
  avatarUrl,
  isUploadingAvatar,
  avatarSuccess,
  avatarError,
  fileInputRef,
  onAvatarFileChange,
  onRemoveAvatar,
}: ProfileBannerProps) {
  const [failedAvatarSrc, setFailedAvatarSrc] = useState<string | null>(null);

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
    "http://localhost:8000";

  const getInitials = (userName?: string | null, userEmail?: string | null) => {
    if (userName && userName.trim()) {
      const parts = userName.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return parts[0].slice(0, 2).toUpperCase();
    }
    if (userEmail && userEmail.trim()) {
      return userEmail.trim().slice(0, 2).toUpperCase();
    }
    return "ME";
  };

  const getResolvedAvatarUrl = (url: string | null) => {
    if (!url) return null;
    if (
      url.startsWith("http://") ||
      url.startsWith("https://") ||
      url.startsWith("data:")
    ) {
      return url;
    }
    return `${apiBaseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const resolvedAvatarSrc = getResolvedAvatarUrl(avatarUrl);

  return (
    <div className="card-panel p-4 sm:p-5 bg-gradient-to-r from-[#0d1527] via-[#0f1b33] to-[#0d1527] border border-[#1b2a47] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 relative z-10">
        {/* Avatar Area with Hover Overlay */}
        <div className="relative group shrink-0">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-[#121f38] border border-blue-500/40 overflow-hidden flex items-center justify-center shadow-lg shadow-blue-950/40">
            {resolvedAvatarSrc && resolvedAvatarSrc !== failedAvatarSrc ? (
              <img
                src={resolvedAvatarSrc}
                alt={name || "User Avatar"}
                className="w-full h-full object-cover"
                onError={() => setFailedAvatarSrc(resolvedAvatarSrc)}
              />
            ) : (
              <span className="text-2xl font-bold text-blue-300 tracking-wider">
                {getInitials(name, email)}
              </span>
            )}
          </div>

          {/* Camera Overlay Trigger */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingAvatar}
            className="absolute inset-0 rounded-xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-0.5 text-white text-[10px] font-semibold cursor-pointer backdrop-blur-[2px]"
            title="Upload new profile picture"
          >
            {isUploadingAvatar ? (
              <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
            ) : (
              <>
                <Camera className="w-5 h-5 text-blue-400" />
                <span>Change</span>
              </>
            )}
          </button>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml,image/gif"
            onChange={onAvatarFileChange}
            className="hidden"
          />
        </div>

        {/* User Overview & Meta Badges */}
        <div className="flex-1 text-center sm:text-left space-y-1.5 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight truncate">
              {name || (isAdminView ? "Super Admin" : "Workspace User")}
            </h2>
            <div className="flex items-center justify-center sm:justify-start gap-1.5 flex-wrap">
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide bg-blue-900/60 text-blue-300 border border-blue-700/50">
                {userRole.replace("_", " ")}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active
              </span>
              {isLoading && (
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium bg-blue-950/60 text-blue-300 border border-blue-800/40">
                  <Loader2 className="w-2.5 h-2.5 animate-spin" />
                  Syncing
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1 text-slate-300">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{email || "admin@mediusware.ai"}</span>
            </span>
            <span className="flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-blue-400" />
              <span>{tenantName}</span>
            </span>
            {/* {phoneNumber && (
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-blue-400" />
                <span>{phoneNumber}</span>
              </span>
            )} */}
            {createdAt && (
              <span className="hidden md:flex items-center gap-1 text-slate-400">
                <Calendar className="w-3 h-3 text-slate-500" />
                <span>Joined {new Date(createdAt).toLocaleDateString()}</span>
              </span>
            )}
          </div>

          {/* Avatar Action Controls */}
          <div className="pt-1 flex items-center justify-center sm:justify-start gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
              className="text-[11px] px-2.5 py-0.5 bg-[#121e36] hover:bg-[#18294a] text-blue-300 border border-blue-500/30 rounded font-medium transition flex items-center gap-1 cursor-pointer"
            >
              <Camera className="w-3 h-3" />
              <span>{avatarUrl ? "Change Photo" : "Upload Photo"}</span>
            </button>

            {avatarUrl && (
              <button
                type="button"
                onClick={onRemoveAvatar}
                disabled={isUploadingAvatar}
                className="text-[11px] px-2 py-0.5 bg-transparent hover:bg-red-950/40 text-slate-400 hover:text-red-400 border border-transparent hover:border-red-900/40 rounded font-medium transition flex items-center gap-1 cursor-pointer"
                title="Remove avatar image"
              >
                <Trash2 className="w-3 h-3" />
                <span>Remove</span>
              </button>
            )}

            {avatarSuccess && (
              <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 ml-1">
                <CheckCircle className="w-3 h-3" /> {avatarSuccess}
              </span>
            )}
            {avatarError && (
              <span className="text-[11px] text-red-400 font-medium flex items-center gap-1 ml-1">
                <AlertCircle className="w-3 h-3" /> {avatarError}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
