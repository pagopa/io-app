import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { createSelector } from "reselect";
import { ServiceDetails } from "../../../../../../definitions/services/ServiceDetails";
import { ServiceId } from "../../../../../../definitions/services/ServiceId";
import { ServiceMetadata } from "../../../../../../definitions/services/ServiceMetadata";
import { SpecialServiceMetadata } from "../../../../../../definitions/services/SpecialServiceMetadata";
import { GlobalState } from "../../../../../store/reducers/types";
import { NetworkError } from "../../../../../utils/errors";
import { isStrictSome } from "../../../../../utils/pot";
import { EnabledChannels } from "../../../../../utils/profile";
import { ServiceKind } from "../../components/ServiceDetailsScreenComponent";
import { ServiceMetadataInfo } from "../../types";
import {
  WithServiceID,
  isServicePreferenceResponseSuccess
} from "../../types/ServicePreferenceResponse";

export const servicesDetailsSelector = (state: GlobalState) =>
  state.features.services.details.dataById;

export const serviceDetailsByIdPotSelector = (
  state: GlobalState,
  id: ServiceId
): pot.Pot<ServiceDetails, Error> =>
  state.features.services.details.dataById[id] ?? pot.none;

export const serviceDetailsByIdSelector = (
  state: GlobalState,
  id: ServiceId
): ServiceDetails | undefined =>
  pipe(serviceDetailsByIdPotSelector(state, id), pot.toUndefined);

export const isLoadingServiceDetailsByIdSelector = (
  state: GlobalState,
  id: ServiceId
) => pipe(serviceDetailsByIdPotSelector(state, id), pot.isLoading);

export const isErrorServiceDetailsByIdSelector = (
  state: GlobalState,
  id: ServiceId
) => pipe(serviceDetailsByIdPotSelector(state, id), pot.isError);

export const serviceMetadataByIdSelector = createSelector(
  serviceDetailsByIdPotSelector,
  serviceByIdPot =>
    pipe(
      serviceByIdPot,
      pot.toOption,
      O.chainNullableK(service => service.metadata),
      O.toUndefined
    )
);

export const serviceMetadataInfoSelector = createSelector(
  serviceMetadataByIdSelector,
  serviceMetadata =>
    pipe(
      serviceMetadata,
      O.fromNullable,
      O.chain<ServiceMetadata, ServiceMetadataInfo>(metadata => {
        if (SpecialServiceMetadata.is(metadata)) {
          return O.some({
            isSpecialService: true,
            serviceKind:
              metadata.custom_special_flow as NonNullable<ServiceKind>
          });
        }
        return O.none;
      }),
      O.getOrElse<ServiceMetadataInfo>(() => ({ isSpecialService: false }))
    )
);

export const servicePreferencePotByIdSelector = (
  state: GlobalState,
  id: ServiceId | undefined
) => {
  if (id === undefined) {
    return pot.none;
  }
  return state.features.services.details.preferencesById[id] ?? pot.none;
};

export const servicePreferenceResponseSuccessByIdSelector = createSelector(
  servicePreferencePotByIdSelector,
  servicePreferencePot =>
    pipe(
      servicePreferencePot,
      pot.toOption,
      O.filter(isServicePreferenceResponseSuccess),
      O.toUndefined
    )
);

export const isLoadingServicePreferenceSelector = (
  state: GlobalState,
  id: ServiceId | undefined
) =>
  pipe(
    servicePreferencePotByIdSelector(state, id),
    servicePreferencePot =>
      pot.isLoading(servicePreferencePot) ||
      pot.isUpdating(servicePreferencePot)
  );

export const isErrorServicePreferenceSelector = (
  state: GlobalState,
  id: ServiceId | undefined
) =>
  pipe(
    servicePreferencePotByIdSelector(state, id),
    servicePreferencePot =>
      pot.isError(servicePreferencePot) ||
      (isStrictSome(servicePreferencePot) &&
        !isServicePreferenceResponseSuccess(servicePreferencePot.value))
  );

type PreferenceByChannelSelectorType = (
  state: GlobalState,
  serviceId: ServiceId | undefined,
  channel: keyof EnabledChannels
) => pot.Pot<boolean, WithServiceID<NetworkError>>;

/**
 * Select the preference by channel
 * @param serviceId - The ID of the service to select the preference for
 * @param channel - The channel of the preference to select
 * @returns The preference value for the specified channel or undefined
 */
export const servicePreferenceByChannelPotSelector: PreferenceByChannelSelectorType =
  createSelector(
    servicePreferencePotByIdSelector,
    (
      _state: GlobalState,
      _serviceId: ServiceId | undefined,
      channel: keyof EnabledChannels
    ) => channel,
    (servicePreferencePot, channel) =>
      pot.mapNullable(servicePreferencePot, servicePreference => {
        if (isServicePreferenceResponseSuccess(servicePreference)) {
          return servicePreference.value[channel];
        }
        return undefined;
      })
  );
