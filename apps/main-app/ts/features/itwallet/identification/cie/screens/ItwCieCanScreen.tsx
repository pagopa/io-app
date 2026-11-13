import {
  Body,
  ContentWrapper,
  H2,
  IOButton,
  OTPInput,
  VSpacer
} from "@io-app/design-system";
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
import { KeyboardStickyView } from "react-native-keyboard-controller";
import {
  SafeAreaView,
  useSafeAreaInsets
} from "react-native-safe-area-context";

import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";
import { useIOSelector } from "../../../../../store/hooks";
import { isScreenReaderEnabledSelector } from "../../../../../store/reducers/preferences";
import { setAccessibilityFocus } from "../../../../../utils/accessibility";
import { usePreventScreenCapture } from "../../../../../utils/hooks/usePreventScreenCapture";
import { withTrailingPoliceCarLightEmojii } from "../../../../../utils/strings";
import { isCiePreprodSelector } from "../../../../authentication/login/cie/store/selectors";
import { ItwEidIssuanceMachineContext } from "../../../machine/eid/provider";
import { selectIdentification } from "../../../machine/eid/selectors";
import { trackItwIdEnterCan } from "../../analytics";

const CIE_CAN_LENGTH = 6;
const FOOTER_VERTICAL_PADDING = 16;

export const ItwCieCanScreen = () => {
  usePreventScreenCapture();

  const isCiePreprod = useIOSelector(isCiePreprodSelector);
  const isScreenReaderEnabled = useIOSelector(isScreenReaderEnabledSelector);
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const identification =
    ItwEidIssuanceMachineContext.useSelector(selectIdentification);

  const [can, setCan] = useState("");
  const canPadViewRef = useRef<View>(null);

  const headerHeight = useHeaderHeight();
  const { bottom: bottomInset } = useSafeAreaInsets();
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
      trackItwIdEnterCan({ ITW_ID_method: identification?.mode });
    }, [identification])
  );

  useHeaderSecondLevel({
    title: withTrailingPoliceCarLightEmojii("", isCiePreprod),
    supportRequest: true
  });

  const submitCan = (value: string) => {
    Keyboard.dismiss();
    machineRef.send({ type: "cie-can-entered", can: value });
  };

  // Screen reader users confirm the CAN explicitly with a button instead of
  // being moved to the next screen on the last digit (a11y: no change on input).
  const onCanChanged = (value: string) => {
    setCan(value);

    if (!isScreenReaderEnabled && value.length === CIE_CAN_LENGTH) {
      submitCan(value);
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
        keyboardVerticalOffset={headerHeight}
        style={{ flex: 1 }}
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
                accessibilityHint={I18n.t(
                  "authentication.cie.pin.accessibility.hint"
                )}
                accessibilityLabel={I18n.t(
                  "authentication.cie.pin.accessibility.label"
                )}
                accessibilityValueText={({ valueLength, length }) =>
                  I18n.t("global.accessibility.otpInput.valueText", {
                    valueLength,
                    length
                  })
                }
                autoFocus={isFocused}
                key={isFocused ? "focused" : "unfocused"}
                length={CIE_CAN_LENGTH}
                onValueChange={onCanChanged}
                ref={canPadViewRef}
                secret
                value={can}
              />
            </View>
          </ContentWrapper>
        </ScrollView>
      </KeyboardAvoidingView>
      {/*
        With `KeyboardProvider` Android is edge-to-edge and the native resize
        no longer lifts the footer. The opened offset removes the bottom
        padding already applied by `SafeAreaView`.
      */}
      {isScreenReaderEnabled && (
        <KeyboardStickyView offset={{ opened: bottomInset }}>
          <ContentWrapper style={{ paddingVertical: FOOTER_VERTICAL_PADDING }}>
            <IOButton
              disabled={can.length < CIE_CAN_LENGTH}
              fullWidth
              label={I18n.t("global.buttons.confirm")}
              onPress={() => submitCan(can)}
              testID="itwCieCanConfirmButtonTestID"
              variant="solid"
            />
          </ContentWrapper>
        </KeyboardStickyView>
      )}
    </SafeAreaView>
  );
};
