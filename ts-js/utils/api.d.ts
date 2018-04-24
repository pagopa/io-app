/**
 * Implements the APIs to interact with the backend.
 */
/**
 * The user profile
 */
export declare type ApiUserProfile = {
    family_name: string;
    fiscal_code: string;
    has_profile: boolean;
    is_inbox_enabled?: boolean;
    name: string;
    version: number;
};
/**
 * A type used for all the update operations
 */
export declare type ApiNewUserProfile = {
    family_name?: string;
    fiscal_code?: string;
    is_inbox_enabled?: boolean;
    name?: string;
    version: number;
};
export declare function getUserProfile(apiUrlPrefix: string, token: string): Promise<ApiUserProfile | null>;
export declare function setUserProfile(apiUrlPrefix: string, token: string, newProfile: ApiNewUserProfile): Promise<ApiUserProfile | number | null>;
/**
 * Describes a SPID Identity Provider
 */
export declare type IdentityProvider = {
    id: string;
    logo: any;
    name: string;
    entityID: string;
    profileUrl: string;
};
export declare function isDemoIdp(idp: IdentityProvider): boolean;
