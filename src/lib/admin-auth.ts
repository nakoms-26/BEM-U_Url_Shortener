import { createHash } from "crypto";

export const DATABASE_ACCESS_COOKIE_NAME = "njm_database_access";
export const SUPER_ADMIN_COOKIE_NAME = "njm_super_admin_access";
export const DATABASE_ACCESS_MAX_AGE = 60 * 60 * 8; // 8 jam

export const getDatabaseAccessToken = () => {
  const password = process.env.ADMIN_EDIT_PASSWORD;
  if (!password) {
    return null;
  }
  return createHash("sha256")
    .update(`database-access:${password}`)
    .digest("base64url");
};

export const getSuperAdminAccessToken = () => {
  const password = process.env.SUPER_ADMIN_EDIT_PASSWORD;
  if (!password) {
    return null;
  }
  return createHash("sha256")
    .update(`super-admin-access:${password}`)
    .digest("base64url");
};

export const hasDatabaseAccess = (
  adminCookie?: string | null,
  superAdminCookie?: string | null
) => {
  const expectedAdminToken = getDatabaseAccessToken();
  const expectedSuperToken = getSuperAdminAccessToken();

  if (superAdminCookie && expectedSuperToken && superAdminCookie === expectedSuperToken) {
    return true;
  }

  if (adminCookie && expectedAdminToken && adminCookie === expectedAdminToken) {
    return true;
  }

  return false;
};

export const hasSuperAdminAccess = (cookieValue?: string | null) => {
  const expectedToken = getSuperAdminAccessToken();
  if (!expectedToken) {
    return false;
  }
  return cookieValue === expectedToken;
};
