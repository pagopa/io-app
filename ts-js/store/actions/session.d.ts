/**
 * Action types and action creator related to the Session.
 *
 * @flow
 */
import { IdentityProvider } from '../../api';
import { IDP_SELECTED, LOGIN_SUCCESS, LOGIN_FAILURE } from './constants';
export declare type IdpSelected = {
    type: typeof IDP_SELECTED;
    payload: IdentityProvider;
};
export declare type LoginSuccess = {
    type: typeof LOGIN_SUCCESS;
    payload: string;
};
export declare type LoginFailure = {
    type: typeof LOGIN_FAILURE;
};
export declare type SessionActions = IdpSelected | LoginSuccess | LoginFailure;
export declare const selectIdp: (idp: IdentityProvider) => IdpSelected;
export declare const loginSuccess: (token: string) => LoginSuccess;
export declare const loginFailure: () => LoginFailure;
