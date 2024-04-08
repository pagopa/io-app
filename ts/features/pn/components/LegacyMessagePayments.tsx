import { pipe } from "fp-ts/lib/function";
import * as RA from "fp-ts/lib/ReadonlyArray";
import * as O from "fp-ts/lib/Option";
import React, { MutableRefObject } from "react";
import { StyleSheet, View } from "react-native";
import I18n from "i18n-js";
import {
  ButtonLink,
  ModulePaymentNotice,
  VSpacer
} from "@pagopa/io-app-design-system";
import { CommonActions, useNavigation } from "@react-navigation/native";
import Placeholder from "rn-placeholder";
import { getBadgeTextByPaymentNoticeStatus } from "../../messages/utils/strings";
import { NotificationPaymentInfo } from "../../../../definitions/pn/NotificationPaymentInfo";
import { InfoBox } from "../../../components/box/InfoBox";
import { H5 } from "../../../components/core/typography/H5";
import { UIMessageId } from "../../messages/types";
import { useIOSelector } from "../../../store/hooks";
import { paymentsButtonStateSelector } from "../store/reducers/payments";
import { trackPNShowAllPayments } from "../analytics";
import PN_ROUTES from "../navigation/routes";
import { MESSAGES_ROUTES } from "../../messages/navigation/routes";
import { MessagePaymentItem } from "../../messages/components/MessageDetail/MessagePaymentItem";
import { getRptIdStringFromPayment } from "../utils/rptId";
import { MessageDetailsSection } from "./MessageDetailsSection";

const styles = StyleSheet.create({
  morePaymentsSkeletonContainer: {
    flex: 1,
    alignItems: "center"
  },
  morePaymentsLinkContainer: {
    alignSelf: "center"
  }
});

type LegacyMessagePaymentsProps = {
  messageId: UIMessageId;
  isCancelled: boolean;
  payments: ReadonlyArray<NotificationPaymentInfo> | undefined;
  completedPaymentNoticeCodes: ReadonlyArray<string> | undefined;
  maxVisiblePaymentCount: number;
  presentPaymentsBottomSheetRef: MutableRefObject<(() => void) | undefined>;
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
      CommonActions.navigate(MESSAGES_ROUTES.MESSAGES_NAVIGATOR, {
        screen: PN_ROUTES.MAIN,
        params: {
          screen: PN_ROUTES.CANCELLED_MESSAGE_PAID_PAYMENT,
          params: {
            noticeCode,
            creditorTaxId: maybeCreditorTaxId
          }
        }
      })
  );

export const LegacyMessagePayments = ({
  messageId,
  isCancelled,
  payments,
  completedPaymentNoticeCodes,
  maxVisiblePaymentCount,
  presentPaymentsBottomSheetRef
}: LegacyMessagePaymentsProps) => {
  const navigation = useNavigation();
  const morePaymentsLinkState = useIOSelector(state =>
    paymentsButtonStateSelector(
      state,
      messageId,
      payments,
      maxVisiblePaymentCount
    )
  );
  if (
    paymentSectionShouldRenderNothing(
      isCancelled,
      payments,
      completedPaymentNoticeCodes
    )
  ) {
    return null;
  }
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
  }

  const showMorePaymentsLink =
    payments && payments.length > maxVisiblePaymentCount;
  const morePaymentsLabel = payments
    ? `${I18n.t("features.pn.details.paymentSection.morePayments")} (${
        payments.length
      })`
    : "";
  return (
    <MessageDetailsSection
      title={I18n.t("features.pn.details.paymentSection.title")}
      iconName={"productPagoPA"}
      testID={"PnPaymentSectionTitle"}
    >
      {payments && (
        <>
          {payments.slice(0, maxVisiblePaymentCount).map((payment, index) => {
            const rptId = getRptIdStringFromPayment(payment);
            return (
              <MessagePaymentItem
                index={index}
                isPNPayment
                key={`PM_${index}`}
                messageId={messageId}
                rptId={rptId}
                noticeNumber={payment.noticeCode}
              />
            );
          })}
          {showMorePaymentsLink && (
            <>
              <VSpacer size={16} />
              {morePaymentsLinkState === "visibleLoading" && (
                <View style={styles.morePaymentsSkeletonContainer}>
                  <Placeholder.Box
                    animate="fade"
                    radius={8}
                    width={172}
                    height={16}
                  />
                </View>
              )}
              {morePaymentsLinkState === "visibleEnabled" && (
                <View style={styles.morePaymentsLinkContainer}>
                  <ButtonLink
                    accessibilityLabel={morePaymentsLabel}
                    label={morePaymentsLabel}
                    onPress={() => {
                      trackPNShowAllPayments();
                      presentPaymentsBottomSheetRef.current?.();
                    }}
                  />
                </View>
              )}
            </>
          )}
        </>
      )}
    </MessageDetailsSection>
  );
};
