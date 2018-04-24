/**
 * Action types and action creator related to the Profile.
 */
import { ApiProfile, WithOnlyVersionRequired } from '../../api';
import { PROFILE_LOAD_REQUEST, PROFILE_LOAD_SUCCESS, PROFILE_LOAD_FAILURE, PROFILE_UPDATE_REQUEST, PROFILE_UPDATE_SUCCESS, PROFILE_UPDATE_FAILURE } from './constants';
export declare type ProfileLoadRequest = {
    type: typeof PROFILE_LOAD_REQUEST;
};
export declare type ProfileLoadSuccess = {
    type: typeof PROFILE_LOAD_SUCCESS;
    payload: ApiProfile;
};
export declare type ProfileLoadFailure = {
    type: typeof PROFILE_LOAD_FAILURE;
    payload: string;
};
export declare type ProfileUpdateRequest = {
    type: typeof PROFILE_UPDATE_REQUEST;
    payload: WithOnlyVersionRequired<ApiProfile>;
};
export declare type ProfileUpdateSuccess = {
    type: typeof PROFILE_UPDATE_SUCCESS;
    payload: ApiProfile;
};
export declare type ProfileUpdateFailure = {
    type: typeof PROFILE_UPDATE_FAILURE;
    payload: string;
};
export declare type ProfileActions = ProfileLoadRequest | ProfileLoadSuccess | ProfileLoadFailure | ProfileUpdateRequest | ProfileUpdateSuccess | ProfileUpdateFailure;
export declare const loadProfile: () => ProfileLoadRequest;
export declare const updateProfile: (newProfile: WithOnlyVersionRequired<ApiProfile>) => ProfileUpdateRequest;
