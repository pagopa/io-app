import {
  ListItemAction,
  ListItemHeader,
  ListItemInfoCopy,
  VSpacer
} from "@pagopa/io-app-design-system";
import {
  PaymentNoticeNumberFromString,
  RptIdFromString
} from "@pagopa/io-pagopa-commons/lib/pagopa";
import { OrganizationFiscalCode } from "@pagopa/ts-commons/lib/strings";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { Linking } from "react-native";
import { ToolEnum } from "../../../../../definitions/content/AssistanceToolConfig";
import { RptId } from "../../../../../definitions/pagopa/ecommerce/RptId";
import I18n from "../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { assistanceToolConfigSelector } from "../../../../store/reducers/backendStatus";
import { clipboardSetStringWithFeedback } from "../../../../utils/clipboard";
import { useIOBottomSheetAutoresizableModal } from "../../../../utils/hooks/bottomSheet";
import {
  addTicketCustomField,
  assistanceToolRemoteConfig,
  resetCustomFields,
  zendeskCategoryId,
  zendeskPaymentCategory,
  zendeskPaymentFailure,
  zendeskPaymentNav,
  zendeskPaymentOrgFiscalCode
} from "../../../../utils/supportAssistance";
import {
  zendeskSelectedCategory,
  zendeskSupportStart
} from "../../../zendesk/store/actions";
import { WalletPaymentFailure } from "../types/failure";

type PaymentFailureSupportModalParams = {
  rptId?: RptId;
  failure: WalletPaymentFailure;
};

type PaymentFailureSupportModal = {
  bottomSheet: JSX.Element;
  present: () => void;
};

const usePaymentFailureSupportModal = ({
  rptId,
  failure
}: PaymentFailureSupportModalParams): PaymentFailureSupportModal => {
  const { faultCodeDetail } = failure;

  const assistanceToolConfig = useIOSelector(assistanceToolConfigSelector);
  const choosenTool = assistanceToolRemoteConfig(assistanceToolConfig);
  const dispatch = useIODispatch();

  const zendeskAssistanceLogAndStart = () => {
    resetCustomFields();
    addTicketCustomField(zendeskCategoryId, zendeskPaymentCategory.value);
    addTicketCustomField(zendeskPaymentOrgFiscalCode, organizationFiscalCode);
    addTicketCustomField(zendeskPaymentNav, paymentNoticeNumber);
    addTicketCustomField(zendeskPaymentFailure, faultCodeDetail);
    // addTicketCustomField(zendeskPaymentStartOrigin, "n/a"); // TODO track payment start origin
    // appendLog(getPaymentHistoryDetails(payment)); // TODO track payment details
    dispatch(
      zendeskSupportStart({
        startingRoute: "n/a",
        assistanceForPayment: false,
        assistanceForCard: false,
        assistanceForFci: true
      })
    );
    dispatch(zendeskSelectedCategory(zendeskPaymentCategory));
  };

  const handleAskAssistance = () => {
    switch (choosenTool) {
      case ToolEnum.zendesk:
        zendeskAssistanceLogAndStart();
        break;
    }
  };

  const paymentNoticeNumber = pipe(
    rptId,
    RptIdFromString.decode,
    O.fromEither,
    O.map(({ paymentNoticeNumber }) => paymentNoticeNumber),
    O.map(PaymentNoticeNumberFromString.encode),
    O.getOrElse(() => "")
  );

  const formattedPaymentNoticeNumber = paymentNoticeNumber
    .replace(/(\d{4})/g, "$1  ")
    .trim();

  const organizationFiscalCode = pipe(
    rptId,
    RptIdFromString.decode,
    O.fromEither,
    O.map(({ organizationFiscalCode }) => organizationFiscalCode),
    O.map(OrganizationFiscalCode.encode),
    O.getOrElse(() => "")
  );

  const handleCopyAllToClipboard = () => {
    // prettier-ignore
    const data = `${I18n.t("wallet.payment.support.errorCode")}: ${faultCodeDetail}
    ${I18n.t("wallet.payment.support.noticeNumber")}: ${paymentNoticeNumber}
    ${I18n.t("wallet.payment.support.entityCode")}: ${organizationFiscalCode}`;
    clipboardSetStringWithFeedback(data);
  };

  const { bottomSheet, present, dismiss } = useIOBottomSheetAutoresizableModal({
    component: (
      <>
        <ListItemHeader label={I18n.t("wallet.payment.support.supportTitle")} />
        <ListItemAction
          label={I18n.t("wallet.payment.support.phone", {
            phoneNumber: "06.4520.2323"
          })}
          accessibilityLabel={I18n.t("wallet.payment.support.phone", {
            phoneNumber: "06.4520.2323"
          })}
          onPress={() => Linking.openURL(`tel:0645202323`)}
          variant="primary"
          icon="phone"
        />
        <ListItemAction
          label={I18n.t("wallet.payment.support.chat")}
          accessibilityLabel={I18n.t("wallet.payment.support.chat")}
          onPress={() => {
            dismiss();
            handleAskAssistance();
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
        <ListItemInfoCopy
          label={I18n.t("wallet.payment.support.errorCode")}
          accessibilityLabel={I18n.t("wallet.payment.support.errorCode")}
          icon="ladybug"
          value={faultCodeDetail}
          onPress={() => clipboardSetStringWithFeedback(faultCodeDetail)}
        />
        <ListItemInfoCopy
          label={I18n.t("wallet.payment.support.noticeNumber")}
          accessibilityLabel={I18n.t("wallet.payment.support.noticeNumber")}
          icon="docPaymentCode"
          value={formattedPaymentNoticeNumber}
          onPress={() => clipboardSetStringWithFeedback(paymentNoticeNumber)}
        />
        <ListItemInfoCopy
          label={I18n.t("wallet.payment.support.entityCode")}
          accessibilityLabel={I18n.t("wallet.payment.support.entityCode")}
          icon="entityCode"
          value={organizationFiscalCode}
          onPress={() => clipboardSetStringWithFeedback(organizationFiscalCode)}
        />
        <VSpacer size={24} />
      </>
    ),
    title: ""
  });

  return {
    bottomSheet,
    present
  };
};

export { usePaymentFailureSupportModal };
