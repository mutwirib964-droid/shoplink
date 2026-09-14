/**
 * Dedicated Security & Authorization Guard for Platform Administration
 * 
 * Access to the ShopLink Kenya SuperAdmin Console is strictly bound to the
 * verified cryptographic user identity (Supabase Auth UID + Email) of:
 * Brian Mutwiri (mutwirib964@gmail.com)
 * UID: fdf58936-e070-4dde-84b7-07fee9503b8a
 * 
 * Any other user or attempted spoofing is forbidden and denied access.
 */

export const SUPERADMIN_IDENTITY = {
  UID: 'fdf58936-e070-4dde-84b7-07fee9503b8a',
  EMAIL: 'mutwirib964@gmail.com',
  FULL_NAME: 'Brian Mutwiri',
  PHONE: '0741114162',
};

/**
 * Checks if the provided user object matches the verified SuperAdmin identity.
 * Validates both UID and Email.
 */
export function isAuthorizedSuperAdmin(user?: { id?: string; email?: string; role?: string } | null): boolean {
  if (!user || !user.id || !user.email) {
    return false;
  }

  const matchesUid = user.id.trim() === SUPERADMIN_IDENTITY.UID;
  const matchesEmail = user.email.trim().toLowerCase() === SUPERADMIN_IDENTITY.EMAIL.toLowerCase();

  return matchesUid && matchesEmail;
}

/**
 * Helper to check if an email alone matches (used only for pre-fill hints or initial routing).
 */
export function isSuperAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === SUPERADMIN_IDENTITY.EMAIL.toLowerCase();
}
