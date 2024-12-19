import {
  Body,
  ButtonSolid,
  ContentWrapper,
  H2,
  IOStyles,
  TextInputValidation,
  VSpacer
} from "@pagopa/io-app-design-system";
import { PaymentNoticeNumberFromString } from "@pagopa/io-pagopa-commons/lib/pagopa";
import { useNavigation } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { useState, useRef } from "react";
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
  decodePaymentNoticeNumber,
  validatePaymentNoticeNumber
} from "../../common/utils/validation";
import * as analytics from "../analytics";
import { PaymentsCheckoutRoutes } from "../navigation/routes";
import { trimAndLimitValue } from "../utils";

type InputState = {
  noticeNumberText: string;
  noticeNumber: O.Option<PaymentNoticeNumberFromString>;
};

const MAX_LENGTH_NOTICE_NUMBER = 18;

const WalletPaymentInputNoticeNumberScreen = () => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const [inputState, setInputState] = useState<InputState>({
    noticeNumberText: "",
    noticeNumber: O.none
  });

  const navigateToFiscalCodeInput = () => {
    navigation.navigate(PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_NAVIGATOR, {
      screen: PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_INPUT_FISCAL_CODE,
      params: {
        paymentNoticeNumber: inputState.noticeNumber
      }
    });
  };

  const handleContinueClick = () =>
    pipe(
      inputState.noticeNumber,
      O.fold(() => {
        Keyboard.dismiss();
        focusTextInput();
      }, navigateToFiscalCodeInput)
    );

  const focusTextInput = () => {
    if (O.isNone(inputState.noticeNumber)) {
      setAccessibilityFocus(textInputWrappperRef);
    }
  };

  useOnFirstRender(() => {
    analytics.trackPaymentNoticeDataEntry();
  });

  const textInputWrappperRef = useRef<View>(null);

  return (
    <BaseScreenComponent goBack={true} contextualHelp={emptyContextualHelp}>
      <SafeAreaView style={IOStyles.flex}>
        <View style={{ flex: 1, flexGrow: 1 }}>
          <ContentWrapper>
            <H2>{I18n.t("wallet.payment.manual.noticeNumber.title")}</H2>
            <VSpacer size={16} />
            <Body>{I18n.t("wallet.payment.manual.noticeNumber.subtitle")}</Body>
            <VSpacer size={16} />
            <View accessible ref={textInputWrappperRef}>
              <TextInputValidation
                placeholder={I18n.t(
                  "wallet.payment.manual.noticeNumber.placeholder"
                )}
                accessibilityLabel={I18n.t(
                  "wallet.payment.manual.noticeNumber.placeholder"
                )}
                errorMessage={I18n.t(
                  "wallet.payment.manual.noticeNumber.validationError"
                )}
                value={inputState.noticeNumberText}
                icon="docPaymentCode"
                onChangeText={value => {
                  const normalizedValue = trimAndLimitValue(
                    value,
                    MAX_LENGTH_NOTICE_NUMBER
                  );

                  setInputState({
                    noticeNumberText: normalizedValue,
                    noticeNumber: decodePaymentNoticeNumber(normalizedValue)
                  });
                }}
                counterLimit={
                  inputState.noticeNumberText.length >= MAX_LENGTH_NOTICE_NUMBER
                    ? MAX_LENGTH_NOTICE_NUMBER
                    : undefined
                }
                onValidate={validatePaymentNoticeNumber}
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

export { WalletPaymentInputNoticeNumberScreen };
