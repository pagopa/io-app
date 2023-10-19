import { pipe } from "fp-ts/lib/function";
import * as RA from "fp-ts/lib/ReadonlyArray";
import * as O from "fp-ts/lib/Option";
import React, { useEffect } from "react";
import { View } from "react-native";
import I18n from "i18n-js";
import {
  Body,
  LabelLink,
  ModulePaymentNotice,
  PaymentNoticeStatus,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useStore } from "react-redux";
import { getBadgeTextByPaymentNoticeStatus } from "../../messages/utils/strings";
import { NotificationPaymentInfo } from "../../../../definitions/pn/NotificationPaymentInfo";
import { InfoBox } from "../../../components/box/InfoBox";
import { navigateToPnCancelledMessagePaidPaymentScreen } from "../navigation/actions";
import { H5 } from "../../../components/core/typography/H5";
import { useIOSelector } from "../../../store/hooks";
import { UIMessageId } from "../../../store/reducers/entities/messages/types";
import { getRptIdStringFromPayment } from "../utils/rptId";
import { updatePaymentForMessage } from "../store/actions";
import { PaymentRequestsGetResponse } from "../../../../definitions/backend/PaymentRequestsGetResponse";
import { Detail_v2Enum } from "../../../../definitions/backend/PaymentProblemJson";
import { RemoteValue, fold } from "../../bonus/bpd/model/RemoteValue";
import {
  paymentStatusForUISelector,
  shouldUpdatePaymentSelector
} from "../store/reducers/payments";
import { GlobalState } from "../../../store/reducers/types";
import { getV2ErrorMainType } from "../../../utils/payment";
import { MessageDetailsSection } from "./MessageDetailsSection";

type MessagePaymentsProps = {
  messageId: UIMessageId;
  isCancelled: boolean;
  payments: ReadonlyArray<NotificationPaymentInfo> | undefined;
  completedPaymentNoticeCodes: ReadonlyArray<string> | undefined;
};

const readonlyArrayHasNoData = <T,>(maybeArray: ReadonlyArray<T> | undefined) =>
  !maybeArray || RA.isEmpty(maybeArray);

/*
 * Skip the payment section when the notification is not cancelled but there are no payments to show
 * or
 * Skip the payment section when the notification is cancelled and there are no payments nor completed payments to show
 */
const paymentSectionShouldRenderNothing = (
  isCancelled: boolean,
  payments: ReadonlyArray<NotificationPaymentInfo> | undefined,
  completedPaymentNoticeCodes: ReadonlyArray<string> | undefined
) =>
  (!isCancelled && readonlyArrayHasNoData(payments)) ||
  (isCancelled &&
    readonlyArrayHasNoData(payments) &&
    readonlyArrayHasNoData(completedPaymentNoticeCodes));

const generateNavigationToPaidPaymentScreenAction = (
  noticeCode: string,
  maybePayments: ReadonlyArray<NotificationPaymentInfo> | undefined
) =>
  pipe(
    maybePayments,
    O.fromNullable,
    O.chain(payments =>
      pipe(
        payments,
        RA.findFirst(payment => noticeCode === payment.noticeCode)
      )
    ),
    O.fold(
      () => undefined,
      payment => payment.creditorTaxId
    ),
    maybeCreditorTaxId =>
      navigateToPnCancelledMessagePaidPaymentScreen({
        noticeCode,
        creditorTaxId: maybeCreditorTaxId
      })
  );

