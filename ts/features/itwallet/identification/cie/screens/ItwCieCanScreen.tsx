import {
  Body,
  ContentWrapper,
  H2,
  OTPInput,
  VSpacer
} from "@pagopa/io-app-design-system";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { useHeaderHeight } from "@react-navigation/elements";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import I18n from "i18next";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";
import { useIOSelector } from "../../../../../store/hooks";
import { setAccessibilityFocus } from "../../../../../utils/accessibility";
import { usePreventScreenCapture } from "../../../../../utils/hooks/usePreventScreenCapture";
import { withTrailingPoliceCarLightEmojii } from "../../../../../utils/strings";
import { isCieLoginUatEnabledSelector } from "../../../../authentication/login/cie/store/selectors";

const CIE_CAN_LENGTH = 6;

export const ItwCieCanScreen = () => {
  usePreventScreenCapture();

  const useCieUat = useIOSelector(isCieLoginUatEnabledSelector);

  const [pin, setPin] = useState("");
  const canPadViewRef = useRef<View>(null);

  const headerHeight = useHeaderHeight();
  const isFocused = useIsFocused();

  useEffect(() => {
    // Reset the pin when the user leaves the screen.
    if (!isFocused) {
      setPin("");
    }
  }, [isFocused]);

  useFocusEffect(
    useCallback(() => {
      setAccessibilityFocus(canPadViewRef, 300 as Millisecond);
    }, [])
  );

  useHeaderSecondLevel({
    title: withTrailingPoliceCarLightEmojii("", useCieUat),
    supportRequest: true
  });

  const onCanChanged = (value: string) => {
    setPin(value);

    if (value.length === CIE_CAN_LENGTH) {
      Keyboard.dismiss();
      // TODO[SIW-3045] continue with CAN authentication
      Alert.alert(`Your CAN is: ${value}`);
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
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <ContentWrapper>
            <H2>
              {I18n.t("features.itWallet.identification.cie.inputCan.title")}
            </H2>
            <VSpacer size={8} />
            <Body>
              {I18n.t("features.itWallet.identification.cie.inputCan.subtitle")}
            </Body>
            <VSpacer size={24} />
            <View style={{ flex: 1 }}>
              <OTPInput
                ref={canPadViewRef}
                secret
                value={pin}
                accessibilityLabel={I18n.t(
                  "authentication.cie.pin.accessibility.label"
                )}
                accessibilityHint={I18n.t(
                  "authentication.cie.pin.accessibility.hint"
                )}
                onValueChange={onCanChanged}
                length={CIE_CAN_LENGTH}
                autoFocus={isFocused}
                key={isFocused ? "focused" : "unfocused"}
              />
            </View>
          </ContentWrapper>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
