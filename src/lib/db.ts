// Configured for user credentials: mysql host localhost, user root, password 'password', database mw_rag

type MySQLPool = {
  execute: (sql: string, params?: unknown[]) => Promise<[unknown, unknown]>;
};

let pool: MySQLPool | null = null;

if (typeof window === 'undefined') {
  try {
    // Dynamically require mysql2 only on server side to prevent bundling in browser client code
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mysql = require('mysql2/promise');
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'mw_rag',
      port: Number(process.env.DB_PORT) || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  } catch (e) {
    console.warn('MySQL pool creation skipped or failed:', e);
  }
}

// Memory database fallback for instant seamless demo matching PDF designs
export const mockDatabase = {
  tenants: [
    { id: 1, name: 'Acme Corp', plan: 'Business', queries: '8,420 / 10K', storage: '8.6 GB', assistants: 1, status: 'Active', lastActive: 'Sep 24', cost: '$412.75' },
    { id: 2, name: 'TechFlow Inc', plan: 'Growth', queries: '4,150 / 5K', storage: '4.2 GB', assistants: 1, status: 'Active', lastActive: 'Sep 24', cost: '$210.50' },
    { id: 3, name: 'Nexus Solutions', plan: 'Starter', queries: '890 / 1K', storage: '0.8 GB', assistants: 1, status: 'Active', lastActive: 'Sep 23', cost: '$29.00' },
    { id: 4, name: 'Global Dynamic', plan: 'Enterprise', queries: '34,200 / Custom', storage: '45.1 GB', assistants: 5, status: 'Active', lastActive: 'Sep 24', cost: '$1,850.00' },
    { id: 5, name: 'Apex AI Labs', plan: 'Growth', queries: '1,200 / 5K', storage: '1.5 GB', assistants: 1, status: 'Trial', lastActive: 'Sep 22', cost: '$0.00' },
    { id: 6, name: 'Vortex Media', plan: 'Business', queries: '0 / 15K', storage: '2.1 GB', assistants: 2, status: 'Suspended', lastActive: 'Aug 15', cost: '$0.00' },
  ],
  documents: [
    { id: 1, file: 'Refund Policy.pdf', type: 'PDF', size: '1.2 MB', uploaded: 'Sep 24', assistant: 'Acme Support', status: 'Indexed', used: 'Active' },
    { id: 2, file: 'Product Specification v2.docx', type: 'DOCX', size: '4.5 MB', uploaded: 'Sep 23', assistant: 'Acme Support', status: 'Indexed', used: 'Active' },
    { id: 3, file: 'Terms of Service 2026.pdf', type: 'PDF', size: '890 KB', uploaded: 'Sep 22', assistant: 'Acme Support', status: 'Indexed', used: 'Active' },
    { id: 4, file: 'Customer FAQ Handout.pdf', type: 'PDF', size: '2.1 MB', uploaded: 'Sep 24', assistant: 'Acme Support', status: 'Processing', used: 'Pending' },
    { id: 5, file: 'Legacy API Specs.pdf', type: 'PDF', size: '12.4 MB', uploaded: 'Sep 20', assistant: 'Acme Support', status: 'Failed', used: 'Inactive' },
  ],
  webSources: [
    { id: 1, url: 'https://acme.com/help', pages: 124, frequency: 'Daily', lastSync: '2h ago', index: 'Connected', errors: 0, status: 'Active' },
    { id: 2, url: 'https://acme.com/docs/api', pages: 280, frequency: 'Daily', lastSync: '4h ago', index: 'Connected', errors: 2, status: 'Active' },
    { id: 3, url: 'https://acme.com/pricing', pages: 24, frequency: 'Weekly', lastSync: '1d ago', index: 'Connected', errors: 5, status: 'Active' },
  ],
  conversations: [
    { id: '1048', visitor: 'Visitor #1048', topic: 'Do you integrate with SAP?', response: 'I could not find enough approved information to answer confidently.', status: 'Weak Answer', confidence: 'Low', feedback: 'Neutral', date: 'Today 10:42 AM', gapDetected: true },
    { id: '1047', visitor: 'Visitor #1047', topic: 'What is your refund policy?', response: 'Refunds are available within 30 days of purchase upon request.', status: 'Answered', confidence: 'High', feedback: 'Positive', date: 'Today 09:15 AM', gapDetected: false },
    { id: '1046', visitor: 'Visitor #1046', topic: 'Where can I find API key settings?', response: 'API keys can be generated under Organization Settings > API / Webhooks.', status: 'Answered', confidence: 'High', feedback: 'Positive', date: 'Yesterday 04:30 PM', gapDetected: false },
    { id: '1045', visitor: 'Visitor #1045', topic: 'Can I pay via wire transfer?', response: 'We accept Credit Card, PayPal, and invoice-based wire transfer for Enterprise plans.', status: 'Answered', confidence: 'Medium', feedback: 'Positive', date: 'Yesterday 02:10 PM', gapDetected: false },
    { id: '1044', visitor: 'Visitor #1044', topic: 'Is HIPAA compliance supported?', response: 'HIPAA compliance is available exclusively on Enterprise custom plans with BAA signing.', status: 'Unanswered', confidence: 'Low', feedback: 'Negative', date: 'Sep 23', gapDetected: true },
  ]
};

export async function query(sql: string, params: unknown[] = []) {
  if (pool) {
    try {
      const [rows] = await pool.execute(sql, params);
      return rows;
    } catch (err) {
      console.warn('MySQL Query Execution fallback:', err);
    }
  }
  return null;
}

export default pool;
