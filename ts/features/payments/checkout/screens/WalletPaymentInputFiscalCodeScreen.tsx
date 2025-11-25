import { IOButton, TextInputValidation } from "@pagopa/io-app-design-system";
import {
  PaymentNoticeNumberFromString,
  RptId
} from "@pagopa/io-pagopa-commons/lib/pagopa";
import { OrganizationFiscalCode } from "@pagopa/ts-commons/lib/strings";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { sequenceS } from "fp-ts/lib/Apply";
import * as O from "fp-ts/lib/Option";
import { flow, pipe } from "fp-ts/lib/function";
import { useEffect, useRef, useState } from "react";
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
  decodeOrganizationFiscalCode,
  validateOrganizationFiscalCode
} from "../../common/utils/validation";
import * as analytics from "../analytics";
import { usePagoPaPayment } from "../hooks/usePagoPaPayment";
import { PaymentsCheckoutParamsList } from "../navigation/params";
import { TextInputValidationRefProps } from "../types";
import { useIOSelector } from "../../../../store/hooks";
import { isScreenReaderEnabledSelector } from "../../../../store/reducers/preferences";

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
        {showInput && (
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
        )}
      </IOScrollViewWithLargeHeader>
      {Platform.OS === "ios" && (
        <InputAccessoryView nativeID="fiscalCodeInputAccessoryView">
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

export { WalletPaymentInputFiscalCodeScreen };
