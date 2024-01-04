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

  const contentComponent = (
    <>
      <ListItemHeader label="Contatta l'assistenza" />
      <ListItemAction
        label="Chiama 06.4520.2323"
        accessibilityLabel="Chiama 06.4520.2323"
        onPress={() => Linking.openURL(`tel:0645202323`)}
        variant="primary"
        icon="phone"
      />
      <ListItemAction
        label="Chiedi aiuto in chat"
        accessibilityLabel="Chiedi aiuto in chat"
        onPress={() => {
          // TODO add chat request
        }}
        variant="primary"
        icon="chat"
      />
      <VSpacer size={24} />
      <ListItemHeader label="Dati aggiuntivi" />
      <ListItemInfoCopy
        label="Codice errore"
        accessibilityLabel="Codice errore"
        icon="ladybug"
        value={failure.faultCodeDetail}
        onPress={() => clipboardSetStringWithFeedback(failure.faultCodeDetail)}
      />
      <ListItemInfoCopy
        label="Codice avviso"
        accessibilityLabel="Codice avviso"
        icon="docPaymentCode"
        value={formattedPaymentNoticeNumber}
        onPress={() => clipboardSetStringWithFeedback(paymentNoticeNumber)}
      />
      <ListItemInfoCopy
        label="Codice Fiscale Ente"
        accessibilityLabel="Codice Fiscale Ente"
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
