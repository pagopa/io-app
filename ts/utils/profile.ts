import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { FiscalCode } from "../../definitions/backend/FiscalCode";
import { Municipality } from "../../definitions/content/Municipality";
import { ProfileState } from "../features/settings/common/store/reducers";
import { BlockedInboxOrChannels } from "../../definitions/backend/BlockedInboxOrChannels";
import { ServiceId } from "../../definitions/backend/ServiceId";
import { InitializedProfile } from "../../definitions/backend/InitializedProfile";
import { pad } from "./dates";

type GenderType = "M" | "F" | undefined;

/**
 * Generic utilities for profile
 */
type FiscalCodeDerivedData = Readonly<{
  gender?: GenderType;
  birthDate?: Date;
  denominazione: string;
  siglaProvincia: string;
}>;

const months: { [k: string]: number } = {
  ["A"]: 1,
  ["B"]: 2,
  ["C"]: 3,
  ["D"]: 4,
  ["E"]: 5,
  ["H"]: 6,
  ["L"]: 7,
  ["M"]: 8,
  ["P"]: 9,
  ["R"]: 10,
  ["S"]: 11,
  ["T"]: 12
};

// Generate object including data expressed into the given fiscal code
export function extractFiscalCodeData(
  fiscalCode: FiscalCode,
  municipality: pot.Pot<Municipality, Error>
): FiscalCodeDerivedData {
  const siglaProvincia = pot.getOrElse(
    pot.map(municipality, m => m.siglaProvincia),
    ""
  );
  const denominazione = pot.getOrElse(
    pot.map(municipality, m => m.denominazioneInItaliano),
    ""
  );
  // if we can't know more about date of birth
  // just return info about municipality
  if (!RegExp("^[0-9]+$").test(fiscalCode.substring(9, 11))) {
    return {
      siglaProvincia,
      denominazione
    };
  }

  const tempDay = parseInt(fiscalCode.substring(9, 11), 10);
  const gender = tempDay - 40 > 0 ? "F" : "M";
  const month = months[fiscalCode.charAt(8)];

  if (
    !RegExp("^[0-9]+$").test(fiscalCode.substring(6, 8)) ||
    month === undefined
  ) {
    return {
      gender,
      siglaProvincia,
      denominazione
    };
  }

  const day = tempDay - 40 > 0 ? tempDay - 40 : tempDay;
  const tempYear = parseInt(fiscalCode.substring(6, 8), 10);
  // to avoid the century date collision (01 could mean 1901 or 2001)
  // we assume that if the birth date is grater than a century, the date
  // refers to the new century
  const year =
    tempYear +
    (new Date().getFullYear() - (1900 + tempYear) >= 100 ? 2000 : 1900);

  const birthDate = new Date(`${year}-${pad(month)}-${pad(day)}T00:00:00.000Z`);

  return {
    gender,
    birthDate,
    siglaProvincia,
    denominazione
  };
}

/**
 * The enabled/disabled state of each channel.
 *
 * Consider generating this map from the API specs.
 */
export interface EnabledChannels {
  inbox: boolean;
  email: boolean;
  push: boolean;
  can_access_message_read_status: boolean;
}

const INBOX_CHANNEL = "INBOX";
const EMAIL_CHANNEL = "EMAIL";
const PUSH_CHANNEL = "WEBHOOK";
const SEND_READ_MESSAGE_STATUS_CHANNEL = "SEND_READ_MESSAGE_STATUS_CHANNEL";

export function getChannelsforServicesList(
  servicesId: ReadonlyArray<string>,
  profile: ProfileState
): BlockedInboxOrChannels {
  const profileBlockedChannels = pot.getOrElse(
    pot.mapNullable(profile, up => up.blocked_inbox_or_channels),
    {} as BlockedInboxOrChannels
  );

  return servicesId.reduce(
    (acc, serviceId) => ({
      ...acc,
      [serviceId]: profileBlockedChannels[serviceId] || []
    }),
    {} as BlockedInboxOrChannels
  );
}

/**
 * Provide new BlockedInboxOrChannels object to disable
 * or enable (if enableListedServices is true)
 * a list of services (listed as servicesId).
 * If not declared, the enabled/disabled channel is the INBOX,
 * otherwise it is updated the channel expressed as channelOfInterest
 */
export function getProfileChannelsforServicesList(
  servicesId: ReadonlyArray<string>,
  profile: ProfileState,
  enableListedServices: boolean,
  channelOfInterest: string = INBOX_CHANNEL
): BlockedInboxOrChannels {
  const profileBlockedChannels = pot.getOrElse(
    pot.mapNullable(
      profile,
      userProfile => userProfile.blocked_inbox_or_channels
    ),
    {} as BlockedInboxOrChannels
  );

  servicesId.forEach(id => {
    const channels =
      Object.keys(profileBlockedChannels).indexOf(id) !== -1
        ? profileBlockedChannels[id]
        : [];

    const updatedBlockedChannels =
      channels.indexOf(channelOfInterest) === -1
        ? enableListedServices
          ? channels
          : channels.concat(channelOfInterest)
        : enableListedServices
        ? channels.filter(item => item !== channelOfInterest)
        : channels;

    if (updatedBlockedChannels.length !== 0) {
      // eslint-disable-next-line functional/immutable-data
      profileBlockedChannels[id] = updatedBlockedChannels;
    } else {
      // eslint-disable-next-line functional/immutable-data
      delete profileBlockedChannels[id];
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
  return pipe(
    pot.toOption(potProfile),
    O.chainNullableK(profile =>
      InitializedProfile.is(profile) ? profile.blocked_inbox_or_channels : null
    ),
    O.chainNullableK(blockedChannels => blockedChannels[serviceId]),
    O.map(_ => ({
      inbox: _.indexOf(INBOX_CHANNEL) === -1,
      email: _.indexOf(EMAIL_CHANNEL) === -1,
      push: _.indexOf(PUSH_CHANNEL) === -1,
      can_access_message_read_status:
        _.indexOf(SEND_READ_MESSAGE_STATUS_CHANNEL) === -1
    })),
    O.getOrElseW(() => ({
      inbox: true,
      email: true,
      push: true,
      can_access_message_read_status: true
    }))
  );
}

/**
 * Returns a function that generates updated blocked channels from the
 * enabled channels of one service
 */
export const getBlockedChannels =
  (potProfile: ProfileState, serviceId: ServiceId) =>
  (enabled: EnabledChannels): BlockedInboxOrChannels => {
    // get the current blocked channels from the profile
    const profileBlockedChannels = pot.getOrElse(
      pot.mapNullable(
        potProfile,
        userProfile => userProfile.blocked_inbox_or_channels
      ),
      {} as BlockedInboxOrChannels
    );

    // compute the blocked channels array for this service
    const blockedChannelsForService = [
      !enabled.inbox ? INBOX_CHANNEL : "",
      !enabled.push ? PUSH_CHANNEL : "",
      !enabled.email ? EMAIL_CHANNEL : "",
      !enabled.can_access_message_read_status
        ? SEND_READ_MESSAGE_STATUS_CHANNEL
        : ""
    ].filter(_ => _ !== "");

    if (blockedChannelsForService.length === 0) {
      // eslint-disable-next-line functional/immutable-data
      delete profileBlockedChannels[serviceId];
    } else {
      // eslint-disable-next-line functional/immutable-data
      profileBlockedChannels[serviceId] = blockedChannelsForService;
    }

    return {
      ...profileBlockedChannels
    };
  };
