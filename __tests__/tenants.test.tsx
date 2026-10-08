import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TenantsPage from '@/app/admin/tenants/page';
import { AuthProvider } from '@/context/AuthContext';
import { tenantsApi, TenantItem } from '@/lib/api/tenants';
import { useAuthStore } from '@/store/useAuthStore';

// Mock tenantsApi
vi.mock('@/lib/api/tenants', () => ({
  tenantsApi: {
    getStats: vi.fn(),
    getTenants: vi.fn(),
    getTenant: vi.fn(),
    createTenant: vi.fn(),
    updateTenant: vi.fn(),
    updateTenantStatus: vi.fn(),
    updateTenantEntitlements: vi.fn(),
    deleteTenant: vi.fn(),
  },
}));

const mockTenantsList: TenantItem[] = [
  {
    id: 't-001',
    name: 'Cyberdyne Systems',
    slug: 'cyberdyne-systems',
    status: 'active',
    plan_tier: 'business',
    entitlements: {
      monthly_query_limit: 15000,
      storage_bytes: 10737418240,
    },
    queries_count: 2420,
    storage_bytes: 5368709120,
    assistants_count: 2,
    users_count: 4,
    documents_count: 18,
    created_at: '2026-02-15T10:00:00Z',
    updated_at: '2026-10-08T12:00:00Z',
  },
  {
    id: 't-002',
    name: 'Apex AI Labs',
    slug: 'apex-ai-labs',
    status: 'trial',
    plan_tier: 'growth',
    entitlements: {
      monthly_query_limit: 5000,
      storage_bytes: 5368709120,
    },
    queries_count: 310,
    storage_bytes: 1073741824,
    assistants_count: 1,
    users_count: 1,
    documents_count: 3,
    created_at: '2026-09-01T14:30:00Z',
    updated_at: '2026-10-05T09:00:00Z',
  },
];

describe('Super Admin Tenants Page & CRUD Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();

    useAuthStore.getState().setAuth(
      {
        id: 'super-001',
        email: 'superadmin@mediusware.ai',
        name: 'Super Admin',
        role: 'super_admin',
      },
      {
        accessToken: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token',
      }
    );

    (tenantsApi.getStats as ReturnType<typeof vi.fn>).mockResolvedValue({
      total: 42,
      active: 39,
      trial: 2,
      suspended: 1,
    });

    (tenantsApi.getTenants as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: mockTenantsList,
      meta: {
        total: 2,
        limit: 100,
        offset: 0,
      },
    });
  });

  it('renders stats overview cards and real tenant rows from backend API', async () => {
    render(
      <AuthProvider>
        <TenantsPage />
      </AuthProvider>
    );

    expect(screen.getByText('Tenants')).toBeInTheDocument();
    expect(screen.getByText(/Super Admin Governance Mode/i)).toBeInTheDocument();

    // Verify stats
    await waitFor(() => {
      expect(screen.getByText('42')).toBeInTheDocument();
      expect(screen.getByText('39')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    // Verify tenant list rendered
    await waitFor(() => {
      expect(screen.getByText('Cyberdyne Systems')).toBeInTheDocument();
      expect(screen.getByText('cyberdyne-systems')).toBeInTheDocument();
      expect(screen.getByText('Apex AI Labs')).toBeInTheDocument();
    });
  });

  it('opens Add Tenant modal and creates tenant via API', async () => {
    (tenantsApi.createTenant as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 't-003',
      name: 'OmniCorp Global',
      slug: 'omnicorp-global',
      status: 'active',
      plan_tier: 'enterprise',
      entitlements: { monthly_query_limit: 50000 },
      created_at: '2026-10-08T13:00:00Z',
    });

    render(
      <AuthProvider>
        <TenantsPage />
      </AuthProvider>
    );

    const addButton = screen.getByRole('button', { name: /Add Tenant/i });
    fireEvent.click(addButton);

    expect(screen.getByText('Add New Client Organization')).toBeInTheDocument();

    const nameInput = screen.getByPlaceholderText('e.g. Cyberdyne Systems');
    fireEvent.change(nameInput, { target: { value: 'OmniCorp Global' } });

    const createSubmitBtn = screen.getByRole('button', { name: /Create Tenant/i });
    const form = createSubmitBtn.closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(tenantsApi.createTenant).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'OmniCorp Global',
          slug: 'omnicorp-global',
        })
      );
    });
  });

  it('opens Edit Tenant modal and updates tenant via API', async () => {
    (tenantsApi.updateTenant as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 't-001',
      name: 'Cyberdyne Systems Corp',
      slug: 'cyberdyne-systems',
      status: 'active',
      plan_tier: 'business',
      entitlements: { monthly_query_limit: 20000 },
      updated_at: '2026-10-08T14:00:00Z',
    });

    render(
      <AuthProvider>
        <TenantsPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Cyberdyne Systems')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByTitle('Edit Tenant');
    fireEvent.click(editButtons[0]);

    expect(screen.getByText('Edit Organization Settings')).toBeInTheDocument();

    const saveChangesBtn = screen.getByRole('button', { name: /Save Changes/i });
    const form = saveChangesBtn.closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(tenantsApi.updateTenant).toHaveBeenCalledWith(
        't-001',
        expect.objectContaining({
          name: 'Cyberdyne Systems',
        })
      );
    });
  });

  it('opens Delete confirmation dialog and deletes tenant via API', async () => {
    (tenantsApi.deleteTenant as ReturnType<typeof vi.fn>).mockResolvedValue({
      status: 'deleted',
      tenant_id: 't-001',
      message: 'Tenant deleted',
    });

    render(
      <AuthProvider>
        <TenantsPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Cyberdyne Systems')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTitle('Delete Tenant');
    fireEvent.click(deleteButtons[0]);

    expect(screen.getByText('Delete Tenant Organization')).toBeInTheDocument();

    const dialog = screen.getByRole('alertdialog');
    const confirmDeleteBtn = dialog.querySelector('button.bg-rose-600') as HTMLButtonElement;
    fireEvent.click(confirmDeleteBtn);

    await waitFor(() => {
      expect(tenantsApi.deleteTenant).toHaveBeenCalledWith('t-001');
    });
  });
});
