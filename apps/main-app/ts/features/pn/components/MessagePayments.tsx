import {
  IOButton,
  IOSkeleton,
  ListItemHeader,
  ModulePaymentNotice,
  useIOTheme,
  VSpacer
} from "@pagopa/io-app-design-system";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as RA from "fp-ts/lib/ReadonlyArray";
import I18n from "i18next";
import { MutableRefObject } from "react";
import { StyleSheet, View } from "react-native";

import { NotificationPaymentInfo } from "../../../../definitions/pn/NotificationPaymentInfo";
import { ServiceId } from "../../../../definitions/services/ServiceId";
import { useIOSelector } from "../../../store/hooks";
import { MessagePaymentItem } from "../../messages/components/MessageDetail/MessagePaymentItem";
import { MESSAGES_ROUTES } from "../../messages/navigation/routes";
import { getBadgeTextByPaymentNoticeStatus } from "../../messages/utils/strings";
import {
  SendOpeningSource,
  SendUserType
} from "../../pushNotifications/analytics";
import { trackPNShowAllPayments } from "../analytics";
import PN_ROUTES from "../navigation/routes";
import { paymentsButtonStateSelector } from "../store/reducers/payments";
import { canShowMorePaymentsLink } from "../utils";
import { getRptIdStringFromPayment } from "../utils/rptId";

const styles = StyleSheet.create({
  morePaymentsSkeletonContainer: {
    flex: 1,
    alignItems: "center"
  },
  morePaymentsLinkContainer: {
    alignSelf: "center"
  }
});

export type MessagePaymentsProps = {
  completedPaymentNoticeCodes: ReadonlyArray<string> | undefined;
  isCancelled: boolean;
  maxVisiblePaymentCount: number;
  messageId: string;
  payments: ReadonlyArray<NotificationPaymentInfo> | undefined;
  presentPaymentsBottomSheetRef: MutableRefObject<(() => void) | undefined>;
  sendOpeningSource: SendOpeningSource;
  sendUserType: SendUserType;
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
  serviceId,
  sendOpeningSource,
  sendUserType
}: MessagePaymentsProps) => {
  const navigation = useNavigation();
  const theme = useIOTheme();

  const pagoPAIconColor = theme["italyBrand-default"];

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
          iconColor={pagoPAIconColor}
          iconName={"productPagoPA"}
          label={I18n.t("features.pn.details.paymentSection.title")}
        />
        {completedPaymentNoticeCodes &&
          completedPaymentNoticeCodes.map(
            (completedPaymentNoticeCode, index) => (
              <View key={`MPN_${index}`}>
                <VSpacer size={8} />
                <ModulePaymentNotice
                  badgeText={getBadgeTextByPaymentNoticeStatus("paid")}
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
                  subtitle={completedPaymentNoticeCode}
                  testID={"PnCancelledPaymentModulePaymentNotice"}
                  title={I18n.t("features.pn.details.noticeCode")}
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
        iconColor={pagoPAIconColor}
        iconName={"productPagoPA"}
        label={I18n.t("features.pn.details.paymentSection.title")}
      />
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
                noSpaceOnTop={index === 0}
                noticeNumber={payment.noticeCode}
                rptId={rptId}
                sendOpeningSource={sendOpeningSource}
                sendUserType={sendUserType}
                serviceId={serviceId}
              />
            );
          })}
          {canShowMorePaymentsLink(isCancelled, payments) && (
            <>
              <VSpacer size={32} />
              {paymentsButtonStatus === "visibleLoading" && (
                <View style={styles.morePaymentsSkeletonContainer}>
                  <IOSkeleton
                    height={16}
                    radius={8}
                    shape="rectangle"
                    width={172}
                  />
                </View>
              )}
              {paymentsButtonStatus === "visibleEnabled" && (
                <View style={styles.morePaymentsLinkContainer}>
                  <IOButton
                    label={morePaymentsLabel}
                    onPress={() => {
                      trackPNShowAllPayments();
                      presentPaymentsBottomSheetRef.current?.();
                    }}
                    variant="link"
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
