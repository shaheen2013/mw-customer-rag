"use client";

import ProfileView from "@/components/ProfileView";

export default function TenantProfilePage() {
  return (
    <div className="w-full bg-green-300">
      <ProfileView isAdminView={false} />;
    </div>
  );
}
