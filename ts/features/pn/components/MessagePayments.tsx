import { pipe } from "fp-ts/lib/function";
import * as RA from "fp-ts/lib/ReadonlyArray";
import * as O from "fp-ts/lib/Option";
import React from "react";
import { View } from "react-native";
import I18n from "i18n-js";
import {
  Body,
  LabelLink,
  ModulePaymentNotice,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import { getBadgeTextByPaymentNoticeStatus } from "../../messages/utils/strings";
import { NotificationPaymentInfo } from "../../../../definitions/pn/NotificationPaymentInfo";
import { InfoBox } from "../../../components/box/InfoBox";
import { navigateToPnCancelledMessagePaidPaymentScreen } from "../navigation/actions";
import { H5 } from "../../../components/core/typography/H5";
import { UIMessageId } from "../../../store/reducers/entities/messages/types";
import { MessageDetailsSection } from "./MessageDetailsSection";
import { MessagePaymentItem } from "./MessagePaymentItem";

type MessagePaymentsProps = {
  messageId: UIMessageId;
  isCancelled: boolean;
  payments: ReadonlyArray<NotificationPaymentInfo> | undefined;
  completedPaymentNoticeCodes: ReadonlyArray<string> | undefined;
  maxVisiblePaymentCount: number;
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
  completedPaymentNoticeCodes,
  maxVisiblePaymentCount
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
  // console.log(`=== Payments: re-rendering`);
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
            .slice(0, maxVisiblePaymentCount)
            .map((payment, index) => (
              <MessagePaymentItem
                index={index}
                key={`PM_${index}`}
                messageId={messageId}
                payment={payment}
              />
            ))}
        {payments && payments.length > maxVisiblePaymentCount && (
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
