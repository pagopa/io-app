import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import React from "react";
import I18n from "i18n-js";
import { ModulePaymentNotice, VSpacer } from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import { getBadgeTextByPaymentNoticeStatus } from "../../messages/utils/strings";
import { NotificationPaymentInfo } from "../../../../definitions/pn/NotificationPaymentInfo";
import { TransactionSummary } from "../../../screens/wallet/payment/components/TransactionSummary";
import { TransactionSummaryErrorDetails } from "../../../screens/wallet/payment/components/TransactionSummaryErrorDetails";
import { PotFromActions } from "../../../types/utils";
import { paymentVerifica } from "../../../store/actions/wallet/payment";
import { TransactionSummaryError } from "../../../screens/wallet/payment/NewTransactionSummaryScreen";
import { UIMessageId } from "../../../store/reducers/entities/messages/types";
import { InfoBox } from "../../../components/box/InfoBox";
import { navigateToPnCancelledMessagePaidPaymentScreen } from "../navigation/actions";
import { H5 } from "../../../components/core/typography/H5";
import { PnMessageDetailsSection } from "./PnMessageDetailsSection";

type Props = {
  messageId: UIMessageId;
  firstLoadingRequest: boolean;
  isCancelled: boolean;
  isPaid: boolean;
  payment: NotificationPaymentInfo | undefined;
  completedPaymentNoticeCode: string | undefined;
  paymentVerification: PotFromActions<
    (typeof paymentVerifica)["success"],
    (typeof paymentVerifica)["failure"]
  >;
  paymentVerificationError: TransactionSummaryError;
};

/*
 * Skip the payment section when the notification is not cancelled but there is no payment to show
 * or
 * Skip the payment section when the notification is cancelled and there is no payment nor completed payment to show
 */
const paymentSectionShouldRenderNothing = (
  isCancelled: boolean,
  payment: NotificationPaymentInfo | undefined,
  completedPaymentNoticeCode: string | undefined
) =>
  (!isCancelled && !payment) ||
  (isCancelled && !payment && !completedPaymentNoticeCode);

const generateNavigationToPaidPaymentScreenAction = (
  noticeCode: string,
  maybePayment: NotificationPaymentInfo | undefined
) =>
  pipe(
    maybePayment,
    O.fromNullable,
    O.filter(payment => noticeCode === payment.noticeCode),
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

export const PnMessagePayment = ({
  messageId,
  firstLoadingRequest,
  isCancelled,
  isPaid,
  payment,
  completedPaymentNoticeCode,
  paymentVerification,
  paymentVerificationError
}: Props) => {
  const navigation = useNavigation();
  if (
    paymentSectionShouldRenderNothing(
      isCancelled,
      payment,
      completedPaymentNoticeCode
    )
  ) {
    return null;
  }
  if (isCancelled) {
    return (
      <PnMessageDetailsSection
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
        {completedPaymentNoticeCode && (
          <>
            <VSpacer size={24} />
            <ModulePaymentNotice
              title={I18n.t("features.pn.details.noticeCode")}
              subtitle={completedPaymentNoticeCode}
              onPress={() =>
                navigation.dispatch(
                  generateNavigationToPaidPaymentScreenAction(
                    completedPaymentNoticeCode,
                    payment
                  )
                )
              }
              paymentNoticeStatus={"paid"}
              badgeText={getBadgeTextByPaymentNoticeStatus("paid")}
              testID={"PnCancelledPaymentModulePaymentNotice"}
            />
          </>
        )}
      </PnMessageDetailsSection>
    );
  } else {
    return (
      <PnMessageDetailsSection
        title={I18n.t("features.pn.details.paymentSection.title")}
        testID={"PnPaymentSectionTitle"}
      >
        {firstLoadingRequest && payment && (
          <>
            <TransactionSummary
              paymentVerification={paymentVerification}
              paymentNoticeNumber={payment.noticeCode}
              organizationFiscalCode={payment.creditorTaxId}
              isPaid={isPaid}
            />
            {O.isSome(paymentVerificationError) && (
              <TransactionSummaryErrorDetails
                error={paymentVerificationError}
                paymentNoticeNumber={payment.noticeCode}
                organizationFiscalCode={payment.creditorTaxId}
                messageId={messageId}
              />
            )}
          </>
        )}
      </PnMessageDetailsSection>
    );
  }
};
