import {
  Banner,
  Body,
  ContentWrapper,
  H2,
  OTPInput,
  useIOToast,
  VSpacer
} from "@io-app/design-system";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { useHeaderHeight } from "@react-navigation/elements";
import {
  useFocusEffect,
  useIsFocused,
  useRoute
} from "@react-navigation/native";
import I18n from "i18next";
import { useCallback, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { helpCenterHowToLoginWithEicUrl } from "../../../../../config";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { setAccessibilityFocus } from "../../../../../utils/accessibility";
import { trackHelpCenterCtaTapped } from "../../../../../utils/analytics";
import { usePreventScreenCapture } from "../../../../../utils/hooks/usePreventScreenCapture";
import { withTrailingPoliceCarLightEmojii } from "../../../../../utils/strings";
import { openWebUrl } from "../../../../../utils/url";
import { cieLoginFlowSelector } from "../../../activeSessionLogin/store/selectors";
import { trackLoginCiePinScreen } from "../../../common/analytics/cieAnalytics";
import { useCieInfoBottomSheet } from "../hooks/useCieInfoBottomSheet";
import { nfcIsEnabled } from "../store/actions";
import { isCieLoginUatEnabledSelector } from "../store/selectors";

const CIE_PIN_LENGTH = 8;

export const OneIdentityCiePinScreen = () => {
  usePreventScreenCapture();

  const { name: routeName } = useRoute();

  const headerHeight = useHeaderHeight();
  const isFocused = useIsFocused();

  const dispatch = useIODispatch();
  const loginFlow = useIOSelector(cieLoginFlowSelector);
  const useCieUat = useIOSelector(isCieLoginUatEnabledSelector);

  const toast = useIOToast();

  const [pin, setPin] = useState("");
  const pinPadViewRef = useRef<View>(null);

  useFocusEffect(
    useCallback(() => {
      trackLoginCiePinScreen(loginFlow);
      setAccessibilityFocus(pinPadViewRef, 300 as Millisecond);
    }, [loginFlow])
  );

  useHeaderSecondLevel({
    title: withTrailingPoliceCarLightEmojii("", useCieUat),
    supportRequest: true
  });

  const cieInfoBottomSheet = useCieInfoBottomSheet();

  const handlePinChanged = (value: string) => {
    setPin(value);

    if (value.length === CIE_PIN_LENGTH) {
      dispatch(nfcIsEnabled.request());
      Keyboard.dismiss();
      // TODO: Navigate to the next screen in the CIE login flow
    }
  };

  const handlePressHelpBanner = useCallback(() => {
    trackHelpCenterCtaTapped(
      "LOGIN_CIE_PIN",
      helpCenterHowToLoginWithEicUrl,
      routeName
    );
    openWebUrl(helpCenterHowToLoginWithEicUrl, () => {
      toast.error(I18n.t("global.jserror.title"));
    });
  }, [toast, routeName]);

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
            <H2>{I18n.t("authentication.cie.pin.pinCardTitle")}</H2>
            <VSpacer size={8} />
            <Body
              accessibilityRole="button"
              asLink
              onPress={() => {
                cieInfoBottomSheet.present();
              }}
              weight="Semibold"
            >
              {I18n.t("authentication.cie.pin.subtitleCTA")}
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
                deleteButtonAccessibilityLabel={I18n.t(
                  "authentication.cie.pin.accessibility.deleteLabel",
                  { number: pin.slice(-1) }
                )}
                key={isFocused ? "focused" : "unfocused"}
                length={CIE_PIN_LENGTH}
                onValueChange={handlePinChanged}
                ref={pinPadViewRef}
                secret
                value={pin}
              />
              <VSpacer size={24} />
              <Banner
                accessibilityRole="link"
                action={I18n.t("login.help_banner_action")}
                color="neutral"
                content={I18n.t("login.help_banner_content")}
                onPress={handlePressHelpBanner}
                pictogramName="help"
                title={I18n.t("login.help_banner_title")}
              />
            </View>
          </ContentWrapper>
          {cieInfoBottomSheet.bottomSheet}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
