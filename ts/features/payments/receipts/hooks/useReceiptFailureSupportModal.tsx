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

  const { receiptPayerFiscalCode = undefined, receiptEventId = undefined } =
    paymentAnalyticsData ?? {};

  const handleCopyAllToClipboard = () => {
    const data = `${I18n.t(
      "wallet.payment.support.errorCode"
    )}: ${faultCodeDetail}
    ${I18n.t("wallet.payment.support.entityCode")}: ${receiptPayerFiscalCode}
    ${I18n.t("wallet.payment.support.entityCode")}: ${receiptEventId}`;

    clipboardSetStringWithFeedback(data);
  };

  const {
    bottomSheet,
    present: presentModal,
    dismiss
  } = useIOBottomSheetModal({
    component: (
      <>
        <ListItemHeader label={I18n.t("wallet.payment.support.supportTitle")} />
        <ListItemAction
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
              onPress: handleCopyAllToClipboard
            }
          }}
        />
        {faultCodeDetail !== "" && (
          <ListItemInfoCopy
            label={I18n.t("wallet.payment.support.errorCode")}
            accessibilityLabel={I18n.t("wallet.payment.support.errorCode")}
            icon="ladybug"
            value={faultCodeDetail}
            onPress={() => clipboardSetStringWithFeedback(faultCodeDetail)}
          />
        )}

        {receiptPayerFiscalCode && (
          <ListItemInfoCopy
            label={I18n.t("wallet.payment.support.entityCode")}
            accessibilityLabel={I18n.t("wallet.payment.support.entityCode")}
            icon="entityCode"
            value={receiptPayerFiscalCode}
            onPress={() =>
              clipboardSetStringWithFeedback(receiptPayerFiscalCode)
            }
          />
        )}
        {receiptEventId && (
          <ListItemInfoCopy
            label={I18n.t("wallet.payment.support.noticeNumber")}
            accessibilityLabel={I18n.t("wallet.payment.support.noticeNumber")}
            icon="entityCode"
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
