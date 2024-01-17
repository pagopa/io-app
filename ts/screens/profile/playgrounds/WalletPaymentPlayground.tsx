import {
  GradientScrollView,
  TextInputValidation,
  VSpacer
} from "@pagopa/io-app-design-system";
import {
  PaymentNoticeNumber,
  PaymentNoticeNumberFromString,
  RptIdFromString
} from "@pagopa/io-pagopa-commons/lib/pagopa";
import { OrganizationFiscalCode } from "@pagopa/ts-commons/lib/strings";
import { useNavigation } from "@react-navigation/native";
import { sequenceS } from "fp-ts/lib/Apply";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { flow, pipe } from "fp-ts/lib/function";
import React from "react";
import { RptId } from "../../../../definitions/pagopa/ecommerce/RptId";
import {
  decodeOrganizationFiscalCode,
  decodePaymentNoticeNumber,
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

type RptIdInputState = { input: string; value: O.Option<RptId> };
type PaymentNoticeNumberInputState = {
  input: string;
  value: O.Option<PaymentNoticeNumber>;
};
type OrganizationFiscalCodeInputState = {
  input: string;
  value: O.Option<OrganizationFiscalCode>;
};

const INITIAL_INPUT_STATE = {
  input: "",
  value: O.none
};

const WalletPaymentPlayground = () => {
  const dispatch = useIODispatch();
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();

  const [rptId, setRptId] =
    React.useState<RptIdInputState>(INITIAL_INPUT_STATE);
  const [paymentNoticeNumber, setPaymentNoticeNumber] =
    React.useState<PaymentNoticeNumberInputState>(INITIAL_INPUT_STATE);
  const [organizationFiscalCode, setOrganizationFiscalCode] =
    React.useState<OrganizationFiscalCodeInputState>(INITIAL_INPUT_STATE);

  React.useEffect(() => {
    pipe(
      rptId.input,
      RptIdFromString.decode,
      E.map(rptId => {
        setPaymentNoticeNumber({
          input: PaymentNoticeNumberFromString.encode(
            rptId.paymentNoticeNumber
          ),
          value: O.some(rptId.paymentNoticeNumber)
        });
        setOrganizationFiscalCode({
          input: rptId.organizationFiscalCode,
          value: O.some(rptId.organizationFiscalCode)
        });
      })
    );
  }, [rptId]);

  React.useEffect(() => {
    pipe(
      sequenceS(O.Monad)({
        paymentNoticeNumber: paymentNoticeNumber.value,
        organizationFiscalCode: organizationFiscalCode.value
      }),
      O.chain(flow(RptId.decode, O.fromEither)),
      O.map(rptId => {
        setRptId({ input: rptId, value: O.some(rptId) });
      })
    );
  }, [paymentNoticeNumber, organizationFiscalCode]);

  const navigateToWalletPayment = () => {
    pipe(
      rptId.value,
      O.map(rptId => {
        dispatch(walletPaymentInitState());
        navigation.navigate(WalletPaymentRoutes.WALLET_PAYMENT_MAIN, {
          screen: WalletPaymentRoutes.WALLET_PAYMENT_DETAIL,
          params: {
            rptId
          }
        });
      })
    );
  };

  const generateValidRandomRptId = () => {
    setRptId({
      input: "00000123456002160020399398578",
      value: O.some("00000123456002160020399398578" as RptId)
    });
  };

  useHeaderSecondLevel({ title: "Payment playground" });

  return (
    <GradientScrollView
      primaryActionProps={{
        label: "Continua",
        accessibilityLabel: "Continue",
        onPress: navigateToWalletPayment,
        disabled: O.isNone(rptId.value)
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
        value={paymentNoticeNumber.input}
        icon="docPaymentCode"
        onChangeText={value =>
          setPaymentNoticeNumber({
            input: value,
            value: decodePaymentNoticeNumber(value)
          })
        }
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
        value={organizationFiscalCode.input}
        icon="fiscalCodeIndividual"
        onChangeText={value =>
          setOrganizationFiscalCode({
            input: value,
            value: decodeOrganizationFiscalCode(value)
          })
        }
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
