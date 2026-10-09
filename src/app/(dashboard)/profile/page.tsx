"use client";

import ProfileView from "@/components/ProfileView";

export default function TenantProfilePage() {
  return (
    <div className="w-full">
      <ProfileView isAdminView={false} />;
    </div>
  );
}
