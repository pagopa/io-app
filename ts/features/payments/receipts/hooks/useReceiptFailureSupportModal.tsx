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
  zendeskCategoryId,
  zendeskIdPayCategoryId
} from "../../../../utils/supportAssistance";
import {
  zendeskSelectedCategory,
  zendeskSupportStart
} from "../../../zendesk/store/actions";
import { paymentAnalyticsDataSelector } from "../../history/store/selectors";
import { ReceiptDownloadFailure } from "../types";

type IDPayFailureSupportModal = {
  bottomSheet: JSX.Element;
  present: () => void;
};

const useReceiptFailureSupportModal = (
  error: NetworkError | ReceiptDownloadFailure | undefined
): IDPayFailureSupportModal => {
  const dispatch = useIODispatch();

  const getFaultCodeDetail = (): string =>
    error && "code" in error ? error?.code ?? "" : "";

  const faultCodeDetail = getFaultCodeDetail();

  const zendeskAssistanceLogAndStart = () => {
    resetCustomFields();
    // attach the main zendesk category to the ticket
    addTicketCustomField(
      zendeskIdPayCategoryId,
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
          testID="receipt-failure-support-modal-contact-support-button"
          label={I18n.t("wallet.payment.support.chat")}
          accessibilityLabel={I18n.t("wallet.payment.support.chat")}
          onPress={() => {
            dismiss();
            zendeskAssistanceLogAndStart();
          }}
          variant="primary"
          icon="chat"
        />
        <VSpacer size={24} />
        <ListItemHeader
          label={I18n.t("wallet.payment.support.additionalDataTitle")}
          endElement={{
            type: "buttonLink",
            componentProps: {
              label: I18n.t("wallet.payment.support.copyAll"),
              onPress: handleCopyAllToClipboard,
              testID: "receipt-failure-support-modal-copy-all-button"
            }
          }}
        />
        {faultCodeDetail !== "" && (
          <ListItemInfoCopy
            testID="receipt-failure-support-modal-fault-code"
            label={I18n.t("wallet.payment.support.errorCode")}
            accessibilityLabel={I18n.t("wallet.payment.support.errorCode")}
            icon="ladybug"
            value={faultCodeDetail}
            onPress={() => clipboardSetStringWithFeedback(faultCodeDetail)}
          />
        )}
        {receiptEventId && (
          <ListItemInfoCopy
            testID="receipt-failure-support-modal-transaction-id"
            label={I18n.t("transaction.details.info.transactionId")}
            accessibilityLabel={I18n.t(
              "transaction.details.info.transactionId"
            )}
            icon="transactions"
            value={receiptEventId}
            onPress={() => clipboardSetStringWithFeedback(receiptEventId)}
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
