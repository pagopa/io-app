import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { GlobalState } from "../../../../store/reducers/types";
import { serviceDetailsByIdSelector } from "../../../services/details/store/selectors";
import { trackCTAPressed, trackPaymentStart } from "../../analytics";
import { CTA } from "../../../../types/LocalizedCTAs";
import {
  isError,
  isReady,
  RemoteValue
} from "../../../../common/model/RemoteValue";
import { PaymentInfoResponse } from "../../../../../definitions/backend/PaymentInfoResponse";
import {
  isGenericError,
  isTimeoutError,
  PaymentError
} from "../../store/actions";

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
  payment: RemoteValue<PaymentInfoResponse, PaymentError>
) =>
  isReady(payment) ||
  (isError(payment) &&
    (isGenericError(payment.error) || isTimeoutError(payment.error)));
