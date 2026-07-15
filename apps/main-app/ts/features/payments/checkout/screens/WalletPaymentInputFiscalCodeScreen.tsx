import { IOButton, TextInputValidation } from "@io-app/design-system";
import {
  PaymentNoticeNumberFromString,
  RptId
} from "@pagopa/io-pagopa-commons/lib/pagopa";
import { OrganizationFiscalCode } from "@pagopa/ts-commons/lib/strings";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { sequenceS } from "fp-ts/lib/Apply";
import { flow, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import I18n from "i18next";
import { ComponentRef, useEffect, useRef, useState } from "react";
import { Keyboard, Platform, View } from "react-native";
import { KeyboardStickyView } from "react-native-keyboard-controller";

import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { useFooterActionsMargin } from "../../../../hooks/useFooterActionsMargin";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { isScreenReaderEnabledSelector } from "../../../../store/reducers/preferences";
import { emptyContextualHelp } from "../../../../utils/contextualHelp";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import {
  decodeOrganizationFiscalCode,
  validateOrganizationFiscalCode
} from "../../common/utils/validation";
import * as analytics from "../analytics";
import { useInputFocus } from "../hooks/useInputFocus";
import { usePagoPaPayment } from "../hooks/usePagoPaPayment";
import { PaymentsCheckoutParamsList } from "../navigation/params";

export type WalletPaymentInputFiscalCodeScreenNavigationParams = {
  paymentNoticeNumber: O.Option<PaymentNoticeNumberFromString>;
};

type InputState = {
  fiscalCode: O.Option<OrganizationFiscalCode>;
  fiscalCodeText: string;
};

type WalletPaymentInputFiscalCodeRouteProps = RouteProp<
  PaymentsCheckoutParamsList,
  "PAYMENT_CHECKOUT_INPUT_FISCAL_CODE"
>;

const WalletPaymentInputFiscalCodeScreen = () => {
  const { params } = useRoute<WalletPaymentInputFiscalCodeRouteProps>();
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();

  const { startPaymentFlowWithRptId } = usePagoPaPayment();

  const [inputState, setInputState] = useState<InputState>({
    fiscalCodeText: "",
    fiscalCode: O.none
  });
  const textInputRef = useRef<ComponentRef<typeof TextInputValidation>>(null);
  const textInputWrapperRef = useRef<View>(null);
  const screenReaderEnabled = useIOSelector(isScreenReaderEnabledSelector);
  const [showInput, setShowInput] = useState(
    Platform.OS === "ios" || !screenReaderEnabled
  );

  // This effect is used to show the input field after a delay when the screen reader is enabled on Android
  // This is needed because the screen reader is focusing on the action button and not on the input field
  useEffect(() => {
    // This effect is only for Android
    if (Platform.OS === "ios") {
      return;
    }

    const timer = setTimeout(() => {
      setShowInput(true);
    }, 150);

    return () => clearTimeout(timer);
  }, [screenReaderEnabled]);

  const navigateToTransactionSummary = () => {
    pipe(
      sequenceS(O.Monad)({
        paymentNoticeNumber: params.paymentNoticeNumber,
        organizationFiscalCode: inputState.fiscalCode
      }),
      O.chain(flow(RptId.decode, O.fromEither)),
      O.map((rptId: RptId) => {
        navigation.popToTop();
        navigation.pop();
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

  useInputFocus(textInputRef);
  const { bottomMargin } = useFooterActionsMargin();

  return (
    <>
      <IOScrollViewWithLargeHeader
        canGoback
        contextualHelp={emptyContextualHelp}
        description={I18n.t("wallet.payment.manual.fiscalCode.subtitle")}
        headerActionsProp={{ showHelp: true }}
        ignoreAccessibilityCheck
        includeContentMargins
        ref={textInputWrapperRef}
        title={{
          label: I18n.t("wallet.payment.manual.fiscalCode.title")
        }}
      >
        {showInput && (
          <TextInputValidation
            accessibilityErrorLabel={I18n.t(
              "wallet.payment.manual.fiscalCode.a11y"
            )}
            accessibilityLabel={I18n.t(
              "wallet.payment.manual.fiscalCode.placeholder"
            )}
            counterLimit={11}
            errorMessage={I18n.t(
              "wallet.payment.manual.fiscalCode.validationError"
            )}
            icon="fiscalCodeIndividual"
            onChangeText={value =>
              setInputState({
                fiscalCodeText: value,
                fiscalCode: decodeOrganizationFiscalCode(value)
              })
            }
            onValidate={validateOrganizationFiscalCode}
            placeholder={I18n.t("wallet.payment.manual.fiscalCode.placeholder")}
            ref={textInputRef}
            testID="fiscalCodeInput"
            textInputProps={{
              keyboardType: "number-pad",
              inputMode: "numeric",
              inputAccessoryViewID: "keyboardStickyView"
            }}
            validationMode="onContinue"
            value={inputState.fiscalCodeText}
          />
        )}
      </IOScrollViewWithLargeHeader>
      <KeyboardStickyView offset={{ closed: 0 }}>
        <View style={{ paddingHorizontal: 20, marginBottom: bottomMargin }}>
          <IOButton
            fullWidth
            label={I18n.t("global.buttons.continue")}
            onPress={handleContinueClick}
            variant="solid"
          />
        </View>
      </KeyboardStickyView>
    </>
  );
};

export { WalletPaymentInputFiscalCodeScreen };
