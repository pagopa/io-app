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
  iun: string;
  messageId: UIMessageId;
  payments?: ReadonlyArray<NotificationPaymentInfo>;
  serviceId: ServiceId;
};

const generateMessageSectionData = (
  iun: string,
  messageId: UIMessageId,
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
};

export const MessageBottomMenu = ({
  iun,
  messageId,
  payments,
  serviceId
}: MessageBottomMenuProps) => {
  const serviceMetadata = useIOSelector(state =>
    serviceMetadataByIdSelector(state, serviceId)
  );
  const showMoreSectionData = useMemo(
    () => generateMessageSectionData(iun, messageId, payments),
    [iun, messageId, payments]
  );
  return (
    <View style={styles.container}>
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
