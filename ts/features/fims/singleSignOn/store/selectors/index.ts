import * as pot from "@pagopa/ts-commons/lib/pot";
import * as B from "fp-ts/lib/boolean";
import { identity, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { GlobalState } from "../../../../../store/reducers/types";
import { isStrictNone } from "../../../../../utils/pot";
import { getDomainFromUrl } from "../../saga/sagaUtils";
import { Consent } from "../../../../../../definitions/fims_sso/Consent";
import { foldFimsFlowStateK } from "../../utils";
import { FimsErrorStateType } from "../reducers";
import { isDebugModeEnabledSelector } from "../../../../../store/reducers/debug";

export const fimsConsentsDataSelector = (state: GlobalState) =>
  state.features.fims.sso.ssoData;

export const fimsRelyingPartyDomainSelector = (state: GlobalState) =>
  pipe(
    state.features.fims.sso.relyingPartyUrl,
    O.fromNullable,
    O.map(getDomainFromUrl),
    O.toUndefined
  );
export const fimsRelyingPartyUrlSelector = (state: GlobalState) =>
  state.features.fims.sso.relyingPartyUrl;
export const fimsCtaTextSelector = (state: GlobalState) =>
  state.features.fims.sso.ctaText;
export const relyingPartyServiceIdSelector = (state: GlobalState) =>
  state.features.fims.sso.relyingPartyServiceId;
export const fimsEphemeralSessionOniOSSelector = (state: GlobalState) =>
  state.features.fims.sso.ephemeralSessionOniOS;

export const fimsPartialAbortUrl = (state: GlobalState) =>
  pipe(state, fimsConsentsDataSelector, abortUrlFromConsentsPot, O.toUndefined);

export const abortUrlFromConsentsPot = (
  consentsPot: pot.Pot<Consent, FimsErrorStateType>
) =>
  pipe(
    consentsPot,
    pot.toOption,
    // eslint-disable-next-line no-underscore-dangle
    O.map(consents => consents._links.abort.href)
  );

export const fimsAuthenticationFailedSelector = (state: GlobalState) =>
  pot.isError(state.features.fims.sso.ssoData);

export const fimsAuthenticationErrorTagSelector = (state: GlobalState) => {
  const ssoData = state.features.fims.sso.ssoData;
  if (pot.isError(ssoData)) {
    return ssoData.error.errorTag;
  }
  return undefined;
};

export const fimsDebugDataSelector = (state: GlobalState) => {
  const isDebug = isDebugModeEnabledSelector(state);
  if (isDebug) {
    const ssoDataPot = state.features.fims.sso.ssoData;
    if (pot.isError(ssoDataPot)) {
      return ssoDataPot.error.debugMessage;
    }
  }
  return undefined;
};

export const fimsLoadingStateSelector = (state: GlobalState) =>
  pipe(
    state.features.fims.sso.currentFlowState,
    foldFimsFlowStateK(
      consentsState =>
        pipe(state.features.fims.sso.ssoData, consentsPot =>
          pipe(
            pot.isLoading(consentsPot) || isStrictNone(consentsPot),
            B.fold(
              () => undefined,
              () => consentsState
            )
          )
        ),
      identity,
      identity,
      identity,
      identity
    )
  );

export const fimsRelyingPartyUrlIfFastLoginSelector = (state: GlobalState) =>
  pipe(
    state,
    fimsRelyingPartyUrlSelector,
    O.fromNullable,
    O.filter(
      _data =>
        state.features.fims.sso.currentFlowState === "fastLogin_forced_restart"
    ),
    O.toUndefined
  );
