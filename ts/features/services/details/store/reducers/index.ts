import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { ServiceId } from "../../../../../../definitions/backend/ServiceId";
import { ServiceMetadata } from "../../../../../../definitions/backend/ServiceMetadata";
import { ServicePublic } from "../../../../../../definitions/backend/ServicePublic";
import { SpecialServiceMetadata } from "../../../../../../definitions/backend/SpecialServiceMetadata";
import {
  logoutSuccess,
  sessionExpired
} from "../../../../../store/actions/authentication";
import { Action } from "../../../../../store/actions/types";
import { GlobalState } from "../../../../../store/reducers/types";
import { NetworkError } from "../../../../../utils/errors";
import { isStrictSome } from "../../../../../utils/pot";
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
import { ServiceKind } from "../../components/ServiceDetailsScreenComponent";
import { EnabledChannels } from "../../../../../utils/profile";

export type ServicesDetailsState = {
  byId: Record<string, pot.Pot<ServicePublic, Error>>;
  servicePreference: pot.Pot<
    ServicePreferenceResponse,
    WithServiceID<NetworkError>
  >;
};

const INITIAL_STATE: ServicesDetailsState = {
  byId: {},
  servicePreference: pot.none
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
        byId: {
          ...state.byId,
          [action.payload]: pipe(
            state.byId[action.payload],
            O.fromNullable,
            O.fold(() => pot.noneLoading, pot.toLoading)
          )
        }
      };

    case getType(loadServiceDetail.success):
      // Use the ID as object key
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.service_id]: pot.some(action.payload)
        }
      };

    case getType(loadServiceDetail.failure):
      // when a request to load a previously loaded service detail fails its state is updated
      // with a someError pot, otherwise its state is updated with a noneError pot
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.service_id]: pipe(
            state.byId[action.payload.service_id],
            O.fromNullable,
            O.fold(
              () => pot.noneError(action.payload.error),
              servicePot => pot.toError(servicePot, action.payload.error)
            )
          )
        }
      };

    // Get service preference actions
    case getType(loadServicePreference.request):
      return {
        ...state,
        servicePreference: pot.toLoading(state.servicePreference)
      };
    case getType(upsertServicePreference.request):
      const { id, ...payload } = action.payload;

      return {
        ...state,
        servicePreference: pot.toUpdating(state.servicePreference, {
          id,
          kind: "success",
          value: payload
        })
      };
    case getType(loadServicePreference.success):
    case getType(upsertServicePreference.success):
      return {
        ...state,
        servicePreference: pot.some(action.payload)
      };
    case getType(loadServicePreference.failure):
    case getType(upsertServicePreference.failure):
      return {
        ...state,
        servicePreference: pot.toError(state.servicePreference, action.payload)
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
  state.features.services.details.byId;

export const serviceByIdPotSelector = (
  state: GlobalState,
  id: ServiceId
): pot.Pot<ServicePublic, Error> =>
  state.features.services.details.byId[id] ?? pot.none;

export const serviceByIdSelector = (
  state: GlobalState,
  id: ServiceId
): ServicePublic | undefined =>
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
      O.chainNullableK(service => service.service_metadata),
      O.toUndefined
    )
);

export const serviceMetadataInfoSelector = createSelector(
  serviceMetadataByIdSelector,
  serviceMetadata =>
    pipe(
      serviceMetadata,
      O.fromNullable,
      O.chain<ServiceMetadata, ServiceMetadataInfo>(serviceMetadata => {
        if (SpecialServiceMetadata.is(serviceMetadata)) {
          return O.some({
            isSpecialService: true,
            serviceKind:
              serviceMetadata.custom_special_flow as NonNullable<ServiceKind>
          });
        }
        return O.none;
      }),
      O.getOrElse<ServiceMetadataInfo>(() => ({ isSpecialService: false }))
    )
);

export const servicePreferencePotSelector = (state: GlobalState) =>
  state.features.services.details.servicePreference;

export const servicePreferenceResponseSuccessSelector = createSelector(
  servicePreferencePotSelector,
  servicePreferencePot =>
    pipe(
      servicePreferencePot,
      pot.toOption,
      O.filter(isServicePreferenceResponseSuccess),
      O.toUndefined
    )
);

export const isLoadingServicePreferenceSelector = (state: GlobalState) =>
  pipe(
    state,
    servicePreferencePotSelector,
    servicePreferencePot =>
      pot.isLoading(servicePreferencePot) ||
      pot.isUpdating(servicePreferencePot)
  );

export const isErrorServicePreferenceSelector = (state: GlobalState) =>
  pipe(
    state,
    servicePreferencePotSelector,
    servicePreferencePot =>
      pot.isError(servicePreferencePot) ||
      (isStrictSome(servicePreferencePot) &&
        !isServicePreferenceResponseSuccess(servicePreferencePot.value))
  );

/**
 * Select the preference by channel
 * @param channel - The channel of the preference to select
 */
export const servicePreferenceByChannelPotSelector = createSelector(
  servicePreferencePotSelector,
  (_: GlobalState, channel: keyof EnabledChannels) => channel,
  (servicePreferencePot, channel) =>
    pot.mapNullable(servicePreferencePot, servicePreference => {
      if (isServicePreferenceResponseSuccess(servicePreference)) {
        return servicePreference.value[channel];
      }
      return undefined;
    })
);
