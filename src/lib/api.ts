const API_BASE = typeof import.meta.env.VITE_API_URL === 'string' && import.meta.env.VITE_API_URL.trim()
  ? import.meta.env.VITE_API_URL.trim().replace(/\/$/, '')
  : '';

function getAuthHeaders(): HeadersInit {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('adminToken') ?? localStorage.getItem('authToken') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface DashboardStats {
  totalUsers: number;
  newUsers: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  totalDeliveredOrders: number;
  totalProfit: number;
  activeProducts: number;
  adjustments?: {
    manualOrders: number;
    manualRevenue: number;
    manualProfit: number;
    manualCompletedOrders: number;
  };
}

export async function fetchDashboardStats(params?: { period?: string; year?: string }): Promise<DashboardStats> {
  const q = new URLSearchParams();
  if (params?.period) q.set('period', params.period);
  if (params?.year) q.set('year', params.year);
  const url = `${API_BASE}/api/dashboard/stats${q.toString() ? `?${q}` : ''}`;
  const res = await fetch(url, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error(await res.text().then((t) => (() => { try { return JSON.parse(t).message; } catch { return t; } })()));
  const json = await res.json();
  return json.data;
}

export interface AdjustmentsPayload {
  addOrders?: number;
  addRevenue?: number;
  addProfit?: number;
  addCompletedOrders?: number;
}

export async function patchDashboardAdjustments(payload: AdjustmentsPayload): Promise<void> {
  const res = await fetch(`${API_BASE}/api/dashboard/adjustments`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const t = await res.text();
    let msg = t;
    try {
      const j = JSON.parse(t);
      if (j.message) msg = j.message;
    } catch {}
    throw new Error(msg);
  }
}
