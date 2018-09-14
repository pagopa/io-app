import { fromNullable } from "fp-ts/lib/Option";

import { ProfileState } from "../../store/reducers/profile";

import { BlockedInboxOrChannels } from "../../../definitions/backend/BlockedInboxOrChannels";
import { InitializedProfile } from "../../../definitions/backend/InitializedProfile";
import { ServiceId } from "../../../definitions/backend/ServiceId";

/**
 * The enabled/disabled state of each channel.
 *
 * Consider generating this map from the API specs.
 */
export interface EnabledChannels {
  inbox: boolean;
  email: boolean;
  push: boolean;
}

const INBOX_CHANNEL = "INBOX";
const EMAIL_CHANNEL = "EMAIL";
const PUSH_CHANNEL = "WEBHOOK";

/**
 * Finds out which channels are enabled in the profile for the provided service
 */
export function getEnabledChannelsForService(
  profileState: ProfileState,
  serviceId: ServiceId
): EnabledChannels {
  return fromNullable(profileState)
    .mapNullable(
      profile =>
        InitializedProfile.is(profile)
          ? profile.blocked_inbox_or_channels
          : null
    )
    .mapNullable(blockedChannels => blockedChannels[serviceId])
    .map(_ => ({
      inbox: _.indexOf(INBOX_CHANNEL) === -1,
      email: _.indexOf(EMAIL_CHANNEL) === -1,
      push: _.indexOf(PUSH_CHANNEL) === -1
    }))
    .getOrElse({
      inbox: true,
      email: true,
      push: true
    });
}

/**
 * Returns a function that generates updated blocked channels from the
 * enabled channels
 */
export const getBlockedChannels = (
  profileState: ProfileState,
  serviceId: ServiceId
) => (enabled: EnabledChannels): BlockedInboxOrChannels => {
  // get the current blocked channels from the profile
  const profileBlockedChannels = fromNullable(profileState)
    .mapNullable(
      profile =>
        InitializedProfile.is(profile)
          ? profile.blocked_inbox_or_channels
          : null
    )
    .getOrElse({});

  // compute the blocked channels array for this service
  const blockedChannelsForService = [
    !enabled.inbox ? INBOX_CHANNEL : "",
    !enabled.push ? PUSH_CHANNEL : "",
    !enabled.email ? EMAIL_CHANNEL : ""
  ].filter(_ => _ !== "");

  // returned the merged current blocked channels with the blocked channels for
  // this service
  return {
    ...profileBlockedChannels,
    [serviceId]: blockedChannelsForService
  };
};
