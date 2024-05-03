import { IOColors, IOStyles } from "@pagopa/io-app-design-system";
import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { ContactsListItem } from "../../messages/components/MessageDetail/ContactsListItem";
import { useIOSelector } from "../../../store/hooks";
import { serviceMetadataByIdSelector } from "../../services/details/store/reducers/servicesById";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import {
  ShowMoreListItem,
  ShowMoreSection
} from "../../messages/components/MessageDetail/ShowMoreListItem";
import { UIMessageId } from "../../messages/types";
import I18n from "../../../i18n";
import { NotificationPaymentInfo } from "../../../../definitions/pn/NotificationPaymentInfo";
import { formatPaymentNoticeNumber } from "../../payments/common/utils";
import { NotificationStatusHistory } from "../../../../definitions/pn/NotificationStatusHistory";
import { TimelineListItem } from "./TimelineListItem";

const styles = StyleSheet.create({
  container: {
    backgroundColor: IOColors["grey-50"],
    paddingBottom: "95%",
    marginBottom: "-95%",
    paddingHorizontal: IOStyles.horizontalContentPadding.paddingHorizontal,
    paddingTop: IOStyles.footer.paddingTop
  }
});

type MessageBottomMenuProps = {
  history: NotificationStatusHistory;
  isCancelled?: boolean;
  iun: string;
  messageId: UIMessageId;
  paidNoticeCodes?: ReadonlyArray<string>;
  payments?: ReadonlyArray<NotificationPaymentInfo>;
  serviceId: ServiceId;
};

const generateMessageSectionData = (
  iun: string,
  messageId: UIMessageId,
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
    const paymentsSectionData: ShowMoreSection =
      payments?.map((payment, index) => ({
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
      })) ?? [];
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
  serviceId
}: MessageBottomMenuProps) => {
  const serviceMetadata = useIOSelector(state =>
    serviceMetadataByIdSelector(state, serviceId)
  );
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
    <View style={styles.container}>
      <TimelineListItem history={history} />
      {(serviceMetadata?.email || serviceMetadata?.phone) && (
        <ContactsListItem
          email={serviceMetadata.email}
          phone={serviceMetadata.phone}
        />
      )}
      <ShowMoreListItem sections={showMoreSectionData} />
    </View>
  );
};
