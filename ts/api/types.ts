/**
 * Describes a SPID Identity Provider
 */
export type IdentityProvider = {
  id: string;
  logo: any;
  name: string;
  entityID: string;
  profileUrl: string;
};

/**
 * The user profile
 */
export type ApiUserProfile = {
  family_name: string;
  fiscal_code: string;
  has_profile: boolean;
  is_inbox_enabled?: boolean;
  name: string;
  version: number;
};
