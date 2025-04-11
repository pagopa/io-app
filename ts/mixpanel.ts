import { Mixpanel, MixpanelProperties } from "mixpanel-react-native";
import { mixpanelToken, mixpanelUrl } from "./config";
import { getDeviceId } from "./utils/device";
import { GlobalState } from "./store/reducers/types";
import { updateMixpanelSuperProperties } from "./mixpanelConfig/superProperties";
import { updateMixpanelProfileProperties } from "./mixpanelConfig/profileProperties";
import { isTestEnv } from "./utils/environment";

type EnqueuedMixpanelEvent = {
  eventName: string;
  id: string;
  properties: Record<string, unknown>;
};

// Do not export this variables, since it creates a strong dependency on such instances
// eslint-disable-next-line functional/no-let
let mixpanel: Mixpanel | undefined;
const uninitializedMixpanelTrackingQueue = new Map<
  string,
  EnqueuedMixpanelEvent
>();

/**
 * Initialize mixpanel at start
 */
export const initializeMixPanel = async (state: GlobalState) => {
  if (mixpanel !== undefined) {
    return;
  }
  const trackAutomaticEvents = true;
  const privateInstance = new Mixpanel(mixpanelToken, trackAutomaticEvents);
  await privateInstance.init(undefined, undefined, mixpanelUrl);
  mixpanel = privateInstance;

  // On app first open
  // On profile page, when user opt-in
  mixpanel.optInTracking();
  mixpanel.setUseIpAddressForGeolocation(false);

  await updateMixpanelSuperProperties(state);
  await updateMixpanelProfileProperties(state);

  processEnqueuedMixpanelEvents();
};

export const identifyMixpanel = async () => {
  // Identify the user using the device uniqueId
  await mixpanel?.identify(getDeviceId());
};

export const resetMixpanel = () => {
  // Reset mixpanel auto generated uniqueId
  mixpanel?.reset();
};

export const terminateMixpanel = () => {
  if (mixpanel) {
    const mp = mixpanel;
    mp.flush();
    // Wait for the flush to complete
    // (mainly) to let profile properties to update.
    setTimeout(() => {
      mp.optOutTracking();
    }, 1000);
    mixpanel = undefined;
  }
};

export const isMixpanelInstanceInitialized = () => mixpanel != null;

export const getPeople = () => mixpanel?.getPeople();

export const registerSuperProperties = (properties: MixpanelProperties) =>
  mixpanel?.registerSuperProperties(properties);

/**
 * Track an event with properties
 * @param event
 * @param properties
 */
export const mixpanelTrack = (
  event: string,
  properties?: Record<string, unknown>
) => mixpanel?.track(event, properties);

/**
 * Use this method to enqueue a tracking event when mixpanel has not been initialized yet.
 * Be aware that you should not enqueue an event if the user has chosen to opt-out from tracking.
 * This method does nothing if mixpanel is already initialized.
 *
 * Normally, you should use this method when you have to track something upon application initialization,
 * before the mixpanel initialization saga has run. In such case, you must check the 'isMixpanelEnabled'
 * preference (in persistedPreferences) from the redux-store, before using this method. Such property
 * maps the opt-in/opt-out user's choice. Rehydration of the property always happens before any saga is run.
 *
 * @param eventName Mixpanel event name
 * @param id Unique identifier for the enqueueing, in case you have to override it later
 * @param properties Mixpanel properties
 */
export const enqueueMixpanelEvent = (
  eventName: string,
  id: string,
  properties: Record<string, unknown>
) => {
  if (mixpanel != null) {
    return;
  }

  uninitializedMixpanelTrackingQueue.set(id, {
    eventName,
    id,
    properties
  });
};

const processEnqueuedMixpanelEvents = () => {
  // This works since elements in a Map are iterated in the insertion order
  for (const [_key, value] of uninitializedMixpanelTrackingQueue) {
    mixpanel?.track(value.eventName, value.properties);
  }
  uninitializedMixpanelTrackingQueue.clear();
};

export const testable = isTestEnv
  ? { processEnqueuedMixpanelEvents, uninitializedMixpanelTrackingQueue }
  : undefined;
