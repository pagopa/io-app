import { IOButton, TextInputValidation } from "@pagopa/io-app-design-system";
import { PaymentNoticeNumberFromString } from "@pagopa/io-pagopa-commons/lib/pagopa";
import { useNavigation } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { useRef, useState } from "react";
import { InputAccessoryView, Keyboard, Platform, View } from "react-native";
import I18n from "i18next";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { emptyContextualHelp } from "../../../../utils/help";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import {
  decodePaymentNoticeNumber,
  validatePaymentNoticeNumber
} from "../../common/utils/validation";
import * as analytics from "../analytics";
import { PaymentsCheckoutRoutes } from "../navigation/routes";
import { TextInputValidationRefProps } from "../types";
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
        textInputRef.current?.validateInput();
      }, navigateToFiscalCodeInput)
    );

  useOnFirstRender(() => {
    analytics.trackPaymentNoticeDataEntry();
  });

  const textInputWrapperRef = useRef<View>(null);

  const textInputRef = useRef<TextInputValidationRefProps>(null);

  return (
    <>
      <IOScrollViewWithLargeHeader
        ignoreAccessibilityCheck
        title={{
          label: I18n.t("wallet.payment.manual.noticeNumber.title")
        }}
        description={I18n.t("wallet.payment.manual.noticeNumber.subtitle")}
        canGoback={true}
        contextualHelp={emptyContextualHelp}
        headerActionsProp={{ showHelp: true }}
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
        includeContentMargins
        ref={textInputWrapperRef}
      >
        <TextInputValidation
          testID="noticeNumberInput"
          ref={textInputRef}
          validationMode="onContinue"
          placeholder={I18n.t("wallet.payment.manual.noticeNumber.placeholder")}
          accessibilityLabel={I18n.t(
            "wallet.payment.manual.noticeNumber.placeholder"
          )}
          errorMessage={I18n.t(
            "wallet.payment.manual.noticeNumber.validationError"
          )}
          accessibilityErrorLabel={I18n.t(
            "wallet.payment.manual.noticeNumber.a11y"
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
            returnKeyType: "done",
            inputAccessoryViewID: "noticeNumberInputAccessoryView"
          }}
          autoFocus
        />
      </IOScrollViewWithLargeHeader>
      {Platform.OS === "ios" && (
        <InputAccessoryView nativeID="noticeNumberInputAccessoryView">
          <View style={{ padding: 20 }}>
            <IOButton
              fullWidth
              variant="solid"
              label={I18n.t("global.buttons.continue")}
              onPress={handleContinueClick}
            />
          </View>
        </InputAccessoryView>
      )}
    </>
  );
};

export { WalletPaymentInputNoticeNumberScreen };
