import {
  Body,
  ButtonSolid,
  ContentWrapper,
  H2,
  IOStyles,
  TextInputValidation,
  VSpacer
} from "@pagopa/io-app-design-system";
import {
  PaymentNoticeNumberFromString,
  RptId
} from "@pagopa/io-pagopa-commons/lib/pagopa";
import { OrganizationFiscalCode } from "@pagopa/ts-commons/lib/strings";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { sequenceS } from "fp-ts/lib/Apply";
import * as O from "fp-ts/lib/Option";
import { flow, pipe } from "fp-ts/lib/function";
import React from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  View
} from "react-native";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import themeVariables from "../../../../theme/variables";
import { setAccessibilityFocus } from "../../../../utils/accessibility";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import {
  decodeOrganizationFiscalCode,
  validateOrganizationFiscalCode
} from "../../common/utils/validation";
import * as analytics from "../analytics";
import { usePagoPaPayment } from "../hooks/usePagoPaPayment";
import { PaymentsCheckoutParamsList } from "../navigation/params";

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

  const [inputState, setInputState] = React.useState<InputState>({
    fiscalCodeText: "",
    fiscalCode: O.none
  });

  const textInputWrappperRef = React.useRef<View>(null);
  const focusTextInput = () => {
    setAccessibilityFocus(textInputWrappperRef);
  };

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
        focusTextInput();
      }, navigateToTransactionSummary)
    );

  useOnFirstRender(() => {
    analytics.trackPaymentOrganizationDataEntry();
  });

  return (
    <BaseScreenComponent goBack={true} contextualHelp={emptyContextualHelp}>
      <SafeAreaView style={IOStyles.flex}>
        <View style={{ flex: 1, flexGrow: 1 }}>
          <ContentWrapper>
            <H2>{I18n.t("wallet.payment.manual.fiscalCode.title")}</H2>
            <VSpacer size={16} />
            <Body>{I18n.t("wallet.payment.manual.fiscalCode.subtitle")}</Body>
            <VSpacer size={16} />
            <View accessible ref={textInputWrappperRef}>
              <TextInputValidation
                placeholder={I18n.t(
                  "wallet.payment.manual.fiscalCode.placeholder"
                )}
                accessibilityLabel={I18n.t(
                  "wallet.payment.manual.fiscalCode.placeholder"
                )}
                errorMessage={I18n.t(
                  "wallet.payment.manual.fiscalCode.validationError"
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
                  returnKeyType: "done"
                }}
                autoFocus
              />
            </View>
          </ContentWrapper>
        </View>
        <KeyboardAvoidingView
          behavior={Platform.OS === "android" ? undefined : "padding"}
          keyboardVerticalOffset={Platform.select({
            ios: 110 + 16,
            android: themeVariables.contentPadding
          })}
        >
          <ContentWrapper>
            <ButtonSolid
              label="Continua"
              accessibilityLabel="Continua"
              onPress={handleContinueClick}
              fullWidth={true}
            />
            <VSpacer size={16} />
          </ContentWrapper>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export { WalletPaymentInputFiscalCodeScreen };
