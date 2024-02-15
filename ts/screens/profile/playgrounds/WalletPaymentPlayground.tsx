import {
  GradientScrollView,
  TextInputValidation,
  VSpacer
} from "@pagopa/io-app-design-system";
import {
  RptId as PagoPaRptId,
  RptIdFromString as PagoPaRptIdFromString,
  PaymentNoticeNumberFromString
} from "@pagopa/io-pagopa-commons/lib/pagopa";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import {
  validateOrganizationFiscalCode,
  validatePaymentNoticeNumber
} from "../../../features/walletV3/common/utils/validation";
import { usePagoPaPayment } from "../../../features/walletV3/payment/hooks/usePagoPaPayment";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";
import I18n from "../../../i18n";

const WalletPaymentPlayground = () => {
  const { startPaymentFlowWithData } = usePagoPaPayment();

  const [rptId, setRptId] = React.useState<PagoPaRptId>();
  const [paymentNoticeNumber, setPaymentNoticeNumber] =
    React.useState<string>("");
  const [organizationFiscalCode, setOrganizationFiscalCode] =
    React.useState<string>("");

  React.useEffect(() => {
    pipe(
      rptId,
      PagoPaRptIdFromString.decode,
      E.map(rptId => {
        setPaymentNoticeNumber(
          PaymentNoticeNumberFromString.encode(rptId.paymentNoticeNumber)
        );
        setOrganizationFiscalCode(rptId.organizationFiscalCode);
      })
    );
  }, [rptId]);

  React.useEffect(() => {
    pipe(
      PagoPaRptId.decode({ paymentNoticeNumber, organizationFiscalCode }),
      E.map(setRptId),
      E.getOrElse(() => setRptId(undefined))
    );
  }, [paymentNoticeNumber, organizationFiscalCode]);

  const navigateToWalletPayment = () => {
    startPaymentFlowWithData({
      paymentNoticeNumber,
      organizationFiscalCode
    });
  };

  const generateValidRandomRptId = () => {
    pipe(
      "00000123456002160020399398578",
      PagoPaRptIdFromString.decode,
      E.map(setRptId)
    );
  };

  useHeaderSecondLevel({ title: "Payment playground" });

  return (
    <GradientScrollView
      primaryActionProps={{
        label: "Continua",
        accessibilityLabel: "Continue",
        onPress: navigateToWalletPayment,
        disabled: rptId === undefined
      }}
      secondaryActionProps={{
        label: "RptId casuale",
        accessibilityLabel: "RptIt casuale",
        onPress: generateValidRandomRptId
      }}
    >
      <VSpacer size={24} />
      <TextInputValidation
        placeholder={I18n.t("wallet.payment.manual.noticeNumber.placeholder")}
        accessibilityLabel={I18n.t(
          "wallet.payment.manual.noticeNumber.placeholder"
        )}
        value={paymentNoticeNumber}
        icon="docPaymentCode"
        onChangeText={setPaymentNoticeNumber}
        onValidate={validatePaymentNoticeNumber}
        counterLimit={18}
        textInputProps={{
          keyboardType: "number-pad",
          inputMode: "numeric",
          returnKeyType: "done"
        }}
      />
      <VSpacer size={8} />
      <TextInputValidation
        placeholder={I18n.t("wallet.payment.manual.fiscalCode.placeholder")}
        accessibilityLabel={I18n.t(
          "wallet.payment.manual.fiscalCode.placeholder"
        )}
        value={organizationFiscalCode}
        icon="fiscalCodeIndividual"
        onChangeText={setOrganizationFiscalCode}
        onValidate={validateOrganizationFiscalCode}
        counterLimit={11}
        textInputProps={{
          keyboardType: "number-pad",
          inputMode: "numeric",
          returnKeyType: "done"
        }}
      />
    </GradientScrollView>
  );
};

export { WalletPaymentPlayground };
