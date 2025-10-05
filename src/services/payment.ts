// Mobile Money payment service for PromoGabon integration
// Provides: initiate, status check, polling, and helpers

export type PaymentInitParams = {
  reference: string; // max 15 chars
  amount: number; // integer XOF
  description?: string;
  customer: { name: string; email: string; phone: string }; // phone should be local format 0XXXXXXXX
  delivery: { method: string; address: string };
  items: Array<{ name: string; price: number; quantity: number; description?: string }>;
  provider?: 'airtel_money' | 'moov_money';
};

export type PaymentInitResult = {
  success: boolean;
  http_code?: number;
  response?: any;
  reference?: string;
  error?: string;
};

export async function initiateMobileMoney(params: PaymentInitParams): Promise<PaymentInitResult> {
  try {
    const res = await fetch('/api/payments/mobile-money', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    let data: any = null;
    try {
      data = await res.json();
    } catch (e) {
      data = { raw: await res.text() };
    }

    return {
      success: res.ok && data?.success !== false,
      http_code: res.status,
      response: data,
      reference: params.reference,
      error: data?.error,
    };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Erreur réseau' };
  }
}

export async function checkMobileMoneyStatus(reference: string): Promise<PaymentInitResult & { status?: string }> {
  try {
    const res = await fetch(`/api/payments/mobile-money/status?reference=${encodeURIComponent(reference)}`);
    let data: any = null;
    try {
      data = await res.json();
    } catch (e) {
      data = { raw: await res.text() };
    }

    // Essayez d'extraire le statut selon la structure fournie par la doc
    const status = data?.response?.data?.status || data?.data?.status || data?.status;

    return {
      success: res.ok && data?.success !== false,
      http_code: res.status,
      response: data,
      reference,
      status,
      error: data?.error,
    };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Erreur réseau', reference };
  }
}

export async function pollMobileMoneyStatus(
  reference: string,
  options?: { intervalMs?: number; maxAttempts?: number }
): Promise<{ success: boolean; status?: string; data?: any; attempts: number; error?: string }> {
  const interval = options?.intervalMs ?? 2000;
  const max = options?.maxAttempts ?? 12; // ~24s

  for (let attempt = 1; attempt <= max; attempt++) {
    const res = await checkMobileMoneyStatus(reference);
    const status = res.status?.toLowerCase();

    if (!res.success) {
      return { success: false, status, data: res.response, attempts: attempt, error: res.error };
    }

    if (status && ['completed', 'success', 'failed', 'cancelled', 'expired'].includes(status)) {
      return { success: ['completed', 'success'].includes(status), status, data: res.response, attempts: attempt };
    }

    await new Promise((r) => setTimeout(r, interval));
  }

  return { success: false, status: 'timeout', attempts: max, error: 'Timeout de vérification atteint' };
}

// Helper: construire une référence <= 15 chars: CMD_ + 11 chiffres
export function buildPaymentReference(seed?: string) {
  const now = Date.now().toString();
  const suffix = now.slice(-11); // 11 chiffres
  return `CMD_${suffix}`; // total 15
}

