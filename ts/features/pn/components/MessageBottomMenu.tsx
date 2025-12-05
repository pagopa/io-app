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
  messageId: string,
  isCancelled?: boolean,
  paidNoticeCodes?: ReadonlyArray<string>,
  payments?: ReadonlyArray<NotificationPaymentInfo>
): ShowMoreSection => {
  const messageSectionData: ShowMoreSection = [
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
    },
    {
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
    }
  ];
  if (isCancelled) {
    const paymentsSectionData: ShowMoreSection =
      paidNoticeCodes?.map((paidNoticeCode, index) => ({
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
      })) ?? [];
    return messageSectionData.concat(paymentsSectionData);
  } else {
    const hasMoreThanOnePayment = (payments?.length ?? 0) > 1;
    const paymentsSectionData: ShowMoreSection =
      payments?.map((payment, index) => {
        const titleSuffix = hasMoreThanOnePayment ? ` ${index + 1}` : ``;
        return {
          title: `${I18n.t(
            "messageDetails.showMoreDataBottomSheet.pagoPAHeader"
          )}${titleSuffix}`,
          items: [
            {
              accessibilityLabel: I18n.t(
                "messageDetails.showMoreDataBottomSheet.noticeCodeAccessibility"
              ),
              icon: "docPaymentCode",
              label: I18n.t(
                "messageDetails.showMoreDataBottomSheet.noticeCode"
              ),
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
      }) ?? [];
    return messageSectionData.concat(paymentsSectionData);
  }
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
        messageId,
        isCancelled,
        paidNoticeCodes,
        payments
      ),
    [isCancelled, iun, messageId, paidNoticeCodes, payments]
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
