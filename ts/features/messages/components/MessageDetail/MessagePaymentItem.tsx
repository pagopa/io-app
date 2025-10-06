import {
  ModulePaymentNotice,
  PaymentNoticeStatus,
  VSpacer,
  useIOToast
} from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { useCallback, useEffect } from "react";
import { View } from "react-native";
import I18n from "i18next";
import { PaymentAmount } from "../../../../../definitions/backend/PaymentAmount";
import {
  useIODispatch,
  useIOSelector,
  useIOStore
} from "../../../../store/hooks";
import {
  isSpecificError,
  PaymentError,
  updatePaymentForMessage
} from "../../store/actions";
import {
  canNavigateToPaymentFromMessageSelector,
  paymentStatusForUISelector,
  shouldUpdatePaymentSelector
} from "../../store/reducers/payments";
import { PaymentInfoResponse } from "../../../../../definitions/backend/PaymentInfoResponse";
import { RemoteValue, fold } from "../../../../common/model/RemoteValue";
import {
  cleanTransactionDescription,
  getV2ErrorMainType
} from "../../../../utils/payment";
import {
  centsToAmount,
  formatNumberAmount
} from "../../../../utils/stringBuilder";
import { initializeAndNavigateToWalletForPayment } from "../../utils";
import { getBadgeTextByPaymentNoticeStatus } from "../../utils/strings";
import { formatPaymentNoticeNumber } from "../../../payments/common/utils";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { trackPNPaymentStart } from "../../../pn/analytics";
import { formatAndValidateDueDate } from "../../../payments/checkout/utils";
import {
  computeAndTrackPaymentStart,
  shouldUpdatePaymentUponReturning
} from "./detailsUtils";

type MessagePaymentItemProps = {
  hideExpirationDate?: boolean;
  index?: number;
  isPNPayment?: boolean;
  messageId: string;
  noSpaceOnTop?: boolean;
  noticeNumber: string;
  paymentAmount?: PaymentAmount;
  rptId: string;
  serviceId: ServiceId;
  willNavigateToPayment?: () => void;
};

type ProcessedPaymentUIData = {
  paymentNoticeStatus: Exclude<PaymentNoticeStatus, "default">;
  badgeText: string;
};

const paymentNoticeStatusFromPaymentError = (
  reason: PaymentError
): Exclude<PaymentNoticeStatus, "default"> => {
  const errorType = isSpecificError(reason)
    ? getV2ErrorMainType(reason.details)
    : reason.type;
  switch (errorType) {
    case "REVOKED":
      return "revoked";
    case "EXPIRED":
      return "expired";
    case "ONGOING":
      return "in-progress";
    case "DUPLICATED":
      return "paid";
  }
  return "error";
};

const processedUIPaymentFromPaymentError = (
  reason: PaymentError
): ProcessedPaymentUIData =>
  pipe(reason, paymentNoticeStatusFromPaymentError, paymentNoticeStatus => ({
    paymentNoticeStatus,
    badgeText: getBadgeTextByPaymentNoticeStatus(paymentNoticeStatus)
  }));

const modulePaymentNoticeForUndefinedOrLoadingPayment = () => (
  <ModulePaymentNotice
    isLoading={true}
    title={""}
    subtitle={""}
    onPress={_ => undefined}
    paymentNotice={{
      status: "error"
    }}
    badgeText={""}
  />
);

const modulePaymentNoticeFromPaymentStatus = (
  hideExpirationDate: boolean,
  noticeNumber: string,
  paymentStatus: RemoteValue<PaymentInfoResponse, PaymentError>,
  paymentCallback: () => void
) =>
  fold(
    paymentStatus,
    modulePaymentNoticeForUndefinedOrLoadingPayment,
    modulePaymentNoticeForUndefinedOrLoadingPayment,
    payablePayment => {
      const dueDateOrUndefined = pipe(
        payablePayment.dueDate,
        O.fromNullable,
        O.filter(_ => !hideExpirationDate),
        O.chainNullableK(formatAndValidateDueDate),
        O.map(
          dueDate =>
            `${I18n.t("wallet.firstTransactionSummary.dueDate")} ${dueDate}`
        ),
        O.toUndefined
      );
      const description = cleanTransactionDescription(
        payablePayment.description
      );
      const formattedAmount = pipe(
        payablePayment.amount,
        centsToAmount,
        formatNumberAmount,
        formattedAmountNumber => `${formattedAmountNumber} €`
      );
      return (
        <ModulePaymentNotice
          title={dueDateOrUndefined}
          subtitle={description}
          paymentNotice={{
            status: "default",
            amount: formattedAmount,
            amountAccessibilityLabel: formattedAmount
          }}
          onPress={paymentCallback}
        />
      );
    },
    processedPaymentDetails => {
      const formattedPaymentNoticeNumber =
        formatPaymentNoticeNumber(noticeNumber);
      const { paymentNoticeStatus, badgeText } =
        processedUIPaymentFromPaymentError(processedPaymentDetails);
      return (
        <ModulePaymentNotice
          title={I18n.t("features.messages.payments.noticeCode")}
          subtitle={formattedPaymentNoticeNumber}
          onPress={paymentCallback}
          paymentNotice={{
            status: paymentNoticeStatus
          }}
          badgeText={badgeText}
        />
      );
    }
  );

export const MessagePaymentItem = ({
  hideExpirationDate = false,
  index = 0,
  isPNPayment = false,
  messageId,
  noSpaceOnTop = false,
  noticeNumber,
  rptId,
  serviceId,
  willNavigateToPayment = undefined
}: MessagePaymentItemProps) => {
  const dispatch = useIODispatch();
  const store = useIOStore();
  const toast = useIOToast();

  const shouldUpdatePayment = shouldUpdatePaymentSelector(
    store.getState(),
    messageId,
    rptId
  );
  const paymentStatusForUI = useIOSelector(state =>
    paymentStatusForUISelector(state, messageId, rptId)
  );

  const canNavigateToPayment = useIOSelector(state =>
    canNavigateToPaymentFromMessageSelector(state)
  );

  const startPaymentCallback = useCallback(() => {
    const updatePaymentUponReturning =
      shouldUpdatePaymentUponReturning(paymentStatusForUI);
    initializeAndNavigateToWalletForPayment(
      rptId,
      updatePaymentUponReturning,
      canNavigateToPayment,
      dispatch,
      () => {
        if (isPNPayment) {
          trackPNPaymentStart();
        } else {
          computeAndTrackPaymentStart(serviceId, store.getState());
        }
      },
      () => toast.error(I18n.t("genericError")),
      () => willNavigateToPayment?.()
    );
  }, [
    canNavigateToPayment,
    dispatch,
    isPNPayment,
    paymentStatusForUI,
    rptId,
    serviceId,
    store,
    toast,
    willNavigateToPayment
  ]);
  useEffect(() => {
    if (shouldUpdatePayment) {
      const updateAction = updatePaymentForMessage.request({
        messageId,
        paymentId: rptId,
        serviceId
      });
      dispatch(updateAction);
    }
  }, [dispatch, messageId, rptId, serviceId, shouldUpdatePayment]);
  return (
    <View>
      {!noSpaceOnTop && <VSpacer size={index > 0 ? 8 : 24} />}
      {modulePaymentNoticeFromPaymentStatus(
        hideExpirationDate,
        noticeNumber,
        paymentStatusForUI,
        startPaymentCallback
      )}
    </View>
  );
};
