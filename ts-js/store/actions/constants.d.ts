/**
 * All the actions related costants.
 */
export declare const APPLICATION_INITIALIZED: 'APPLICATION_INITIALIZED';
export declare const APP_STATE_CHANGE_ACTION: 'APP_STATE_CHANGE_ACTION';
export declare const IDP_SELECTED: 'IDP_SELECTED';
export declare const LOGIN_SUCCESS: 'LOGIN_SUCCESS';
export declare const LOGIN_FAILURE: 'LOGIN_FAILURE';
export declare const SESSION_INITIALIZE_SUCCESS: 'SESSION_INITIALIZE_SUCCESS';
export declare const ONBOARDING_CHECK_TOS: 'ONBOARDING_CHECK_TOS';
export declare const ONBOARDING_CHECK_PIN: 'ONBOARDING_CHECK_PIN';
export declare const TOS_ACCEPT_REQUEST: 'TOS_ACCEPT_REQUEST';
export declare const TOS_ACCEPT_SUCCESS: 'TOS_ACCEPT_SUCCESS';
export declare const PIN_CREATE_REQUEST: 'PIN_CREATE_REQUEST';
export declare const PROFILE_LOAD_REQUEST: 'PROFILE_LOAD_REQUEST';
export declare const PROFILE_LOAD_SUCCESS: 'PROFILE_LOAD_SUCCESS';
export declare const PROFILE_LOAD_FAILURE: 'PROFILE_LOAD_FAILURE';
export declare const PROFILE_UPDATE_REQUEST: 'PROFILE_UPDATE_REQUEST';
export declare const PROFILE_UPDATE_SUCCESS: 'PROFILE_UPDATE_SUCCESS';
export declare const PROFILE_UPDATE_FAILURE: 'PROFILE_UPDATE_FAILURE';
export declare const FetchRequestActions: {
    PROFILE_LOAD: string;
    PROFILE_UPDATE: string;
};
export declare type FetchRequestActionsType = keyof typeof FetchRequestActions;
