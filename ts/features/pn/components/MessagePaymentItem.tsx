import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import React, { useCallback, useEffect } from "react";
import { View } from "react-native";
import { useDispatch, useStore } from "react-redux";
import {
  ModulePaymentNotice,
  PaymentNoticeStatus,
  VSpacer
} from "@pagopa/io-app-design-system";
import I18n from "i18n-js";
import { NotificationPaymentInfo } from "../../../../definitions/pn/NotificationPaymentInfo";
import { UIMessageId } from "../../messages/types";
import { getRptIdStringFromPayment } from "../utils/rptId";
import { GlobalState } from "../../../store/reducers/types";
import {
  paymentStatusForUISelector,
  shouldUpdatePaymentSelector
} from "../store/reducers/payments";
import { useIOSelector } from "../../../store/hooks";
import { updatePaymentForMessage } from "../store/actions";
import { RemoteValue, fold } from "../../../common/model/RemoteValue";
import { PaymentRequestsGetResponse } from "../../../../definitions/backend/PaymentRequestsGetResponse";
import { Detail_v2Enum } from "../../../../definitions/backend/PaymentProblemJson";
import {
  cleanTransactionDescription,
  getV2ErrorMainType
} from "../../../utils/payment";
import { getBadgeTextByPaymentNoticeStatus } from "../../messages/utils/strings";
import { format } from "../../../utils/dates";
import {
  centsToAmount,
  formatNumberAmount
} from "../../../utils/stringBuilder";
import { useIOToast } from "../../../components/Toast";
import { initializeAndNavigateToWalletForPayment } from "../utils";

type MessagePaymentItemProps = {
  index: number;
  messageId: UIMessageId;
  payment: NotificationPaymentInfo;
  noSpaceOnTop?: boolean;
  willNavigateToPayment?: () => void;
};

type ProcessedPaymentUIData = {
  paymentNoticeStatus: Exclude<PaymentNoticeStatus, "default">;
  badgeText: string;
};

const paymentNoticeStatusFromDetailV2Enum = (
  detail: Detail_v2Enum
): Exclude<PaymentNoticeStatus, "default"> => {
  const errorType = getV2ErrorMainType(detail);
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
  // Here EC (an error on the ente-side) is treated like a generic
  // ERROR since it is later specialized in the payment flow
  return "error";
};

const processedUIPaymentFromDetailV2Enum = (
  detail: Detail_v2Enum
): ProcessedPaymentUIData =>
  pipe(detail, paymentNoticeStatusFromDetailV2Enum, paymentNoticeStatus => ({
    paymentNoticeStatus,
    badgeText: getBadgeTextByPaymentNoticeStatus(paymentNoticeStatus)
  }));

const modulePaymentNoticeForUndefinedOrLoadingPayment = () => (
  <ModulePaymentNotice
    isLoading={true}
    title={""}
    subtitle={""}
    onPress={_ => undefined}
    paymentNoticeStatus={"error"}
    badgeText={""}
  />
);

const modulePaymentNoticeFromPaymentStatus = (
  noticeCode: string,
  paymentStatus: RemoteValue<PaymentRequestsGetResponse, Detail_v2Enum>,
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
        O.map(
          dueDate =>
            `${I18n.t("wallet.firstTransactionSummary.dueDate")} ${format(
              dueDate,
              "DD/MM/YYYY"
            )}`
        ),
        O.toUndefined
      );
      const description = cleanTransactionDescription(
        payablePayment.causaleVersamento
      );
      const formattedAmount = pipe(
        payablePayment.importoSingoloVersamento,
        centsToAmount,
        formatNumberAmount,
        formattedAmount => `${formattedAmount} €`
      );
      return (
        <ModulePaymentNotice
          title={dueDateOrUndefined}
          subtitle={description}
          paymentNoticeStatus="default"
          paymentNoticeAmount={formattedAmount}
          onPress={paymentCallback}
        />
      );
    },
    processedPaymentDetails => {
      const formattedPaymentNoticeCode = noticeCode
        .replace(/(\d{4})/g, "$1  ")
        .trim();
      const { paymentNoticeStatus, badgeText } =
        processedUIPaymentFromDetailV2Enum(processedPaymentDetails);
      return (
        <ModulePaymentNotice
          title={I18n.t("features.pn.details.noticeCode")}
          subtitle={formattedPaymentNoticeCode}
          onPress={paymentCallback}
          paymentNoticeStatus={paymentNoticeStatus}
          badgeText={badgeText}
        />
      );
    }
  );

export const MessagePaymentItem = ({
  index,
  messageId,
  payment,
  noSpaceOnTop = false,
  willNavigateToPayment = undefined
}: MessagePaymentItemProps) => {
  const dispatch = useDispatch();
  const store = useStore();
  const toast = useIOToast();

  const paymentId = getRptIdStringFromPayment(payment);

  const globalState = store.getState() as GlobalState;
  const shouldUpdatePayment = shouldUpdatePaymentSelector(
    globalState,
    messageId,
    paymentId
  );
  const paymentStatusForUI = useIOSelector(state =>
    paymentStatusForUISelector(state, messageId, paymentId)
  );

  const startPaymentCallback = useCallback(() => {
    initializeAndNavigateToWalletForPayment(
      paymentId,
      dispatch,
      () => toast.error(I18n.t("genericError")),
      () => willNavigateToPayment?.()
    );
  }, [dispatch, paymentId, toast, willNavigateToPayment]);
  useEffect(() => {
    if (shouldUpdatePayment) {
      const updateAction = updatePaymentForMessage.request({
        messageId,
        paymentId
      });
      dispatch(updateAction);
    }
  }, [dispatch, messageId, paymentId, shouldUpdatePayment]);
  return (
    <View>
      {!noSpaceOnTop && <VSpacer size={index > 0 ? 8 : 24} />}
      {modulePaymentNoticeFromPaymentStatus(
        payment.noticeCode,
        paymentStatusForUI,
        startPaymentCallback
      )}
    </View>
  );
};
