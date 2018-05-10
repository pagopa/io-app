/**
 * Types to interact with the ProxyApi
 */

export interface Versionable {
  version: number;
}

export type WithOnlyVersionRequired<T> = Partial<T> & Versionable;

/**
 * Describes a SPID Identity Provider
 */
export interface IIdentityProvider {
  id: string;
  logo: any;
  name: string;
  entityID: string;
  profileUrl: string;
}

/**
 * The user profile
 */
export interface IApiProfile {
  family_name: string;
  fiscal_code: string;
  has_profile: boolean;
  is_inbox_enabled?: boolean;
  name: string;
  version: number;
}

export interface IInstallation {
  uuid: string;
  token: string;
  platform: string;
}
