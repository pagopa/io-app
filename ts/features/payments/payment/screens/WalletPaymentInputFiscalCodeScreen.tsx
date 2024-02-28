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
  AmountInEuroCents,
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
  AccessibilityInfo,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  View,
  findNodeHandle
} from "react-native";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../navigation/routes";
import { paymentInitializeState } from "../../../../store/actions/wallet/payment";
import { useIODispatch } from "../../../../store/hooks";
import themeVariables from "../../../../theme/variables";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import {
  decodeOrganizationFiscalCode,
  validateOrganizationFiscalCode
} from "../../common/utils/validation";
import { WalletPaymentParamsList } from "../navigation/params";

export type WalletPaymentInputFiscalCodeScreenNavigationParams = {
  paymentNoticeNumber: O.Option<PaymentNoticeNumberFromString>;
};

type WalletPaymentInputFiscalCodeRouteProps = RouteProp<
  WalletPaymentParamsList,
  "WALLET_PAYMENT_INPUT_FISCAL_CODE"
>;

type InputState = {
  fiscalCodeText: string;
  fiscalCode: O.Option<OrganizationFiscalCode>;
};

const WalletPaymentInputFiscalCodeScreen = () => {
  const { params } = useRoute<WalletPaymentInputFiscalCodeRouteProps>();
  const dispatch = useIODispatch();
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const [inputState, setInputState] = React.useState<InputState>({
    fiscalCodeText: "",
    fiscalCode: O.none
  });

  const textInputWrappperRef = React.useRef<View>(null);
  // ---------------------- handlers
  const focusTextInput = () => {
    const textInputA11yWrapper = findNodeHandle(textInputWrappperRef.current);
    if (textInputA11yWrapper) {
      AccessibilityInfo.setAccessibilityFocus(textInputA11yWrapper);
    }
  };
  const navigateToTransactionSummary = () => {
    pipe(
      sequenceS(O.Monad)({
        paymentNoticeNumber: params.paymentNoticeNumber,
        organizationFiscalCode: inputState.fiscalCode
      }),
      O.chain(flow(RptId.decode, O.fromEither)),
      O.map(rptId => {
        dispatch(paymentInitializeState());
        navigation.navigate(ROUTES.WALLET_NAVIGATOR, {
          screen: ROUTES.PAYMENT_TRANSACTION_SUMMARY,
          params: {
            // Set the initial amount to a fixed value (1) because it is not used
            initialAmount: "1" as AmountInEuroCents,
            rptId,
            paymentStartOrigin: "manual_insertion"
          }
        });
      })
    );
  };

  const handleContinueClick = () =>
    O.fold(
      () => {
        Keyboard.dismiss();
        focusTextInput();
      },
      _some => navigateToTransactionSummary()
    )(inputState.fiscalCode);

  // -------------------- render

  return (
    <BaseScreenComponent goBack={true} contextualHelp={emptyContextualHelp}>
      <SafeAreaView style={IOStyles.flex}>
        <View style={{ flex: 1, flexGrow: 1 }}>
          <ContentWrapper>
            <H2>{I18n.t("wallet.payment.manual.fiscalCode.title")}</H2>
            <VSpacer size={16} />
            <Body>{I18n.t("wallet.payment.manual.fiscalCode.subtitle")}</Body>
            <VSpacer size={16} />
            <View ref={textInputWrappperRef}>
              <TextInputValidation
                placeholder={I18n.t(
                  "wallet.payment.manual.fiscalCode.placeholder"
                )}
                accessibilityLabel={I18n.t(
                  "wallet.payment.manual.fiscalCode.placeholder"
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
