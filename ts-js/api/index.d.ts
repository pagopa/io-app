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
export declare type ApiFetchSuccess<T> = {
    isError: false;
    result: T;
};
export declare type ApiFetchFailure = {
    isError: true;
    error: Error;
};
export declare type ApiFetchResult<T> = ApiFetchSuccess<T> | ApiFetchFailure;
export declare type Versionable = {
    version: number;
};
/**
 * A type that makes all fields of type T optional, then adds `version` as the only
 * required field. This type is used mostly to update an API entity.
 */
export declare type WithOnlyVersionRequired<T> = Partial<T> & Versionable;
export declare type ApiProfile = {
    is_inbox_enabled: boolean;
} & Versionable;
export declare type LoginSuccess = {
    success: true;
    token: string;
};
export declare type LoginFailure = {
    success: false;
};
export declare type LoginResult = LoginSuccess | LoginFailure;
export declare const extractLoginResult: (url: string) => LoginSuccess | LoginFailure | null;
export declare const fetchProfile: (token: string) => Promise<ApiFetchResult<ApiProfile>>;
export declare const postProfile: (token: string, newProfile: WithOnlyVersionRequired<ApiProfile>) => Promise<ApiFetchResult<ApiProfile>>;
