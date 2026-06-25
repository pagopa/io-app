import {
  ListItemAction,
  ListItemHeader,
  ListItemInfoCopy,
  VSpacer
} from "@pagopa/io-app-design-system";
import {
  addTicketCustomField,
  resetCustomFields
} from "@pagopa/io-react-native-zendesk";
import I18n from "i18next";
import { JSX } from "react";

import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { clipboardSetStringWithFeedback } from "../../../../utils/clipboard";
import { NetworkError } from "../../../../utils/errors";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import {
  defaultZendeskBonusesCategory,
  defaultZendeskIDPayCategory,
  zendeskBonusAndInitiativeCategoryId,
  zendeskCategoryId
} from "../../../../utils/supportAssistance";
import {
  zendeskSelectedCategory,
  zendeskSupportStart
} from "../../../zendesk/store/actions";
import { paymentAnalyticsDataSelector } from "../../history/store/selectors";
import { ReceiptDownloadFailure } from "../types";

type Props = {
  bottomSheet: JSX.Element;
  present: () => void;
};

const useReceiptFailureSupportModal = (
  error: NetworkError | ReceiptDownloadFailure | undefined
): Props => {
  const dispatch = useIODispatch();

  const getFaultCodeDetail = (): string =>
    error && "code" in error ? (error?.code ?? "") : "";

  const faultCodeDetail = getFaultCodeDetail();

  const zendeskAssistanceLogAndStart = () => {
    resetCustomFields();
    // attach the main zendesk category to the ticket
    addTicketCustomField(
      zendeskBonusAndInitiativeCategoryId,
      defaultZendeskIDPayCategory.value
    );

    addTicketCustomField(
      zendeskCategoryId,
      defaultZendeskBonusesCategory.value
    );

    dispatch(
      zendeskSupportStart({
        startingRoute: "n/a",
        assistanceType: {}
      })
    );
    dispatch(zendeskSelectedCategory(defaultZendeskIDPayCategory));
  };

  const paymentAnalyticsData = useIOSelector(paymentAnalyticsDataSelector);

  const { receiptEventId = undefined } = paymentAnalyticsData ?? {};

  const handleCopyAllToClipboard = () => {
    const data = `${I18n.t(
      "wallet.payment.support.errorCode"
    )}: ${faultCodeDetail}
    ${I18n.t("transaction.details.info.transactionId")}: ${receiptEventId}`;

    clipboardSetStringWithFeedback(data);
  };

  const {
    bottomSheet,
    present: presentModal,
    dismiss
  } = useIOBottomSheetModal({
    component: (
      <>
        <ListItemHeader
          label={I18n.t("wallet.payment.support.supportTitle")}
          testID="receipt-failure-support-modal-header"
        />
        <ListItemAction
          accessibilityLabel={I18n.t("wallet.payment.support.chat")}
          icon="chat"
          label={I18n.t("wallet.payment.support.chat")}
          onPress={() => {
            dismiss();
            zendeskAssistanceLogAndStart();
          }}
          testID="receipt-failure-support-modal-contact-support-button"
          variant="primary"
        />
        <VSpacer size={24} />
        <ListItemHeader
          endElement={{
            type: "buttonLink",
            componentProps: {
              label: I18n.t("wallet.payment.support.copyAll"),
              onPress: handleCopyAllToClipboard,
              testID: "receipt-failure-support-modal-copy-all-button"
            }
          }}
          label={I18n.t("wallet.payment.support.additionalDataTitle")}
        />
        {faultCodeDetail !== "" && (
          <ListItemInfoCopy
            accessibilityLabel={I18n.t("wallet.payment.support.errorCode")}
            icon="ladybug"
            label={I18n.t("wallet.payment.support.errorCode")}
            onPress={() => clipboardSetStringWithFeedback(faultCodeDetail)}
            testID="receipt-failure-support-modal-fault-code"
            value={faultCodeDetail}
          />
        )}
        {receiptEventId && (
          <ListItemInfoCopy
            accessibilityLabel={I18n.t(
              "transaction.details.info.transactionId"
            )}
            icon="transactions"
            label={I18n.t("transaction.details.info.transactionId")}
            onPress={() => clipboardSetStringWithFeedback(receiptEventId)}
            testID="receipt-failure-support-modal-transaction-id"
            value={receiptEventId}
          />
        )}
        <VSpacer size={24} />
      </>
    ),
    title: ""
  });

  const present = () => {
    presentModal();
  };

  return {
    bottomSheet,
    present
  };
};

export default useReceiptFailureSupportModal;
