import * as pot from "italia-ts-commons/lib/pot";

import { BlockedInboxOrChannels } from "../../../definitions/backend/BlockedInboxOrChannels";
import { InitializedProfile } from "../../../definitions/backend/InitializedProfile";
import { ServiceId } from "../../../definitions/backend/ServiceId";
import { ProfileState } from "../../store/reducers/profile";

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
 * Provide new BlockedInboxOrChannels object to disable
 * or enable (if enableListedServices is true)
 * a list of services (listed as servicesId)
 */
export function getChannelsforServicesList(
  servicesId: ReadonlyArray<string>,
  profile: ProfileState,
  enableListedServices: boolean
): BlockedInboxOrChannels {
  const profileBlockedChannels = pot
    .toOption(profile)
    .mapNullable(
      userProfile =>
        InitializedProfile.is(userProfile)
          ? userProfile.blocked_inbox_or_channels
          : null
    )
    .getOrElse({});

  servicesId.forEach(id => {
    const channels =
      Object.keys(profileBlockedChannels).indexOf(id) !== -1
        ? profileBlockedChannels[id]
        : [];

    const updatedBlockedChannels =
      channels.indexOf(INBOX_CHANNEL) === -1
        ? enableListedServices
          ? channels
          : channels.concat(INBOX_CHANNEL)
        : enableListedServices
          ? channels.filter(item => item !== INBOX_CHANNEL)
          : channels;

    if (updatedBlockedChannels.length !== 0) {
      // tslint:disable-next-line no-object-mutation
      profileBlockedChannels[id] = updatedBlockedChannels;
    }
  });

  return profileBlockedChannels;
}

/**
 * Finds out which channels are enabled in the profile for the provided service
 */
export function getEnabledChannelsForService(
  potProfile: ProfileState,
  serviceId: ServiceId
): EnabledChannels {
  return pot
    .toOption(potProfile)
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
 * enabled channels of one service
 */
export const getBlockedChannels = (
  potProfile: ProfileState,
  serviceId: ServiceId
) => (enabled: EnabledChannels): BlockedInboxOrChannels => {
  // get the current blocked channels from the profile
  const profileBlockedChannels = pot
    .toOption(potProfile)
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

  blockedChannelsForService.length === 0
    ? // tslint:disable-next-line no-object-mutation
      delete profileBlockedChannels[serviceId]
    : // tslint:disable-next-line no-object-mutation
      (profileBlockedChannels[serviceId] = blockedChannelsForService);

  return {
    ...profileBlockedChannels
  };
};
