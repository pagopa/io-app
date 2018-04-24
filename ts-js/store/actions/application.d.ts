import { APPLICATION_INITIALIZED } from './constants';
/**
 * Action types and action creator related to the Application.
 */
export declare type ApplicationInitialized = {
    type: typeof APPLICATION_INITIALIZED;
};
export declare const applicationInitialized: () => ApplicationInitialized;
export declare type ApplicationActions = ApplicationInitialized;
