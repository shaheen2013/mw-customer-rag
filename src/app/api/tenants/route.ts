import { NextResponse } from 'next/server';
import { query, mockDatabase } from '@/lib/db';

export async function GET() {
  try {
    const dbTenants = await query('SELECT * FROM tenants ORDER BY id DESC');
    if (dbTenants && Array.isArray(dbTenants) && dbTenants.length > 0) {
      return NextResponse.json({ success: true, source: 'mysql', data: dbTenants });
    }
  } catch (e) {
    console.error('MySQL query error:', e);
  }

  // Fallback to mock data matching PDF screens
  return NextResponse.json({ success: true, source: 'mock', data: mockDatabase.tenants });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, plan } = body;

    const result = await query(
      'INSERT INTO tenants (name, plan, status, queries, storage, assistants, cost, last_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, plan || 'Growth', 'Active', '0 / 5K', '0.1 GB', 1, '$79.00', 'Just now']
    );

    return NextResponse.json({ success: true, inserted: result || { name, plan } });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
