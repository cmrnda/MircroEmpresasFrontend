export type JwtClaims = {
  type?: 'platform' | 'user' | 'client';
  usuario_id?: number;
  cliente_id?: number;
  empresa_id?: number;
  roles?: string[];
  exp?: number;
};

function base64UrlToBase64(input: string): string {
  const pad = '='.repeat((4 - (input.length % 4)) % 4);
  return (input + pad).replace(/-/g, '+').replace(/_/g, '/');
}

export function decodeJwt(token: string): JwtClaims | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const json = atob(base64UrlToBase64(payload));
    return JSON.parse(json) as JwtClaims;
  } catch {
    return null;
  }
}

export function isExpired(claims: JwtClaims | null): boolean {
  if (!claims?.exp) return true;
  const now = Math.floor(Date.now() / 1000);
  return claims.exp <= now;
}
