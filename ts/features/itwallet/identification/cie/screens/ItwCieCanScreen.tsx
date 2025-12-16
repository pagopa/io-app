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
import { ItwEidIssuanceMachineContext } from "../../../machine/eid/provider";
import { selectIdentification } from "../../../machine/eid/selectors";
import { trackItwIdEnterCan } from "../../../analytics";

const CIE_CAN_LENGTH = 6;

export const ItwCieCanScreen = () => {
  usePreventScreenCapture();

  const useCieUat = useIOSelector(isCieLoginUatEnabledSelector);
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const identification =
    ItwEidIssuanceMachineContext.useSelector(selectIdentification);

  const [can, setCan] = useState("");
  const canPadViewRef = useRef<View>(null);

  const headerHeight = useHeaderHeight();
  const isFocused = useIsFocused();

  useEffect(() => {
    // Reset the pin when the user leaves the screen.
    if (!isFocused) {
      setCan("");
    }
  }, [isFocused]);

  useFocusEffect(
    useCallback(() => {
      setAccessibilityFocus(canPadViewRef, 300 as Millisecond);
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      if (identification) {
        trackItwIdEnterCan({ ITW_ID_method: identification.mode });
      }
    }, [identification])
  );

  useHeaderSecondLevel({
    title: withTrailingPoliceCarLightEmojii("", useCieUat),
    supportRequest: true
  });

  const onCanChanged = (value: string) => {
    setCan(value);

    if (value.length === CIE_CAN_LENGTH) {
      Keyboard.dismiss();
      machineRef.send({ type: "cie-can-entered", can: value });
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
                value={can}
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
