import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { ServiceDetails } from "../../../../../../definitions/services/ServiceDetails";
import { ServiceId } from "../../../../../../definitions/services/ServiceId";
import { ServiceMetadata } from "../../../../../../definitions/services/ServiceMetadata";
import { SpecialServiceMetadata } from "../../../../../../definitions/services/SpecialServiceMetadata";
import { Action } from "../../../../../store/actions/types";
import { GlobalState } from "../../../../../store/reducers/types";
import { NetworkError } from "../../../../../utils/errors";
import { isStrictSome } from "../../../../../utils/pot";
import { EnabledChannels } from "../../../../../utils/profile";
import {
  logoutSuccess,
  sessionExpired
} from "../../../../authentication/common/store/actions";
import { ServiceKind } from "../../components/ServiceDetailsScreenComponent";
import { ServiceMetadataInfo } from "../../types";
import {
  ServicePreferenceResponse,
  WithServiceID,
  isServicePreferenceResponseSuccess
} from "../../types/ServicePreferenceResponse";
import { loadServiceDetail } from "../actions/details";
import {
  loadServicePreference,
  upsertServicePreference
} from "../actions/preference";

export type ServicePreferencePot = pot.Pot<
  ServicePreferenceResponse,
  WithServiceID<NetworkError>
>;
export type ServicesDetailsState = {
  dataById: Record<string, pot.Pot<ServiceDetails, Error>>;
  preferencesById: Record<string, ServicePreferencePot>;
};

const INITIAL_STATE: ServicesDetailsState = {
  dataById: {},
  preferencesById: {}
};

const servicesDetailsReducer = (
  state: ServicesDetailsState = INITIAL_STATE,
  action: Action
): ServicesDetailsState => {
  switch (action.type) {
    // Get service details actions
    case getType(loadServiceDetail.request):
      // When a previously loaded service detail is loaded again, its state
      // is updated with a someLoading pot, otherwise its state is updated with a noneLoading pot
      return {
        ...state,
        dataById: {
          ...state.dataById,
          [action.payload]: pipe(
            state.dataById[action.payload],
            O.fromNullable,
            O.fold(() => pot.noneLoading, pot.toLoading)
          )
        }
      };

    case getType(loadServiceDetail.success):
      // Use the ID as object key
      return {
        ...state,
        dataById: {
          ...state.dataById,
          [action.payload.id]: pot.some(action.payload)
        }
      };

    case getType(loadServiceDetail.failure):
      // when a request to load a previously loaded service detail fails its state is updated
      // with a someError pot, otherwise its state is updated with a noneError pot
      const { service_id, error } = action.payload;
      return {
        ...state,
        dataById: {
          ...state.dataById,
          [service_id]: pipe(
            state.dataById[service_id],
            O.fromNullable,
            O.fold(
              () => pot.noneError(error),
              servicePot => pot.toError(servicePot, error)
            )
          )
        }
      };

    // Get service preference actions
    case getType(loadServicePreference.request):
      const serviceId = action.payload;
      const preferenceToLoad = state.preferencesById[serviceId] ?? pot.none;
      return {
        ...state,
        preferencesById: {
          ...state.preferencesById,
          [serviceId]: pot.toLoading(preferenceToLoad)
        }
      };
    case getType(upsertServicePreference.request):
      const { id, ...payload } = action.payload;
      const preferenceToUpsert = state.preferencesById[id] ?? pot.none;

      return {
        ...state,
        preferencesById: {
          ...state.preferencesById,
          [id]: pot.toUpdating(preferenceToUpsert, {
            id,
            kind: "success",
            value: payload
          })
        }
      };
    case getType(loadServicePreference.success):
    case getType(upsertServicePreference.success):
      return {
        ...state,
        preferencesById: {
          ...state.preferencesById,
          [action.payload.id]: pot.some(action.payload)
        }
      };
    case getType(loadServicePreference.failure):
    case getType(upsertServicePreference.failure):
      const currentPreference =
        state.preferencesById[action.payload.id] ?? pot.none;
      return {
        ...state,
        preferencesById: {
          ...state.preferencesById,
          [action.payload.id]: pot.toError(currentPreference, action.payload)
        }
      };

    case getType(logoutSuccess):
    case getType(sessionExpired):
      return INITIAL_STATE;
  }
  return state;
};

export default servicesDetailsReducer;

// Selectors
export const servicesByIdSelector = (state: GlobalState) =>
  state.features.services.details.dataById;

export const serviceByIdPotSelector = (
  state: GlobalState,
  id: ServiceId
): pot.Pot<ServiceDetails, Error> =>
  state.features.services.details.dataById[id] ?? pot.none;

export const serviceByIdSelector = (
  state: GlobalState,
  id: ServiceId
): ServiceDetails | undefined =>
  pipe(serviceByIdPotSelector(state, id), pot.toUndefined);

export const isLoadingServiceByIdSelector = (
  state: GlobalState,
  id: ServiceId
) => pipe(serviceByIdPotSelector(state, id), pot.isLoading);

export const isErrorServiceByIdSelector = (state: GlobalState, id: ServiceId) =>
  pipe(serviceByIdPotSelector(state, id), pot.isError);

export const serviceMetadataByIdSelector = createSelector(
  serviceByIdPotSelector,
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
    [
      servicePreferencePotByIdSelector,
      (
        _state: GlobalState,
        _serviceId: ServiceId | undefined,
        channel: keyof EnabledChannels
      ) => channel
    ],
    (selector, channel) =>
      pot.mapNullable(selector, servicePreference => {
        if (isServicePreferenceResponseSuccess(servicePreference)) {
          return servicePreference.value[channel];
        }
        return undefined;
      })
  );
