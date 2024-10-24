import * as O from "fp-ts/lib/Option";
import { getType } from "typesafe-actions";
import { constFalse, pipe } from "fp-ts/lib/function";
import { createSelector } from "reselect";
import { BackendStatus } from "../../../../definitions/content/BackendStatus";
import { Action } from "../../actions/types";
import { backendStatusLoadSuccess } from "../../actions/backendStatus";
import { GlobalState } from "../types";
import { SectionStatus } from "../../../../definitions/content/SectionStatus";
import { LocalizedMessageKeys } from "../../../i18n";
import { Sections } from "../../../../definitions/content/Sections";

export type SectionStatusKey = keyof Sections;

export type SectionStatusState = O.Option<BackendStatus["sections"]>;

const initialSectionStatusState: SectionStatusState = O.none;

export default function sectionStatusReducer(
  state: SectionStatusState = initialSectionStatusState,
  action: Action
): SectionStatusState {
  if (action.type === getType(backendStatusLoadSuccess)) {
    return O.some(action.payload.sections);
  }
  return state;
}

export const sectionStatusSelector = (state: GlobalState) =>
  state.sectionStatus;

export const sectionStatusByKeySelector = (
  sectionStatusKey: SectionStatusKey
) =>
  createSelector(sectionStatusSelector, (sections): SectionStatus | undefined =>
    pipe(
      sections,
      O.map(s => s?.[sectionStatusKey]),
      O.toUndefined
    )
  );

export const sectionStatusUncachedSelector = (
  state: GlobalState,
  sectionStatusKey: SectionStatusKey
) =>
  pipe(
    state.sectionStatus,
    O.chainNullableK(status => status?.[sectionStatusKey])
  );

export const isSectionVisibleSelector = (
  state: GlobalState,
  sectionStatusKey: SectionStatusKey
) =>
  pipe(
    sectionStatusUncachedSelector(state, sectionStatusKey),
    O.map(section => section.is_visible),
    O.getOrElse(constFalse)
  );
export const webUrlForSectionSelector = (
  state: GlobalState,
  sectionStatusKey: SectionStatusKey,
  locale: LocalizedMessageKeys
) =>
  pipe(
    sectionStatusUncachedSelector(state, sectionStatusKey),
    O.chainNullableK(section => section.web_url),
    O.chainNullableK(statusMessage => statusMessage[locale]),
    O.toUndefined
  );
export const messageForSectionSelector = (
  state: GlobalState,
  sectionStatusKey: SectionStatusKey,
  locale: LocalizedMessageKeys
) =>
  pipe(
    sectionStatusUncachedSelector(state, sectionStatusKey),
    O.chainNullableK(section => section.message),
    O.chainNullableK(messageTranslations => messageTranslations[locale]),
    O.toUndefined
  );
export const levelForSectionSelector = (
  state: GlobalState,
  sectionStatusKey: SectionStatusKey
) =>
  pipe(
    sectionStatusUncachedSelector(state, sectionStatusKey),
    O.map(section => section.level),
    O.toUndefined
  );
