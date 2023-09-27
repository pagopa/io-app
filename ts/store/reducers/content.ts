/**
 * Implements the reducers for static content.
 */
import * as O from "fp-ts/lib/Option";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { pipe } from "fp-ts/lib/function";
import { ContextualHelp } from "../../../definitions/content/ContextualHelp";
import { Idp } from "../../../definitions/content/Idp";
import { Municipality as MunicipalityMetadata } from "../../../definitions/content/Municipality";
import { ScreenCHData } from "../../../definitions/content/ScreenCHData";
import { SpidIdp } from "../../../definitions/content/SpidIdp";
import { SpidIdps } from "../../../definitions/content/SpidIdps";
import {
  isReady,
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../features/bonus/bpd/model/RemoteValue";
import { CodiceCatastale } from "../../types/MunicipalityCodiceCatastale";
import { idps as idpsFallback, LocalIdpsFallback } from "../../utils/idps";
import { getRemoteLocale } from "../../utils/messages";
import {
  contentMunicipalityLoad,
  loadContextualHelpData,
  loadIdps
} from "../actions/content";
import { clearCache } from "../actions/profile";
import { Action } from "../actions/types";
import { IdpData } from "../../../definitions/content/IdpData";
import { currentRouteSelector } from "./navigation";
import { GlobalState } from "./types";

/**
 * Stores useful content such as services and organizations metadata,
 * help pages, etc...
 */
export type ContentState = Readonly<{
  municipality: MunicipalityState;
  contextualHelp: pot.Pot<ContextualHelp, Error>;
  idps: RemoteValue<SpidIdps, Error>;
}>;

export type MunicipalityState = Readonly<{
  codiceCatastale: pot.Pot<CodiceCatastale, Error>;
  data: pot.Pot<MunicipalityMetadata, Error>;
}>;

export const initialContentState: ContentState = {
  municipality: {
    codiceCatastale: pot.none,
    data: pot.none
  },
  contextualHelp: pot.none,
  idps: remoteUndefined
};

// Selectors
export const contentSelector = (state: GlobalState) => state.content;

export const municipalitySelector = (state: GlobalState) =>
  state.content.municipality;

export const contextualHelpDataSelector = (
  state: GlobalState
): pot.Pot<ContextualHelp, Error> => state.content.contextualHelp;

export const idpsStateSelector = createSelector(
  contentSelector,
  (content: ContentState): ContentState["idps"] => content.idps
);

export const idpsSelector = createSelector(
  idpsStateSelector,
  (idps: ContentState["idps"]): ReadonlyArray<SpidIdp | LocalIdpsFallback> =>
    isReady(idps) ? idps.value.items : idpsFallback
);

/**
 * return an option with Idp contextual help data if they are loaded and defined
 * @param id
 */
export const idpContextualHelpDataFromIdSelector = (
  id: SpidIdp["id"] | undefined
) =>
  createSelector<GlobalState, pot.Pot<ContextualHelp, Error>, O.Option<Idp>>(
    contextualHelpDataSelector,
    contextualHelpData =>
      pipe(
        id,
        O.fromNullable,
        O.fold(
          () => O.none,
          () =>
            pot.getOrElse(
              pot.map(contextualHelpData, data => {
                const locale = getRemoteLocale();
                return pipe(
                  data[locale],
                  O.fromNullable,
                  O.chain(l => O.fromNullable(l.idps[id as keyof IdpData]))
                );
              }),
              O.none
            )
        )
      )
  );

/**
 * return a pot with screen contextual help data if they are loaded and defined otherwise
 * @param id
 */
export const screenContextualHelpDataSelector = createSelector<
  GlobalState,
  pot.Pot<ContextualHelp, Error>,
  string,
  pot.Pot<O.Option<ScreenCHData>, Error>
>(
  [contextualHelpDataSelector, currentRouteSelector],
  (contextualHelpData, currentRoute) =>
    pot.map(contextualHelpData, data => {
      if (currentRoute === undefined) {
        return O.none;
      }
      const locale = getRemoteLocale();
      const screenData =
        data[locale] !== undefined
          ? data[locale].screens.find(
              s =>
                s.route_name.toLowerCase() === currentRoute.toLocaleLowerCase()
            )
          : undefined;
      return O.fromNullable(screenData);
    })
);

/**
 * Return a pot with screen contextual help data given a route if they are loaded and defined otherwise return undefined
 * @param route
 */
export const getContextualHelpDataFromRouteSelector = (route: string) =>
  createSelector<
    GlobalState,
    pot.Pot<ContextualHelp, Error>,
    pot.Pot<O.Option<ScreenCHData>, Error>
  >([contextualHelpDataSelector], contextualHelpData =>
    pot.map(contextualHelpData, data => {
      if (route === undefined) {
        return O.none;
      }
      const locale = getRemoteLocale();
      const screenData =
        data[locale] !== undefined
          ? data[locale].screens.find(
              s => s.route_name.toLowerCase() === route.toLocaleLowerCase()
            )
          : undefined;
      return O.fromNullable(screenData);
    })
  );

export default function content(
  state: ContentState = initialContentState,
  action: Action
): ContentState {
  switch (action.type) {
    case getType(contentMunicipalityLoad.request):
      const codiceCatastale = state.municipality.codiceCatastale;
      const municipalityData = state.municipality.data;
      return {
        ...state,
        municipality: {
          codiceCatastale: pot.toLoading(codiceCatastale),
          data: pot.toLoading(municipalityData)
        }
      };

    case getType(contentMunicipalityLoad.success):
      return {
        ...state,
        municipality: {
          codiceCatastale: pot.some(action.payload.codiceCatastale),
          data: pot.some(action.payload.data)
        }
      };

    case getType(contentMunicipalityLoad.failure):
      return {
        ...state,
        municipality: {
          codiceCatastale: pot.toError(
            state.municipality.codiceCatastale,
            action.payload.error
          ),
          data: pot.toError(state.municipality.data, action.payload.error)
        }
      };

    // contextualHelp text data
    case getType(loadContextualHelpData.request):
      return {
        ...state,
        contextualHelp: pot.toLoading(state.contextualHelp)
      };

    case getType(loadContextualHelpData.success):
      return {
        ...state,
        contextualHelp: pot.some(action.payload)
      };

    case getType(loadContextualHelpData.failure):
      return {
        ...state,
        contextualHelp: pot.toError(state.contextualHelp, action.payload)
      };

    // idps data
    case getType(loadIdps.request):
      return {
        ...state,
        idps: remoteLoading
      };

    case getType(loadIdps.success):
      return {
        ...state,
        idps: remoteReady(action.payload)
      };

    case getType(loadIdps.failure):
      return {
        ...state,
        idps: remoteError(action.payload)
      };

    case getType(clearCache):
      return {
        ...state,
        municipality: { ...initialContentState.municipality },
        contextualHelp: { ...initialContentState.contextualHelp }
      };

    default:
      return state;
  }
}
