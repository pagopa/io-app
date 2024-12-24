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
import { PaymentAmount } from "../../../../../definitions/backend/PaymentAmount";
import I18n from "../../../../i18n";
import {
  useIODispatch,
  useIOSelector,
  useIOStore
} from "../../../../store/hooks";
import { updatePaymentForMessage } from "../../store/actions";
import {
  canNavigateToPaymentFromMessageSelector,
  paymentStatusForUISelector,
  shouldUpdatePaymentSelector
} from "../../store/reducers/payments";
import { UIMessageId } from "../../types";
import { Detail_v2Enum } from "../../../../../definitions/backend/PaymentProblemJson";
import { PaymentRequestsGetResponse } from "../../../../../definitions/backend/PaymentRequestsGetResponse";
import {
  RemoteValue,
  fold,
  isError
} from "../../../../common/model/RemoteValue";
import { format } from "../../../../utils/dates";
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
import { computeAndTrackPaymentStart } from "./detailsUtils";

type MessagePaymentItemProps = {
  hideExpirationDate?: boolean;
  index?: number;
  isPNPayment?: boolean;
  messageId: UIMessageId;
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
    paymentNotice={{
      status: "error"
    }}
    badgeText={""}
  />
);

const modulePaymentNoticeFromPaymentStatus = (
  hideExpirationDate: boolean,
  noticeNumber: string,
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
        O.filter(_ => !hideExpirationDate),
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
        processedUIPaymentFromDetailV2Enum(processedPaymentDetails);
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
    initializeAndNavigateToWalletForPayment(
      rptId,
      isError(paymentStatusForUI),
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
  }, [dispatch, messageId, isPNPayment, rptId, serviceId, shouldUpdatePayment]);
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
