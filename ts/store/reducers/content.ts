/**
 * Implements the reducers for static content.
 */
import { fromNullable, none, Option } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { NavigationState } from "react-navigation";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { ContextualHelp } from "../../../definitions/content/ContextualHelp";
import { Idp } from "../../../definitions/content/Idp";
import { Municipality as MunicipalityMetadata } from "../../../definitions/content/Municipality";
import { ScreenCHData } from "../../../definitions/content/ScreenCHData";
import { IdentityProviderId } from "../../models/IdentityProvider";
import { CodiceCatastale } from "../../types/MunicipalityCodiceCatastale";
import { getCurrentRouteName } from "../../utils/navigation";
import {
  contentMunicipalityLoad,
  loadContextualHelpData,
  loadIdps
} from "../actions/content";
import { clearCache } from "../actions/profile";
import { Action } from "../actions/types";
import {
  isReady,
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../features/bonus/bpd/model/RemoteValue";
import { SpidIdps } from "../../../definitions/content/SpidIdps";
import { SpidIdp } from "../../../definitions/content/SpidIdp";
import { idps as idpsFallback, LocalIdpsFallback } from "../../utils/idps";
import { getRemoteLocale } from "../../utils/messages";
import { navSelector } from "./navigationHistory";
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
export const idpContextualHelpDataFromIdSelector = (id: SpidIdp["id"]) =>
  createSelector<GlobalState, pot.Pot<ContextualHelp, Error>, Option<Idp>>(
    contextualHelpDataSelector,
    contextualHelpData =>
      pot.getOrElse(
        pot.map(contextualHelpData, data => {
          const locale = getRemoteLocale();

          return fromNullable(data[locale]).chain(l =>
            fromNullable(l.idps[id as IdentityProviderId])
          );
        }),
        none
      )
  );

/**
 * return a pot with screen contextual help data if they are loaded and defined otherwise
 * @param id
 */
export const screenContextualHelpDataSelector = createSelector<
  GlobalState,
  pot.Pot<ContextualHelp, Error>,
  NavigationState,
  pot.Pot<Option<ScreenCHData>, Error>
>([contextualHelpDataSelector, navSelector], (contextualHelpData, navState) =>
  pot.map(contextualHelpData, data => {
    const currentRouteName = getCurrentRouteName(navState);
    if (currentRouteName === undefined) {
      return none;
    }
    const locale = getRemoteLocale();
    const screenData =
      data[locale] !== undefined
        ? data[locale].screens.find(
            s =>
              s.route_name.toLowerCase() ===
              currentRouteName.toLocaleLowerCase()
          )
        : undefined;
    return fromNullable(screenData);
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
