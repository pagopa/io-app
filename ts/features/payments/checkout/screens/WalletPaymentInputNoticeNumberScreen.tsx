import { IOButton, TextInputValidation } from "@pagopa/io-app-design-system";
import { PaymentNoticeNumberFromString } from "@pagopa/io-pagopa-commons/lib/pagopa";
import { useNavigation } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import I18n from "i18next";
import { ComponentRef, useRef, useState } from "react";
import { Keyboard, View } from "react-native";
import { KeyboardStickyView } from "react-native-keyboard-controller";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { useFooterActionsMargin } from "../../../../hooks/useFooterActionsMargin";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { emptyContextualHelp } from "../../../../utils/contextualHelp";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import {
  decodePaymentNoticeNumber,
  validatePaymentNoticeNumber
} from "../../common/utils/validation";
import * as analytics from "../analytics";
import { useInputFocus } from "../hooks/useInputFocus";
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
        textInputRef.current?.validateInput();
      }, navigateToFiscalCodeInput)
    );

  useOnFirstRender(() => {
    analytics.trackPaymentNoticeDataEntry();
  });

  const textInputWrapperRef = useRef<View>(null);

  const textInputRef = useRef<ComponentRef<typeof TextInputValidation>>(null);

  useInputFocus(textInputRef);

  const { bottomMargin } = useFooterActionsMargin();

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
          counterLimit={MAX_LENGTH_NOTICE_NUMBER}
          showCounterOnlyWhenLimitReached
          onValidate={validatePaymentNoticeNumber}
          textInputProps={{
            keyboardType: "number-pad",
            inputMode: "numeric",
            inputAccessoryViewID: "keyboardStickyView"
          }}
        />
      </IOScrollViewWithLargeHeader>
      <KeyboardStickyView offset={{ closed: 0 }}>
        <View
          style={{
            paddingHorizontal: 20,
            marginBottom: bottomMargin
          }}
        >
          <IOButton
            fullWidth
            variant="solid"
            label={I18n.t("global.buttons.continue")}
            onPress={handleContinueClick}
          />
        </View>
      </KeyboardStickyView>
    </>
  );
};

export { WalletPaymentInputNoticeNumberScreen };
