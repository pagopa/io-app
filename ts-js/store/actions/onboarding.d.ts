/**
 * Action types and action creator related to the Onboarding.
 */
import { TOS_ACCEPT_REQUEST, TOS_ACCEPT_SUCCESS } from './constants';
export declare type TosAcceptRequest = {
    type: typeof TOS_ACCEPT_REQUEST;
};
export declare type TosAcceptSuccess = {
    type: typeof TOS_ACCEPT_SUCCESS;
};
export declare type OnboardingActions = TosAcceptRequest | TosAcceptSuccess;
export declare const acceptTos: () => TosAcceptRequest;
