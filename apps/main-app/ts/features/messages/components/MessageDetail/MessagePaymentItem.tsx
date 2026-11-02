import { PaymentAmount } from "@io-app/api-types/generated/definitions/communication/PaymentAmount";
import { PaymentInfoResponse } from "@io-app/api-types/generated/definitions/communication/PaymentInfoResponse";
import { ServiceId } from "@io-app/api-types/generated/definitions/services/ServiceId";
import {
  ModulePaymentNotice,
  PaymentNoticeStatus,
  useIOToast,
  VSpacer
} from "@io-app/design-system";
import I18n from "i18next";
import { useCallback, useEffect } from "react";
import { View } from "react-native";

import { RemoteValue } from "../../../../common/model/RemoteValue";
import {
  useIODispatch,
  useIOSelector,
  useIOStore
} from "../../../../store/hooks";
import {
  cleanTransactionDescription,
  getV2ErrorMainType
} from "../../../../utils/payment";
import {
  centsToAmount,
  formatNumberAmount
} from "../../../../utils/stringBuilder";
import { formatAndValidateDueDate } from "../../../payments/checkout/utils";
import { formatPaymentNoticeNumber } from "../../../payments/common/utils";
import { trackPNPaymentStart } from "../../../pn/analytics";
import {
  SendOpeningSource,
  SendUserType
} from "../../../pushNotifications/analytics";
import { updatePaymentForMessage } from "../../store/actions";
import {
  canNavigateToPaymentFromMessageSelector,
  paymentStatusForUISelector,
  shouldRetrievePaymentDataSelector
} from "../../store/reducers/payments";
import {
  isMessagePaymentSpecificError,
  MessagePaymentError
} from "../../types/paymentErrors";
import { initializeAndNavigateToWalletForPayment } from "../../utils";
import { getBadgeTextByPaymentNoticeStatus } from "../../utils/strings";
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
  sendOpeningSource: SendOpeningSource;
  sendUserType: SendUserType;
  serviceId: ServiceId;
  willNavigateToPayment?: () => void;
};

type ProcessedPaymentUIData = {
  badgeText: string;
  paymentNoticeStatus: Exclude<PaymentNoticeStatus, "default">;
};

const paymentNoticeStatusFromPaymentError = (
  reason: MessagePaymentError
): Exclude<PaymentNoticeStatus, "default"> => {
  const errorType = isMessagePaymentSpecificError(reason)
    ? getV2ErrorMainType(reason.details)
    : reason.type;
  switch (errorType) {
    case "DUPLICATED":
      return "paid";
    case "EXPIRED":
      return "expired";
    case "ONGOING":
      return "in-progress";
    case "REVOKED":
      return "revoked";
  }
  return "error";
};

const processedUIPaymentFromPaymentError = (
  reason: MessagePaymentError
): ProcessedPaymentUIData => {
  const paymentNoticeStatus = paymentNoticeStatusFromPaymentError(reason);
  const badgeText = getBadgeTextByPaymentNoticeStatus(paymentNoticeStatus);
  return {
    paymentNoticeStatus,
    badgeText
  };
};

const modulePaymentNoticeFromPaymentStatus = (
  hideExpirationDate: boolean,
  noticeNumber: string,
  paymentStatus: RemoteValue<PaymentInfoResponse, MessagePaymentError>,
  paymentCallback: () => void
) => {
  switch (paymentStatus.kind) {
    case "error": {
      const formattedPaymentNoticeNumber =
        formatPaymentNoticeNumber(noticeNumber);
      const { paymentNoticeStatus, badgeText } =
        processedUIPaymentFromPaymentError(paymentStatus.error);
      return (
        <ModulePaymentNotice
          badgeText={badgeText}
          onPress={paymentCallback}
          paymentNotice={{
            status: paymentNoticeStatus
          }}
          subtitle={formattedPaymentNoticeNumber}
          title={I18n.t("features.messages.payments.noticeCode")}
        />
      );
    }
    case "loading":
    case "undefined":
      return (
        <ModulePaymentNotice
          badgeText={""}
          isLoading={true}
          onPress={_ => undefined}
          paymentNotice={{
            status: "error"
          }}
          subtitle={""}
          title={""}
        />
      );
    case "ready": {
      const dueDate: string | undefined = paymentStatus.value.dueDate;
      const maybeDate = hideExpirationDate ? undefined : dueDate;
      const formattedDueDate = maybeDate && formatAndValidateDueDate(maybeDate);
      const dueDateOrUndefined =
        formattedDueDate &&
        `${I18n.t("wallet.firstTransactionSummary.dueDate")} ${formattedDueDate}`;

      const description = cleanTransactionDescription(
        paymentStatus.value.description
      );
      const amount = centsToAmount(paymentStatus.value.amount);
      const formattedAmount = `${formatNumberAmount(amount)} €`;
      return (
        <ModulePaymentNotice
          onPress={paymentCallback}
          paymentNotice={{
            status: "default",
            amount: formattedAmount,
            amountAccessibilityLabel: formattedAmount
          }}
          subtitle={description}
          title={dueDateOrUndefined}
        />
      );
    }
  }
};

export const MessagePaymentItem = ({
  hideExpirationDate = false,
  index = 0,
  isPNPayment = false,
  messageId,
  noSpaceOnTop = false,
  noticeNumber,
  rptId,
  sendOpeningSource,
  sendUserType,
  serviceId,
  willNavigateToPayment = undefined
}: MessagePaymentItemProps) => {
  const dispatch = useIODispatch();
  const store = useIOStore();
  const toast = useIOToast();

  const paymentStatusForUI = useIOSelector(state =>
    paymentStatusForUISelector(state, messageId, rptId)
  );

  const canNavigateToPayment = useIOSelector(
    canNavigateToPaymentFromMessageSelector
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
          trackPNPaymentStart(sendOpeningSource, sendUserType);
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
    sendOpeningSource,
    sendUserType,
    serviceId,
    store,
    toast,
    willNavigateToPayment
  ]);
  useEffect(() => {
    // Since this data is only used to dispatch the update action and shouldn't
    // cause the component to re-render when it changes, the selector can be
    // called directly inside this useEffect.
    // There's no need to call it outside with a `useSelector`.
    const shouldUpdatePayment = shouldRetrievePaymentDataSelector(
      store.getState(),
      messageId,
      rptId
    );

    if (shouldUpdatePayment) {
      const updateAction = updatePaymentForMessage.request({
        messageId,
        paymentId: rptId,
        serviceId
      });
      dispatch(updateAction);
    }
  }, [dispatch, messageId, rptId, serviceId, store]);

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
