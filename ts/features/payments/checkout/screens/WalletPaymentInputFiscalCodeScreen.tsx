import { ButtonSolid, TextInputValidation } from "@pagopa/io-app-design-system";
import {
  PaymentNoticeNumberFromString,
  RptId
} from "@pagopa/io-pagopa-commons/lib/pagopa";
import { OrganizationFiscalCode } from "@pagopa/ts-commons/lib/strings";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { sequenceS } from "fp-ts/lib/Apply";
import * as O from "fp-ts/lib/Option";
import { flow, pipe } from "fp-ts/lib/function";
import { useRef, useState } from "react";
import { InputAccessoryView, Keyboard, Platform, View } from "react-native";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import I18n from "../../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import {
  decodeOrganizationFiscalCode,
  validateOrganizationFiscalCode
} from "../../common/utils/validation";
import * as analytics from "../analytics";
import { usePagoPaPayment } from "../hooks/usePagoPaPayment";
import { PaymentsCheckoutParamsList } from "../navigation/params";
import { TextInputValidationRefProps } from "../types";

export type WalletPaymentInputFiscalCodeScreenNavigationParams = {
  paymentNoticeNumber: O.Option<PaymentNoticeNumberFromString>;
};

type WalletPaymentInputFiscalCodeRouteProps = RouteProp<
  PaymentsCheckoutParamsList,
  "PAYMENT_CHECKOUT_INPUT_FISCAL_CODE"
>;

type InputState = {
  fiscalCodeText: string;
  fiscalCode: O.Option<OrganizationFiscalCode>;
};

const WalletPaymentInputFiscalCodeScreen = () => {
  const { params } = useRoute<WalletPaymentInputFiscalCodeRouteProps>();
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();

  const { startPaymentFlowWithRptId } = usePagoPaPayment();

  const [inputState, setInputState] = useState<InputState>({
    fiscalCodeText: "",
    fiscalCode: O.none
  });

  const textInputWrapperRef = useRef<View>(null);

  const textInputRef = useRef<TextInputValidationRefProps>(null);

  const navigateToTransactionSummary = () => {
    pipe(
      sequenceS(O.Monad)({
        paymentNoticeNumber: params.paymentNoticeNumber,
        organizationFiscalCode: inputState.fiscalCode
      }),
      O.chain(flow(RptId.decode, O.fromEither)),
      O.map((rptId: RptId) => {
        // Removes the manual input screen from the stack
        navigation.popToTop();
        navigation.pop();
        // Navigate to the payment details screen (payment verification)
        startPaymentFlowWithRptId(rptId, {
          onSuccess: "showTransaction",
          startOrigin: "manual_insertion"
        });
      })
    );
  };

  const handleContinueClick = () =>
    pipe(
      inputState.fiscalCode,
      O.fold(() => {
        Keyboard.dismiss();
        textInputRef.current?.validateInput();
      }, navigateToTransactionSummary)
    );

  useOnFirstRender(() => {
    analytics.trackPaymentOrganizationDataEntry();
  });

  return (
    <>
      <IOScrollViewWithLargeHeader
        title={{
          label: I18n.t("wallet.payment.manual.fiscalCode.title")
        }}
        description={I18n.t("wallet.payment.manual.fiscalCode.subtitle")}
        ignoreAccessibilityCheck
        canGoback
        headerActionsProp={{ showHelp: true }}
        contextualHelp={emptyContextualHelp}
        actions={
          Platform.OS === "android"
            ? {
                type: "SingleButton",
                primary: {
                  label: I18n.t("global.buttons.continue"),
                  onPress: handleContinueClick
                }
              }
            : undefined
        }
        ref={textInputWrapperRef}
        includeContentMargins
      >
        <TextInputValidation
          testID="fiscalCodeInput"
          validationMode="onContinue"
          ref={textInputRef}
          placeholder={I18n.t("wallet.payment.manual.fiscalCode.placeholder")}
          accessibilityLabel={I18n.t(
            "wallet.payment.manual.fiscalCode.placeholder"
          )}
          errorMessage={I18n.t(
            "wallet.payment.manual.fiscalCode.validationError"
          )}
          accessibilityErrorLabel={I18n.t(
            "wallet.payment.manual.fiscalCode.a11y"
          )}
          value={inputState.fiscalCodeText}
          icon="fiscalCodeIndividual"
          onChangeText={value =>
            setInputState({
              fiscalCodeText: value,
              fiscalCode: decodeOrganizationFiscalCode(value)
            })
          }
          onValidate={validateOrganizationFiscalCode}
          counterLimit={11}
          textInputProps={{
            keyboardType: "number-pad",
            inputMode: "numeric",
            returnKeyType: "done",
            inputAccessoryViewID: "fiscalCodeInputAccessoryView"
          }}
          autoFocus
        />
      </IOScrollViewWithLargeHeader>
      {Platform.OS === "ios" && (
        <InputAccessoryView nativeID="fiscalCodeInputAccessoryView">
          <View style={{ padding: 20 }}>
            <ButtonSolid
              fullWidth
              label={I18n.t("global.buttons.continue")}
              accessibilityLabel={I18n.t("global.buttons.continue")}
              onPress={handleContinueClick}
            />
          </View>
        </InputAccessoryView>
      )}
    </>
  );
};

export { WalletPaymentInputFiscalCodeScreen };
