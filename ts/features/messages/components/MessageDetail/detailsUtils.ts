import { PaymentInfoResponse } from "../../../../../definitions/backend/PaymentInfoResponse";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { isReady, RemoteValue } from "../../../../common/model/RemoteValue";
import { GlobalState } from "../../../../store/reducers/types";
import { CTA } from "../../../../types/LocalizedCTAs";
import { serviceDetailsByIdSelector } from "../../../services/details/store/selectors";
import { trackCTAPressed, trackPaymentStart } from "../../analytics";
import {
  isTimeoutOrGenericOrOngoingPaymentError,
  MessagePaymentError
} from "../../types/paymentErrors";

export const computeAndTrackCTAPressAnalytics = (
  isFirstCTA: boolean,
  cta: CTA,
  serviceId: ServiceId,
  state: GlobalState
) => {
  const service = serviceDetailsByIdSelector(state, serviceId);
  trackCTAPressed(
    serviceId,
    service?.name,
    service?.organization.name,
    service?.organization.fiscal_code,
    isFirstCTA,
    cta.text
  );
};

export const computeAndTrackPaymentStart = (
  serviceId: ServiceId,
  state: GlobalState
) => {
  const service = serviceDetailsByIdSelector(state, serviceId);
  trackPaymentStart(
    serviceId,
    service?.name,
    service?.organization.name,
    service?.organization.fiscal_code
  );
};

export const shouldUpdatePaymentUponReturning = (
  payment: RemoteValue<PaymentInfoResponse, MessagePaymentError>
) => isReady(payment) || isTimeoutOrGenericOrOngoingPaymentError(payment);
