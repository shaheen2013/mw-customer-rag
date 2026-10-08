'use client';

import React from 'react';
import ProfileView from '@/components/ProfileView';

export default function AdminProfilePage() {
  return <ProfileView isAdminView={true} />;
}