export const MessagePayments = ({
  messageId,
  isCancelled,
  payments,
  completedPaymentNoticeCodes
}: MessagePaymentsProps) => {
  const navigation = useNavigation();
  if (
    paymentSectionShouldRenderNothing(
      isCancelled,
      payments,
      completedPaymentNoticeCodes
    )
  ) {
    return null;
  }
  console.log(`=== Payments: re-rendering`);
  if (isCancelled) {
    return (
      <MessageDetailsSection
        title={I18n.t("features.pn.details.cancelledMessage.payments")}
        testID={"PnCancelledPaymentSectionTitle"}
      >
        <VSpacer size={24} />
        <InfoBox
          alignedCentral={true}
          iconSize={24}
          iconColor={"bluegrey"}
          testID={"PnCancelledPaymentInfoBox"}
        >
          <H5 weight={"Regular"}>
            {I18n.t("features.pn.details.cancelledMessage.unpaidPayments")}
          </H5>
        </InfoBox>
        {completedPaymentNoticeCodes &&
          completedPaymentNoticeCodes.map(
            (completedPaymentNoticeCode, index) => (
              <View key={`MPN_${index}`}>
                <VSpacer size={index > 0 ? 8 : 24} />
                <ModulePaymentNotice
                  title={I18n.t("features.pn.details.noticeCode")}
                  subtitle={completedPaymentNoticeCode}
                  onPress={() =>
                    navigation.dispatch(
                      generateNavigationToPaidPaymentScreenAction(
                        completedPaymentNoticeCode,
                        payments
                      )
                    )
                  }
                  paymentNoticeStatus={"paid"}
                  badgeText={getBadgeTextByPaymentNoticeStatus("paid")}
                  testID={"PnCancelledPaymentModulePaymentNotice"}
                />
              </View>
            )
          )}
      </MessageDetailsSection>
    );
  } else {
    return (
      <MessageDetailsSection
        title={I18n.t("features.pn.details.paymentSection.title")}
        iconName={"productPagoPA"}
        testID={"PnPaymentSectionTitle"}
      >
        <Body>{I18n.t("features.pn.details.paymentSection.notice")}</Body>
        {payments &&
          payments
            .slice(0, 5)
            .map((payment, index) => (
              <MessagePayment
                index={index}
                key={`PM_${index}`}
                messageId={messageId}
                payment={payment}
              />
            ))}
        {payments && payments.length > 5 && (
          <>
            <VSpacer size={24} />
            <LabelLink onPress={() => undefined}>
              {`${I18n.t("features.pn.details.paymentSection.morePayments")} (${
                payments.length
              })`}
            </LabelLink>
          </>
        )}
      </MessageDetailsSection>
    );
  }
};

type MessagePaymentProps = {
  index: number;
  messageId: UIMessageId;
  payment: NotificationPaymentInfo;
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
    case "EC":
      // TODO
      break;
    case "REVOKED":
      return "revoked";
    case "EXPIRED":
      return "expired";
    case "ONGOING":
      // TODO
      break;
    case "DUPLICATED":
      return "paid";
  }
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
  paymentId: string,
  paymentStatus: RemoteValue<PaymentRequestsGetResponse, Detail_v2Enum>
) =>
  fold(
    paymentStatus,
    modulePaymentNoticeForUndefinedOrLoadingPayment,
    modulePaymentNoticeForUndefinedOrLoadingPayment,
    payablePayment => (
      <ModulePaymentNotice
        title={payablePayment.dueDate}
        subtitle={payablePayment.causaleVersamento}
        paymentNoticeStatus="default"
        paymentNoticeAmount={`${payablePayment.importoSingoloVersamento}`}
        onPress={_ => undefined}
      />
    ),
    processedPaymentDetails => {
      const { paymentNoticeStatus, badgeText } =
        processedUIPaymentFromDetailV2Enum(processedPaymentDetails);
      return (
        <ModulePaymentNotice
          title={I18n.t("features.pn.details.noticeCode")}
          subtitle={paymentId}
          onPress={_ => undefined}
          paymentNoticeStatus={paymentNoticeStatus}
          badgeText={badgeText}
        />
      );
    }
  );

const MessagePayment = ({ index, messageId, payment }: MessagePaymentProps) => {
  const dispatch = useDispatch();

  const paymentId = getRptIdStringFromPayment(payment);

  const store = useStore();
  const globalState = store.getState() as GlobalState;
  const shouldUpdatePayment = shouldUpdatePaymentSelector(
    globalState,
    messageId,
    paymentId
  );
  const paymentStatusForUI = useIOSelector(state =>
    paymentStatusForUISelector(state, messageId, paymentId)
  );
  useEffect(() => {
    if (shouldUpdatePayment) {
      const updateAction = updatePaymentForMessage.request({
        messageId,
        paymentId
      });
      console.log(`=== PaymentItem: dispatch (${messageId}) (${paymentId})`);
      dispatch(updateAction);
    }
    // Request payment
  }, [dispatch, messageId, paymentId, shouldUpdatePayment]);
  console.log(`=== PaymentItem: re-rendering`);
  return (
    <View>
      <VSpacer size={index > 0 ? 8 : 24} />
      {modulePaymentNoticeFromPaymentStatus(paymentId, paymentStatusForUI)}
    </View>
  );
};
