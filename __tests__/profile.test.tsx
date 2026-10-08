import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider } from '@/context/AuthContext';
import ProfileView from '@/components/ProfileView';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/store/useAuthStore';

// Mock authApi
vi.mock('@/lib/api/auth', () => ({
  authApi: {
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
    uploadAvatar: vi.fn(),
    changePassword: vi.fn(),
  },
}));

describe('ProfileView and Password Change Feature', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();

    useAuthStore.getState().setAuth(
      {
        id: 'admin-001',
        email: 'admin@mediusware.ai',
        name: 'Super Admin',
        role: 'super_admin',
        tenantName: 'Mediusware AI Platform',
      },
      {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      }
    );

    (authApi.getProfile as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'admin-001',
      email: 'admin@mediusware.ai',
      name: 'Super Admin',
      phone_number: '+1-800-555-0199',
      avatar_url: null,
      role: 'super_admin',
      tenant_name: 'Mediusware AI Platform',
      is_active: true,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-10-07T12:00:00Z',
    });
  });

  it('renders the profile details and user metadata', async () => {
    render(
      <AuthProvider>
        <ProfileView isAdminView={true} />
      </AuthProvider>
    );

    expect(screen.getByText('Super Admin Profile')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByDisplayValue('Super Admin')).toBeInTheDocument();
      expect(screen.getByDisplayValue('admin@mediusware.ai')).toBeInTheDocument();
      expect(screen.getByDisplayValue('+1-800-555-0199')).toBeInTheDocument();
    });
  });

  it('allows updating personal profile information', async () => {
    (authApi.updateProfile as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'admin-001',
      name: 'Updated Super Admin',
      email: 'newadmin@mediusware.ai',
      phone_number: '+1-555-999-8888',
      avatar_url: null,
      role: 'super_admin',
      tenant_name: 'Mediusware AI Platform',
      is_active: true,
    });

    render(
      <AuthProvider>
        <ProfileView isAdminView={true} />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Super Admin')).toBeInTheDocument();
    });

    const nameInput = screen.getByDisplayValue('Super Admin');
    fireEvent.change(nameInput, { target: { value: 'Updated Super Admin' } });

    const saveButton = screen.getByRole('button', { name: /save profile changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(authApi.updateProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Updated Super Admin',
        })
      );
      expect(screen.getByText(/profile information updated successfully/i)).toBeInTheDocument();
    });
  });

  it('provides the option to change password in the same place and updates password', async () => {
    (authApi.changePassword as ReturnType<typeof vi.fn>).mockResolvedValue({
      status: 'success',
      message: 'Password has been updated successfully.',
    });

    render(
      <AuthProvider>
        <ProfileView isAdminView={true} />
      </AuthProvider>
    );

    // Switch to Change Password tab in the same view
    const passwordTab = screen.getByRole('button', { name: /change password/i });
    fireEvent.click(passwordTab);

    // Check that password fields exist
    expect(screen.getByPlaceholderText(/enter current account password/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter new strong password/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/re-enter new password/i)).toBeInTheDocument();

    const currentPwdInput = screen.getByPlaceholderText(/enter current account password/i);
    const newPwdInput = screen.getByPlaceholderText(/enter new strong password/i);
    const confirmPwdInput = screen.getByPlaceholderText(/re-enter new password/i);

    fireEvent.change(currentPwdInput, { target: { value: 'oldPassword123' } });
    fireEvent.change(newPwdInput, { target: { value: 'newSecretPass456' } });
    fireEvent.change(confirmPwdInput, { target: { value: 'newSecretPass456' } });

    const submitBtn = screen.getByRole('button', { name: /update password/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(authApi.changePassword).toHaveBeenCalledWith({
        current_password: 'oldPassword123',
        new_password: 'newSecretPass456',
      });
      expect(screen.getByText(/password has been updated successfully/i)).toBeInTheDocument();
    });
  });
});
