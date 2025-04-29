import {
  ContentWrapper,
  IOColors,
  useIOTheme,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useMemo } from "react";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import I18n from "../../../../i18n";
import { useIOSelector } from "../../../../store/hooks";
import { formatPaymentNoticeNumber } from "../../../payments/common/utils";
import { serviceMetadataByIdSelector } from "../../../services/details/store/reducers";
import { UIMessageId } from "../../types";
import { ContactsListItem } from "./ContactsListItem";
import {
  ShowMoreItems,
  ShowMoreListItem,
  ShowMoreSection
} from "./ShowMoreListItem";

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
    <ContentWrapper
      style={{
        paddingBottom: "75%",
        marginBottom: "-75%",
        backgroundColor: IOColors[theme["appBackground-secondary"]]
      }}
    >
      <VSpacer size={16} />
      {(serviceMetadata?.email || serviceMetadata?.phone) && (
        <ContactsListItem
          email={serviceMetadata.email}
          phone={serviceMetadata.phone}
        />
      )}
      <ShowMoreListItem sections={showMoreSectionData} />
    </ContentWrapper>
  );
};
