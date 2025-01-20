import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import {
  IOColors,
  IOStyles,
  useIOTheme,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useIOSelector } from "../../../../store/hooks";
import { serviceMetadataByIdSelector } from "../../../services/details/store/reducers";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { UIMessageId } from "../../types";
import I18n from "../../../../i18n";
import { formatPaymentNoticeNumber } from "../../../payments/common/utils";
import { ContactsListItem } from "./ContactsListItem";
import {
  ShowMoreItems,
  ShowMoreListItem,
  ShowMoreSection
} from "./ShowMoreListItem";

const styles = StyleSheet.create({
  container: {
    paddingBottom: "75%",
    marginBottom: "-75%"
  }
});

export type MessageDetailsFooterProps = {
  messageId: UIMessageId;
  noticeNumber?: string;
  payeeFiscalCode?: string;
  serviceId: ServiceId;
};

const generateMessageSectionData = (
  messageId: UIMessageId,
  noticeNumber?: string,
  payeeFiscalCode?: string
) => {
  const messageSectionDataArray: ShowMoreSection = [
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
  const noticeNumberItemArray: ShowMoreItems = noticeNumber
    ? [
        {
          accessibilityLabel: I18n.t(
            "messageDetails.showMoreDataBottomSheet.noticeCodeAccessibility"
          ),
          icon: "docPaymentCode",
          label: I18n.t("messageDetails.showMoreDataBottomSheet.noticeCode"),
          value: formatPaymentNoticeNumber(noticeNumber),
          valueToCopy: noticeNumber
        }
      ]
    : [];
  const payeeFiscalCodeItemArray: ShowMoreItems = payeeFiscalCode
    ? [
        {
          accessibilityLabel: I18n.t(
            "messageDetails.showMoreDataBottomSheet.entityFiscalCodeAccessibility"
          ),
          icon: "entityCode",
          label: I18n.t(
            "messageDetails.showMoreDataBottomSheet.entityFiscalCode"
          ),
          value: payeeFiscalCode
        }
      ]
    : [];
  const paymentItemData = noticeNumberItemArray.concat(
    payeeFiscalCodeItemArray
  );
  const paymentSectionDataArray: ShowMoreSection =
    paymentItemData.length > 0
      ? [
          {
            title: I18n.t(
              "messageDetails.showMoreDataBottomSheet.pagoPAHeader"
            ),
            items: paymentItemData
          }
        ]
      : [];
  return messageSectionDataArray.concat(paymentSectionDataArray);
};

export const MessageDetailsFooter = ({
  messageId,
  noticeNumber,
  payeeFiscalCode,
  serviceId
}: MessageDetailsFooterProps) => {
  const serviceMetadata = useIOSelector(state =>
    serviceMetadataByIdSelector(state, serviceId)
  );

  const showMoreSectionData = useMemo(
    () => generateMessageSectionData(messageId, noticeNumber, payeeFiscalCode),
    [messageId, noticeNumber, payeeFiscalCode]
  );

  const theme = useIOTheme();

  return (
    <View
      style={[
        IOStyles.horizontalContentPadding,
        styles.container,
        { backgroundColor: IOColors[theme["appBackground-secondary"]] }
      ]}
    >
      <VSpacer size={16} />
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
