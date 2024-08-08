import {
  ContentWrapper,
  H2,
  IOStyles,
  Label,
  OTPInput,
  VSpacer
} from "@pagopa/io-app-design-system";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { useHeaderHeight } from "@react-navigation/elements";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { ContextualHelpPropsMarkdown } from "../../../../../components/screens/BaseScreenComponent";
import LegacyMarkdown from "../../../../../components/ui/Markdown/LegacyMarkdown";
import { pinPukHelpUrl } from "../../../../../config";
import { isCieLoginUatEnabledSelector } from "../../../../../features/cieLogin/store/selectors";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";
import I18n from "../../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { setAccessibilityFocus } from "../../../../../utils/accessibility";
import { useIOBottomSheetAutoresizableModal } from "../../../../../utils/hooks/bottomSheet";
import { useOnFirstRender } from "../../../../../utils/hooks/useOnFirstRender";
import { withTrailingPoliceCarLightEmojii } from "../../../../../utils/strings";
import { openWebUrl } from "../../../../../utils/url";
import {
  trackLoginCiePinInfo,
  trackLoginCiePinScreen
} from "../../../../../screens/authentication/analytics/cieAnalytics"; // TODO: separate cie analytics?
import { itwNfcIsEnabled } from "../../store/actions";
import { itwIsNfcEnabledSelector } from "../../store/selectors";
import { ItwEidIssuanceMachineContext } from "../../../machine/provider";

const CIE_PIN_LENGTH = 8;

const getContextualHelp = (): ContextualHelpPropsMarkdown => ({
  title: "authentication.cie.pin.contextualHelpTitle",
  body: "authentication.cie.pin.contextualHelpBody"
});
const onOpenForgotPinPage = () => openWebUrl(pinPukHelpUrl);

const ForgottenPin = () => (
  <View>
    <LegacyMarkdown avoidTextSelection>
      {I18n.t("bottomSheets.ciePin.content")}
    </LegacyMarkdown>
    <VSpacer size={24} />
    <Label asLink onPress={onOpenForgotPinPage}>
      {I18n.t("authentication.cie.pin.bottomSheetCTA")}
    </Label>
    <VSpacer size={24} />
  </View>
);

export const ItwCiePinScreen = () => {
  const dispatch = useIODispatch();
  const useCieUat = useIOSelector(isCieLoginUatEnabledSelector);
  const isEnabled = useIOSelector(itwIsNfcEnabledSelector);
  const isNfcEnabled = pot.getOrElse(isEnabled, false);

  const machineRef = ItwEidIssuanceMachineContext.useActorRef();

  const [pin, setPin] = useState("");
  const pinPadViewRef = useRef<View>(null);

  const headerHeight = useHeaderHeight();
  const isFocused = useIsFocused();

  const { present, bottomSheet } = useIOBottomSheetAutoresizableModal({
    component: <ForgottenPin />,
    title: I18n.t("bottomSheets.ciePin.title")
  });

  useOnFirstRender(trackLoginCiePinScreen);

  const requestNfcEnabledCheck = useCallback(
    () => dispatch(itwNfcIsEnabled.request()),
    [dispatch]
  );

  useEffect(() => {
    // Reset the pin when the user leaves the screen.
    if (!isFocused) {
      setPin("");
    }
  }, [isFocused]);

  useFocusEffect(
    React.useCallback(() => {
      setAccessibilityFocus(pinPadViewRef, 300 as Millisecond);
      requestNfcEnabledCheck();
    }, [requestNfcEnabledCheck])
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
      machineRef.send({ type: "cie-pin-entered", pin: value, isNfcEnabled });
    }
  };

  return (
    <SafeAreaView edges={["bottom"]} style={IOStyles.flex}>
      <KeyboardAvoidingView
        behavior={Platform.select({
          ios: "padding",
          android: undefined
        })}
        contentContainerStyle={IOStyles.flex}
        style={IOStyles.flex}
        keyboardVerticalOffset={headerHeight}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <ContentWrapper>
            <H2>{I18n.t("authentication.cie.pin.pinCardTitle")}</H2>
            <VSpacer size={8} />
            <Label
              asLink
              onPress={() => {
                trackLoginCiePinInfo();
                present();
              }}
            >
              {I18n.t("authentication.cie.pin.subtitleCTA")}
            </Label>
            <VSpacer size={24} />
            <View style={IOStyles.flex}>
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
        </ScrollView>
      </KeyboardAvoidingView>
      {bottomSheet}
    </SafeAreaView>
  );
};
