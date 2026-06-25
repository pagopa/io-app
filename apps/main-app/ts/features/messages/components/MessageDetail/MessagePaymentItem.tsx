import {
  ModulePaymentNotice,
  PaymentNoticeStatus,
  useIOToast,
  VSpacer
} from "@pagopa/io-app-design-system";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import I18n from "i18next";
import { useCallback, useEffect } from "react";
import { View } from "react-native";

import { PaymentAmount } from "../../../../../definitions/communication/PaymentAmount";
import { PaymentInfoResponse } from "../../../../../definitions/communication/PaymentInfoResponse";
import { ServiceId } from "../../../../../definitions/services/ServiceId";
import { fold, RemoteValue } from "../../../../common/model/RemoteValue";
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
): ProcessedPaymentUIData =>
  pipe(reason, paymentNoticeStatusFromPaymentError, paymentNoticeStatus => ({
    paymentNoticeStatus,
    badgeText: getBadgeTextByPaymentNoticeStatus(paymentNoticeStatus)
  }));

const modulePaymentNoticeForUndefinedOrLoadingPayment = () => (
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

const modulePaymentNoticeFromPaymentStatus = (
  hideExpirationDate: boolean,
  noticeNumber: string,
  paymentStatus: RemoteValue<PaymentInfoResponse, MessagePaymentError>,
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
    },
    processedPaymentDetails => {
      const formattedPaymentNoticeNumber =
        formatPaymentNoticeNumber(noticeNumber);
      const { paymentNoticeStatus, badgeText } =
        processedUIPaymentFromPaymentError(processedPaymentDetails);
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
  );

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
