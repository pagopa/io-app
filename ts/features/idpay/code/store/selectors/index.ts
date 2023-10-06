import * as pot from "@pagopa/ts-commons/lib/pot";
import { createSelector } from "reselect";
import { GlobalState } from "../../../../../store/reducers/types";
import { IdPayCodeState } from "../reducers";
import { idpayDiscountInitiativeInstrumentsSelector } from "../../../configuration/store";
import { InstrumentTypeEnum } from "../../../../../../definitions/idpay/InstrumentDTO";
import { idpayInitiativeIdSelector } from "../../../details/store";

export const idPayCodeStateSelector = (state: GlobalState): IdPayCodeState =>
  state.features.idPay.code;

export const isIdPayCodeOnboardedSelector = createSelector(
  idPayCodeStateSelector,
  state => pot.getOrElse(state.isOnboarded, false)
);

export const idPayCodeEnrollmentRequestSelector = createSelector(
  idPayCodeStateSelector,
  state => state.enrollmentRequest
);

export const idPayCodeSelector = createSelector(
  idPayCodeStateSelector,
  state => state.code
);

export const isIdPayInitiativeBannerClosedSelector = (state: GlobalState) =>
  state.features.idPay.code.isIdPayInitiativeBannerClosed;

export const hasIdPayCodeInstrument = createSelector(
  idpayDiscountInitiativeInstrumentsSelector,
  instruments =>
    instruments.some(
      instrument => instrument.instrumentType === InstrumentTypeEnum.IDPAYCODE
    )
);

export const showIdPayCodeBannerSelector = createSelector(
  idpayInitiativeIdSelector,
  isIdPayInitiativeBannerClosedSelector,
  hasIdPayCodeInstrument,
  (initiativeId, initiativeBannerClosed, hasIdPayCodeInstrument) =>
    initiativeId !== undefined &&
    (!initiativeBannerClosed || !initiativeBannerClosed[initiativeId]) &&
    !hasIdPayCodeInstrument
);
