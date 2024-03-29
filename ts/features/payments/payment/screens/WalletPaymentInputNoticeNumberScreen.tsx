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
import themeVariables from "../../../../theme/variables";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import {
  decodePaymentNoticeNumber,
  validatePaymentNoticeNumber
} from "../../common/utils/validation";
import { WalletPaymentRoutes } from "../navigation/routes";

type InputState = {
  noticeNumberText: string;
  noticeNumber: O.Option<PaymentNoticeNumberFromString>;
};

const WalletPaymentInputNoticeNumberScreen = () => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const [inputState, setInputState] = React.useState<InputState>({
    noticeNumberText: "",
    noticeNumber: O.none
  });

  const navigateToFiscalCodeInput = () =>
    navigation.navigate(WalletPaymentRoutes.WALLET_PAYMENT_MAIN, {
      screen: WalletPaymentRoutes.WALLET_PAYMENT_INPUT_FISCAL_CODE,
      params: {
        paymentNoticeNumber: inputState.noticeNumber
      }
    });

  const handleContinueClick = () =>
    pipe(
      inputState.noticeNumber,
      O.fold(() => {
        Keyboard.dismiss();
        focusTextInput();
      }, navigateToFiscalCodeInput)
    );

  const focusTextInput = () => {
    const textInputA11yWrapper = findNodeHandle(textInputWrappperRef.current);
    if (textInputA11yWrapper && O.isNone(inputState.noticeNumber)) {
      AccessibilityInfo.setAccessibilityFocus(textInputA11yWrapper);
    }
  };

  const textInputWrappperRef = React.useRef<View>(null);

  return (
    <BaseScreenComponent goBack={true} contextualHelp={emptyContextualHelp}>
      <SafeAreaView style={IOStyles.flex}>
        <View style={{ flex: 1, flexGrow: 1 }}>
          <ContentWrapper>
            <H2>{I18n.t("wallet.payment.manual.noticeNumber.title")}</H2>
            <VSpacer size={16} />
            <Body>{I18n.t("wallet.payment.manual.noticeNumber.subtitle")}</Body>
            <VSpacer size={16} />
            <View ref={textInputWrappperRef}>
              <TextInputValidation
                placeholder={I18n.t(
                  "wallet.payment.manual.noticeNumber.placeholder"
                )}
                accessibilityLabel={I18n.t(
                  "wallet.payment.manual.noticeNumber.placeholder"
                )}
                value={inputState.noticeNumberText}
                icon="docPaymentCode"
                onChangeText={value =>
                  setInputState({
                    noticeNumberText: value,
                    noticeNumber: decodePaymentNoticeNumber(value)
                  })
                }
                onValidate={validatePaymentNoticeNumber}
                counterLimit={18}
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
