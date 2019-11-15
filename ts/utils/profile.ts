import { format, format as dateFnsFormat } from "date-fns";
import * as pot from "italia-ts-commons/lib/pot";
import { BlockedInboxOrChannels } from "../../definitions/backend/BlockedInboxOrChannels";
import { FiscalCode } from "../../definitions/backend/FiscalCode";
import { InitializedProfile } from "../../definitions/backend/InitializedProfile";
import { ServiceId } from "../../definitions/backend/ServiceId";
import { Municipality } from "../../definitions/content/Municipality";
import { ProfileState } from "../store/reducers/profile";

type GenderType = "M" | "F" | undefined;

/**
 * Generic utilities for profile
 */
type FiscalCodeDerivedData = Readonly<{
  gender?: GenderType;
  birthDate?: ReturnType<typeof dateFnsFormat>;
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
  const siglaProvincia = pot.isSome(municipality)
    ? municipality.value.siglaProvincia
    : "";
  const denominazione = pot.isSome(municipality)
    ? municipality.value.denominazioneInItaliano
    : "";
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
  const year = parseInt(fiscalCode.substring(6, 8), 10);
  const birthDate = format(
    new Date(year, month - 1, day), // months are indexed from index 0
    "DD/MM/YYYY"
  );

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
}

const INBOX_CHANNEL = "INBOX";
const EMAIL_CHANNEL = "EMAIL";
const PUSH_CHANNEL = "WEBHOOK";

export function getChannelsforServicesList(
  servicesId: ReadonlyArray<string>,
  profile: ProfileState
): BlockedInboxOrChannels {
  const profileBlockedChannels = pot.getOrElse(
    pot.mapNullable(
      profile,
      up => (InitializedProfile.is(up) ? up.blocked_inbox_or_channels : {})
    ),
    {} as BlockedInboxOrChannels
  );

  return servicesId.reduce(
    (acc, serviceId) => {
      return {
        ...acc,
        [serviceId]: profileBlockedChannels[serviceId] || []
      };
    },
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
      channels.indexOf(channelOfInterest) === -1
        ? enableListedServices
          ? channels
          : channels.concat(channelOfInterest)
        : enableListedServices
          ? channels.filter(item => item !== channelOfInterest)
          : channels;

    if (updatedBlockedChannels.length !== 0) {
      // tslint:disable-next-line no-object-mutation
      profileBlockedChannels[id] = updatedBlockedChannels;
    } else {
      // tslint:disable-next-line no-object-mutation
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
          ? { ...profile.blocked_inbox_or_channels }
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
