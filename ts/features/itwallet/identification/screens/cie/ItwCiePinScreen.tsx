import {
  ContentWrapper,
  H2,
  IOButton,
  OTPInput,
  VSpacer
} from "@pagopa/io-app-design-system";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { useHeaderHeight } from "@react-navigation/elements";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { useCallback, useEffect, useRef, useState } from "react";
import { Keyboard, KeyboardAvoidingView, Platform, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ContextualHelpPropsMarkdown } from "../../../../../components/screens/BaseScreenComponent";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";
import I18n from "../../../../../i18n";
import { useIOSelector } from "../../../../../store/hooks";
import { setAccessibilityFocus } from "../../../../../utils/accessibility";
import { usePreventScreenCapture } from "../../../../../utils/hooks/usePreventScreenCapture";
import { withTrailingPoliceCarLightEmojii } from "../../../../../utils/strings";
import { isCieLoginUatEnabledSelector } from "../../../../authentication/login/cie/store/selectors";
import {
  trackItWalletCiePinEnter,
  trackItWalletCiePinInfo
} from "../../../analytics";
import { ItwEidIssuanceMachineContext } from "../../../machine/provider";
import { useCieInfoBottomSheet } from "../../hooks/useCieInfoBottomSheet";

const CIE_PIN_LENGTH = 8;

const getContextualHelp = (): ContextualHelpPropsMarkdown => ({
  title: "authentication.cie.pin.contextualHelpTitle",
  body: "authentication.cie.pin.contextualHelpBody"
});

export const ItwCiePinScreen = () => {
  usePreventScreenCapture();

  const useCieUat = useIOSelector(isCieLoginUatEnabledSelector);
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();

  const [pin, setPin] = useState("");
  const pinPadViewRef = useRef<View>(null);

  const headerHeight = useHeaderHeight();
  const isFocused = useIsFocused();

  const pinInfoBottomSheet = useCieInfoBottomSheet({
    type: "pin",
    showSecondaryAction: false
  });

  useEffect(() => {
    // Reset the pin when the user leaves the screen.
    if (!isFocused) {
      setPin("");
    }
  }, [isFocused]);

  useFocusEffect(
    useCallback(() => {
      trackItWalletCiePinEnter();
      setAccessibilityFocus(pinPadViewRef, 300 as Millisecond);
    }, [])
  );

  useHeaderSecondLevel({
    title: withTrailingPoliceCarLightEmojii("", useCieUat),
    supportRequest: true,
    contextualHelpMarkdown: getContextualHelp()
  });

  const onPinChanged = (value: string) => {
    setPin(value);

    if (value.length === CIE_PIN_LENGTH) {
      Keyboard.dismiss();
      machineRef.send({ type: "cie-pin-entered", pin: value });
    }
  };

  return (
    <SafeAreaView edges={["bottom"]} style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.select({
          ios: "padding",
          android: undefined
        })}
        contentContainerStyle={{ flex: 1 }}
        style={{ flex: 1 }}
        keyboardVerticalOffset={headerHeight}
      >
        <ContentWrapper>
          <H2>
            {I18n.t("features.itWallet.identification.cie.inputPin.title")}
          </H2>
          <VSpacer size={8} />
          <IOButton
            variant="link"
            label={I18n.t(
              "features.itWallet.identification.cie.inputPin.buttonLink"
            )}
            accessibilityLabel={I18n.t(
              "features.itWallet.identification.cie.inputPin.buttonLink"
            )}
            onPress={() => {
              trackItWalletCiePinInfo();
              pinInfoBottomSheet.present();
            }}
          />
          <VSpacer size={24} />
          <View style={{ flex: 1 }}>
            <OTPInput
              ref={pinPadViewRef}
              secret
              value={pin}
              accessibilityLabel={I18n.t(
                "authentication.cie.pin.accessibility.label"
              )}
              accessibilityHint={I18n.t(
                "authentication.cie.pin.accessibility.hint"
              )}
              onValueChange={onPinChanged}
              length={CIE_PIN_LENGTH}
              autoFocus={isFocused}
              key={isFocused ? "focused" : "unfocused"}
            />
          </View>
        </ContentWrapper>
      </KeyboardAvoidingView>
      {pinInfoBottomSheet.bottomSheet}
    </SafeAreaView>
  );
};
