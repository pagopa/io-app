import {
  IOColors,
  IOVisualCostants,
  useIOTheme
} from "@pagopa/io-app-design-system";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import I18n from "i18next";
import { NotificationPaymentInfo } from "../../../../definitions/pn/NotificationPaymentInfo";
import { NotificationStatusHistory } from "../../../../definitions/pn/NotificationStatusHistory";
import {
  ShowMoreListItem,
  ShowMoreSection
} from "../../messages/components/MessageDetail/ShowMoreListItem";
import { formatPaymentNoticeNumber } from "../../payments/common/utils";
import {
  SendOpeningSource,
  SendUserType
} from "../../pushNotifications/analytics";
import { TimelineListItem } from "./TimelineListItem";
import { NeedHelp } from "./NeedHelp";

const styles = StyleSheet.create({
  container: {
    paddingBottom: "95%",
    marginBottom: "-95%",
    paddingHorizontal: IOVisualCostants.appMarginDefault,
    paddingTop: IOVisualCostants.appMarginDefault
  }
});

export type MessageBottomMenuProps = {
  history: NotificationStatusHistory;
  isCancelled?: boolean;
  iun: string;
  messageId: string;
  paidNoticeCodes?: ReadonlyArray<string>;
  payments?: ReadonlyArray<NotificationPaymentInfo>;
  sendOpeningSource: SendOpeningSource;
  sendUserType: SendUserType;
};

const generateMessageSectionData = (
  iun: string,
  messageId: string | undefined,
  isCancelled?: boolean,
  paidNoticeCodes?: ReadonlyArray<string>,
  payments?: ReadonlyArray<NotificationPaymentInfo>
): ReadonlyArray<ShowMoreSection> => {
  // IUN
  const sectionData: Array<ShowMoreSection> = [
    {
      title: I18n.t("features.pn.details.infoSection.iunSectionTitle"),
      items: [
        {
          accessibilityLabel: I18n.t(
            "features.pn.details.infoSection.iunAccessibility"
          ),
          icon: "docPaymentTitle",
          label: I18n.t("features.pn.details.infoSection.iun"),
          value: iun
        }
      ]
    }
  ];
  // MessageId (not defined is the notification is an AAR)
  if (messageId != null) {
    const messageIdSectionData: ShowMoreSection = {
      title: I18n.t("messageDetails.headerTitle"),
      items: [
        {
          accessibilityLabel: I18n.t(
            "messageDetails.showMoreDataBottomSheet.messageIdAccessibility"
          ),
          icon: "docPaymentTitle",
          label: I18n.t("messageDetails.showMoreDataBottomSheet.messageId"),
          value: messageId
        }
      ]
    };
    // eslint-disable-next-line functional/immutable-data
    sectionData.push(messageIdSectionData);
  }
  // Paid payments, when notification is cancelled but has previously paid payments
  if (isCancelled) {
    paidNoticeCodes?.forEach((paidNoticeCode, index) => {
      const paidPaymentData: ShowMoreSection = {
        title: `${I18n.t(
          "messageDetails.showMoreDataBottomSheet.pagoPAHeader"
        )} ${index + 1}`,
        items: [
          {
            accessibilityLabel: I18n.t(
              "messageDetails.showMoreDataBottomSheet.noticeCodeAccessibility"
            ),
            icon: "docPaymentCode",
            label: I18n.t("messageDetails.showMoreDataBottomSheet.noticeCode"),
            value: formatPaymentNoticeNumber(paidNoticeCode),
            valueToCopy: paidNoticeCode
          }
        ]
      };
      // eslint-disable-next-line functional/immutable-data
      sectionData.push(paidPaymentData);
    });
  }
  // Payments, when notification is not cancelled (and has payments)
  if (!isCancelled) {
    const hasMoreThanOnePayment = (payments?.length ?? 0) > 1;
    payments?.forEach((payment, index) => {
      const titleSuffix = hasMoreThanOnePayment ? ` ${index + 1}` : ``;
      const paymentData: ShowMoreSection = {
        title: `${I18n.t(
          "messageDetails.showMoreDataBottomSheet.pagoPAHeader"
        )}${titleSuffix}`,
        items: [
          {
            accessibilityLabel: I18n.t(
              "messageDetails.showMoreDataBottomSheet.noticeCodeAccessibility"
            ),
            icon: "docPaymentCode",
            label: I18n.t("messageDetails.showMoreDataBottomSheet.noticeCode"),
            value: formatPaymentNoticeNumber(payment.noticeCode),
            valueToCopy: payment.noticeCode
          },
          {
            accessibilityLabel: I18n.t(
              "messageDetails.showMoreDataBottomSheet.entityFiscalCodeAccessibility"
            ),
            icon: "entityCode",
            label: I18n.t(
              "messageDetails.showMoreDataBottomSheet.entityFiscalCode"
            ),
            value: payment.creditorTaxId
          }
        ]
      };
      // eslint-disable-next-line functional/immutable-data
      sectionData.push(paymentData);
    });
  }
  return sectionData;
};

export const MessageBottomMenu = ({
  history,
  isCancelled,
  iun,
  messageId,
  paidNoticeCodes,
  payments,
  sendOpeningSource,
  sendUserType
}: MessageBottomMenuProps) => {
  const theme = useIOTheme();

  const showMoreSectionData = useMemo(
    () =>
      generateMessageSectionData(
        iun,
        sendOpeningSource !== "aar" ? messageId : undefined,
        isCancelled,
        paidNoticeCodes,
        payments
      ),
    [isCancelled, iun, messageId, paidNoticeCodes, payments, sendOpeningSource]
  );
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: IOColors[theme["appBackground-secondary"]] }
      ]}
    >
      <TimelineListItem
        history={history}
        sendOpeningSource={sendOpeningSource}
        sendUserType={sendUserType}
      />
      <NeedHelp />
      <ShowMoreListItem sections={showMoreSectionData} />
    </View>
  );
};
