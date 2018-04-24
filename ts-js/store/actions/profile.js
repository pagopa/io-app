/**
 * Action types and action creator related to the Profile.
 */
import { PROFILE_LOAD_REQUEST, PROFILE_UPDATE_REQUEST } from './constants';
// Creators
export const loadProfile = () => ({
    type: PROFILE_LOAD_REQUEST
});
export const updateProfile = (newProfile) => ({
    type: PROFILE_UPDATE_REQUEST,
    payload: newProfile
});
//# sourceMappingURL=profile.js.map