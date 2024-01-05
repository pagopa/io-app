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
import { RptId } from "../../../../../definitions/pagopa/ecommerce/RptId";
import { clipboardSetStringWithFeedback } from "../../../../utils/clipboard";
import { useIOBottomSheetAutoresizableModal } from "../../../../utils/hooks/bottomSheet";
import { WalletPaymentFailure } from "../types/failure";
import I18n from "../../../../i18n";

type PaymentFailureSupportModalParams = {
  rptId: RptId;
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
    const formattedData = `
    ${I18n.t("wallet.payment.support.errorCode")}: ${failure.faultCodeDetail}\n
    ${I18n.t("wallet.payment.support.noticeNumber")}: ${paymentNoticeNumber}\n
    ${I18n.t("wallet.payment.support.entityCode")}: ${organizationFiscalCode}
    `;
    clipboardSetStringWithFeedback(formattedData);
  };

  const contentComponent = (
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
          // TODO add chat request
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
        value={failure.faultCodeDetail}
        onPress={() => clipboardSetStringWithFeedback(failure.faultCodeDetail)}
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
  );

  const { bottomSheet, present } = useIOBottomSheetAutoresizableModal({
    component: contentComponent,
    title: ""
  });

  return {
    bottomSheet,
    present
  };
};

export { usePaymentFailureSupportModal };
