export const APP_NAME = 'NovaMeet';
export const PASSWORD_MIN_LENGTH = 12;
export const ROLES = ['GUEST', 'USER', 'HOST', 'ADMIN', 'SUPER_ADMIN'] as const;
export function canManageMeeting(role: string) { return ['HOST', 'ADMIN', 'SUPER_ADMIN'].includes(role); }
export function redactEmail(email: string) { const [name, domain] = email.split('@'); return `${name.slice(0, 2)}***@${domain}`; }
