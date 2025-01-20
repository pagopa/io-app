import { pipe } from "fp-ts/lib/function";
import * as RA from "fp-ts/lib/ReadonlyArray";
import * as O from "fp-ts/lib/Option";
import { MutableRefObject } from "react";
import { StyleSheet, View } from "react-native";
import {
  ButtonLink,
  ListItemHeader,
  ModulePaymentNotice,
  VSpacer
} from "@pagopa/io-app-design-system";
import { CommonActions, useNavigation } from "@react-navigation/native";
import Placeholder from "rn-placeholder";
import I18n from "../../../i18n";
import { getBadgeTextByPaymentNoticeStatus } from "../../messages/utils/strings";
import { NotificationPaymentInfo } from "../../../../definitions/pn/NotificationPaymentInfo";
import { UIMessageId } from "../../messages/types";
import { useIOSelector } from "../../../store/hooks";
import { paymentsButtonStateSelector } from "../store/reducers/payments";
import { trackPNShowAllPayments } from "../analytics";
import PN_ROUTES from "../navigation/routes";
import { MESSAGES_ROUTES } from "../../messages/navigation/routes";
import { MessagePaymentItem } from "../../messages/components/MessageDetail/MessagePaymentItem";
import { getRptIdStringFromPayment } from "../utils/rptId";
import { canShowMorePaymentsLink } from "../utils";
import { ServiceId } from "../../../../definitions/backend/ServiceId";

const styles = StyleSheet.create({
  morePaymentsSkeletonContainer: {
    flex: 1,
    alignItems: "center"
  },
  morePaymentsLinkContainer: {
    alignSelf: "center"
  }
});

type MessagePaymentsProps = {
  messageId: UIMessageId;
  isCancelled: boolean;
  payments: ReadonlyArray<NotificationPaymentInfo> | undefined;
  completedPaymentNoticeCodes: ReadonlyArray<string> | undefined;
  maxVisiblePaymentCount: number;
  presentPaymentsBottomSheetRef: MutableRefObject<(() => void) | undefined>;
  serviceId: ServiceId;
};

const readonlyArrayHasNoData = <T,>(maybeArray: ReadonlyArray<T> | undefined) =>
  !maybeArray || RA.isEmpty(maybeArray);

/*
 * Skip the payment section when the notification is not cancelled but there are no payments to show
 * or
 * Skip the payment section when the notification is cancelled and there are no completed payments to show
 */
const paymentSectionShouldRenderNothing = (
  isCancelled: boolean,
  payments: ReadonlyArray<NotificationPaymentInfo> | undefined,
  completedPaymentNoticeCodes: ReadonlyArray<string> | undefined
) =>
  (!isCancelled && readonlyArrayHasNoData(payments)) ||
  (isCancelled && readonlyArrayHasNoData(completedPaymentNoticeCodes));

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

export const MessagePayments = ({
  messageId,
  isCancelled,
  payments,
  completedPaymentNoticeCodes,
  maxVisiblePaymentCount,
  presentPaymentsBottomSheetRef,
  serviceId
}: MessagePaymentsProps) => {
  const navigation = useNavigation();
  const paymentsButtonStatus = useIOSelector(state =>
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
      <>
        <ListItemHeader
          label={I18n.t("features.pn.details.paymentSection.title")}
          iconName={"productPagoPA"}
          iconColor={"blueIO-500"}
        />
        {completedPaymentNoticeCodes &&
          completedPaymentNoticeCodes.map(
            (completedPaymentNoticeCode, index) => (
              <View key={`MPN_${index}`}>
                <VSpacer size={8} />
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
                  paymentNotice={{
                    status: "paid"
                  }}
                  badgeText={getBadgeTextByPaymentNoticeStatus("paid")}
                  testID={"PnCancelledPaymentModulePaymentNotice"}
                />
              </View>
            )
          )}
      </>
    );
  }

  const morePaymentsLabel = payments
    ? `${I18n.t("features.pn.details.paymentSection.morePayments")} (${
        payments.length
      })`
    : "";
  return (
    <>
      <ListItemHeader
        label={I18n.t("features.pn.details.paymentSection.title")}
        iconName={"productPagoPA"}
        iconColor={"blueIO-500"}
      />
      {payments && (
        <>
          {payments.slice(0, maxVisiblePaymentCount).map((payment, index) => {
            const rptId = getRptIdStringFromPayment(payment);
            return (
              <MessagePaymentItem
                noSpaceOnTop={index === 0}
                index={index}
                isPNPayment
                key={`PM_${index}`}
                messageId={messageId}
                rptId={rptId}
                noticeNumber={payment.noticeCode}
                serviceId={serviceId}
              />
            );
          })}
          {canShowMorePaymentsLink(isCancelled, payments) && (
            <>
              <VSpacer size={32} />
              {paymentsButtonStatus === "visibleLoading" && (
                <View style={styles.morePaymentsSkeletonContainer}>
                  <Placeholder.Box
                    animate="fade"
                    radius={8}
                    width={172}
                    height={16}
                  />
                </View>
              )}
              {paymentsButtonStatus === "visibleEnabled" && (
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
              <VSpacer size={8} />
            </>
          )}
        </>
      )}
    </>
  );
};
