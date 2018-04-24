/**
 * Action types and action creator related to the Session.
 *
 * @flow
 */
import { IDP_SELECTED, LOGIN_SUCCESS, LOGIN_FAILURE } from '../ts-js/constants';
// Creators
export const selectIdp = (idp) => ({
    type: IDP_SELECTED,
    payload: idp
});
export const loginSuccess = (token) => ({
    type: LOGIN_SUCCESS,
    payload: token
});
export const loginFailure = () => ({
    type: LOGIN_FAILURE
});
//# sourceMappingURL=session.js.map
