import React from "react";
import {
  Divider,
  ListItemAction,
  ListItemHeader,
  ListItemInfoCopy
} from "@pagopa/io-app-design-system";
import I18n from "../../../../i18n";
import { UIMessageId } from "../../types";
import { useIOBottomSheetAutoresizableModal } from "../../../../utils/hooks/bottomSheet";
import { clipboardSetStringWithFeedback } from "../../../../utils/clipboard";
import { formatPaymentNoticeNumber } from "../../../payments/common/utils";

type ShowMoreListItemProps = {
  messageId: UIMessageId;
  noticeNumber?: string;
  payeeFiscalCode?: string;
};

export const ShowMoreListItem = ({
  messageId,
  noticeNumber,
  payeeFiscalCode
}: ShowMoreListItemProps) => {
  const hasPaymentData = noticeNumber || payeeFiscalCode;
  const { bottomSheet, present } = useIOBottomSheetAutoresizableModal(
    {
      component: (
        <>
          <ListItemHeader label={I18n.t("messageDetails.headerTitle")} />
          <ListItemInfoCopy
            value={messageId}
            label={I18n.t("messageDetails.showMoreDataBottomSheet.messageId")}
            accessibilityLabel={I18n.t(
              "messageDetails.showMoreDataBottomSheet.messageIdAccessibility"
            )}
            icon="docPaymentTitle"
            onPress={() => clipboardSetStringWithFeedback(messageId)}
          />
          {hasPaymentData && (
            <>
              <ListItemHeader
                label={I18n.t(
                  "messageDetails.showMoreDataBottomSheet.pagoPAHeader"
                )}
              />
              {noticeNumber && (
                <ListItemInfoCopy
                  value={formatPaymentNoticeNumber(noticeNumber)}
                  label={I18n.t(
                    "messageDetails.showMoreDataBottomSheet.noticeCode"
                  )}
                  accessibilityLabel={I18n.t(
                    "messageDetails.showMoreDataBottomSheet.noticeCodeAccessibility"
                  )}
                  icon="docPaymentCode"
                  onPress={() => clipboardSetStringWithFeedback(noticeNumber)}
                />
              )}
              {noticeNumber && payeeFiscalCode && <Divider />}
              {payeeFiscalCode && (
                <ListItemInfoCopy
                  value={payeeFiscalCode}
                  label={I18n.t(
                    "messageDetails.showMoreDataBottomSheet.entityFiscalCode"
                  )}
                  accessibilityLabel={I18n.t(
                    "messageDetails.showMoreDataBottomSheet.entityFiscalCodeAccessibility"
                  )}
                  icon="entityCode"
                  onPress={() =>
                    clipboardSetStringWithFeedback(payeeFiscalCode)
                  }
                />
              )}
            </>
          )}
        </>
      ),
      title: I18n.t("messageDetails.showMoreDataBottomSheet.title")
    },
    100
  );

  return (
    <>
      <ListItemAction
        accessibilityLabel={I18n.t("messageDetails.footer.showMoreData")}
        icon="terms"
        label={I18n.t("messageDetails.footer.showMoreData")}
        onPress={present}
        testID="show-more-data-action"
        variant="primary"
      />
      {bottomSheet}
    </>
  );
};
