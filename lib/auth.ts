'use client';

export const ADMIN_STORAGE_KEYS = {
  SESSION: 'team_sales_tracker_admin_session_v1',
  PASSWORD_HASH: 'team_sales_tracker_admin_pwd_v1',
};

// Contraseñas válidas predeterminadas para máxima usabilidad
export const DEFAULT_PASSWORDS = ['admin123', 'admin', '1234'];

export interface AdminSessionState {
  isAuthenticated: boolean;
  username: string;
  loginTime?: string;
}

export function getStoredAdminPassword(): string {
  if (typeof window === 'undefined') return 'admin123';
  try {
    const saved = localStorage.getItem(ADMIN_STORAGE_KEYS.PASSWORD_HASH);
    return saved || 'admin123';
  } catch {
    return 'admin123';
  }
}

export function setStoredAdminPassword(newPassword: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ADMIN_STORAGE_KEYS.PASSWORD_HASH, newPassword);
  } catch (e) {
    console.error('Error saving admin password:', e);
  }
}

export function verifyAdminPassword(input: string): boolean {
  const current = getStoredAdminPassword();
  // Validar si coincide con la guardada, o si es la contraseña predeterminada
  if (input === current) return true;
  if (!localStorage.getItem(ADMIN_STORAGE_KEYS.PASSWORD_HASH) && DEFAULT_PASSWORDS.includes(input)) {
    return true;
  }
  return false;
}

export function getAdminSession(): AdminSessionState {
  if (typeof window === 'undefined') {
    return { isAuthenticated: true, username: 'Administrador' };
  }
  try {
    const session = localStorage.getItem(ADMIN_STORAGE_KEYS.SESSION);
    if (!session) return { isAuthenticated: true, username: 'Administrador' };
    const parsed = JSON.parse(session);
    return {
      isAuthenticated: parsed.isAuthenticated !== undefined ? Boolean(parsed.isAuthenticated) : true,
      username: parsed.username || 'Administrador',
      loginTime: parsed.loginTime,
    };
  } catch {
    return { isAuthenticated: true, username: 'Administrador' };
  }
}

export function saveAdminSession(isAuthenticated: boolean, username = 'Administrador'): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      ADMIN_STORAGE_KEYS.SESSION,
      JSON.stringify({
        isAuthenticated,
        username: isAuthenticated ? username : 'Invitado',
        loginTime: new Date().toISOString(),
      })
    );
  } catch (e) {
    console.error('Error saving admin session:', e);
  }
}
