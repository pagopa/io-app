import {
  GradientScrollView,
  TextInputValidation,
  VSpacer
} from "@pagopa/io-app-design-system";
import {
  RptId as PagoPaRptId,
  PaymentNoticeNumberFromString,
  RptIdFromString as PagoPaRptIdFromString
} from "@pagopa/io-pagopa-commons/lib/pagopa";
import { useNavigation } from "@react-navigation/native";
import { sequenceS } from "fp-ts/lib/Apply";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { RptId } from "../../../../definitions/pagopa/ecommerce/RptId";
import {
  validateOrganizationFiscalCode,
  validatePaymentNoticeNumber
} from "../../../features/walletV3/common/utils/validation";
import { WalletPaymentRoutes } from "../../../features/walletV3/payment/navigation/routes";
import { walletPaymentInitState } from "../../../features/walletV3/payment/store/actions/orchestration";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";
import I18n from "../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../navigation/params/AppParamsList";
import { useIODispatch } from "../../../store/hooks";

const WalletPaymentPlayground = () => {
  const dispatch = useIODispatch();
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();

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
      sequenceS(E.Monad)({
        paymentNoticeNumber: E.right(paymentNoticeNumber),
        organizationFiscalCode: E.right(organizationFiscalCode)
      }),
      E.chain(PagoPaRptId.decode),
      E.map(setRptId),
      E.getOrElse(() => setRptId(undefined))
    );
  }, [paymentNoticeNumber, organizationFiscalCode]);

  const navigateToWalletPayment = () => {
    pipe(
      rptId,
      O.fromNullable,
      O.map(PagoPaRptIdFromString.encode),
      O.map(rptId => {
        dispatch(walletPaymentInitState());
        navigation.navigate(WalletPaymentRoutes.WALLET_PAYMENT_MAIN, {
          screen: WalletPaymentRoutes.WALLET_PAYMENT_DETAIL,
          params: {
            rptId: rptId as RptId
          }
        });
      })
    );
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
