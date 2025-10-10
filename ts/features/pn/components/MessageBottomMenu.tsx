import {
  IOColors,
  IOVisualCostants,
  useIOTheme
} from "@pagopa/io-app-design-system";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import I18n from "i18next";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { NotificationPaymentInfo } from "../../../../definitions/pn/NotificationPaymentInfo";
import { NotificationStatusHistory } from "../../../../definitions/pn/NotificationStatusHistory";
import { useIOSelector } from "../../../store/hooks";
import { ContactsListItem } from "../../messages/components/MessageDetail/ContactsListItem";
import {
  ShowMoreListItem,
  ShowMoreSection
} from "../../messages/components/MessageDetail/ShowMoreListItem";
import { formatPaymentNoticeNumber } from "../../payments/common/utils";
import { serviceMetadataByIdSelector } from "../../services/details/store/selectors";
import { TimelineListItem } from "./TimelineListItem";

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
  isAARMessage: boolean;
  isCancelled?: boolean;
  iun: string;
  messageId: string;
  paidNoticeCodes?: ReadonlyArray<string>;
  payments?: ReadonlyArray<NotificationPaymentInfo>;
  serviceId: ServiceId;
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
  isAARMessage,
  iun,
  messageId,
  paidNoticeCodes,
  payments,
  serviceId
}: MessageBottomMenuProps) => {
  const theme = useIOTheme();

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
    <View
      style={[
        styles.container,
        { backgroundColor: IOColors[theme["appBackground-secondary"]] }
      ]}
    >
      <TimelineListItem hideFooter={isAARMessage} history={history} />
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
