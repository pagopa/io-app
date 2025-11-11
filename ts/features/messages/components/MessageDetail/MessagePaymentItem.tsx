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
import { updatePaymentForMessage } from "../../store/actions";
import {
  canNavigateToPaymentFromMessageSelector,
  paymentStatusForUISelector,
  shouldRetrievePaymentDataSelector
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
  isMessageSpecificError,
  MessagePaymentError
} from "../../types/paymentErrors";
import {
  SendOpeningSource,
  SendUserType
} from "../../../pushNotifications/analytics";
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
  paymentNoticeStatus: Exclude<PaymentNoticeStatus, "default">;
  badgeText: string;
};

const paymentNoticeStatusFromPaymentError = (
  reason: MessagePaymentError
): Exclude<PaymentNoticeStatus, "default"> => {
  const errorType = isMessageSpecificError(reason)
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
  reason: MessagePaymentError
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
