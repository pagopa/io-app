import * as pot from "@pagopa/ts-commons/lib/pot";
import * as B from "fp-ts/lib/boolean";
import { identity, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { GlobalState } from "../../../../../store/reducers/types";
import { isStrictNone } from "../../../../../utils/pot";
import { getDomainFromUrl } from "../../saga/sagaUtils";
import { ConsentData } from "../../types";
import { foldFimsFlowStateK } from "../../utils";

export const fimsConsentsDataSelector = (state: GlobalState) =>
  state.features.fims.sso.consentsData;

export const fimsRelyingPartyDomainSelector = (state: GlobalState) =>
  pipe(
    state.features.fims.sso.relyingPartyUrl,
    O.fromNullable,
    O.map(getDomainFromUrl),
    O.toUndefined
  );
export const fimsRelyingPartyUrlSelector = (state: GlobalState) =>
  state.features.fims.sso.relyingPartyUrl;

export const fimsPartialAbortUrl = (state: GlobalState) =>
  pipe(state, fimsConsentsDataSelector, abortUrlFromConsentsPot, O.toUndefined);

export const abortUrlFromConsentsPot = (
  consentsPot: pot.Pot<ConsentData, string>
) =>
  pipe(
    consentsPot,
    pot.toOption,
    // eslint-disable-next-line no-underscore-dangle
    O.map(consents => consents._links.abort.href)
  );

export const fimsErrorStateSelector = (state: GlobalState) =>
  // this selector will be used to map the error message
  // once we have a clear error mapping
  pot.isError(state.features.fims.sso.consentsData)
    ? state.features.fims.sso.consentsData.error
    : undefined;

export const fimsLoadingStateSelector = (state: GlobalState) =>
  pipe(
    state.features.fims.sso.currentFlowState,
    foldFimsFlowStateK(
      consentsState =>
        pipe(state.features.fims.sso.consentsData, consentsPot =>
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
