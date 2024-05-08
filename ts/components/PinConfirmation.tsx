import {
  ButtonOutline,
  H4,
  Pictogram,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { StyleSheet, View, Alert as NativeAlert } from "react-native";
import { defaultPin } from "../config";
import I18n from "../i18n";
import { trackPinError } from "../screens/profile/analytics";
import { useIOSelector } from "../store/hooks";
import { isProfileFirstOnBoardingSelector } from "../store/reducers/profile";
import { PinString } from "../types/PinString";
import { getFlowType } from "../utils/analytics";
import { isDevEnv } from "../utils/environment";
import { PIN_LENGTH_SIX } from "../utils/constants";
import { useIONavigation } from "../navigation/params/AppParamsList";
import { IOStyles } from "./core/variables/IOStyles";
import { CodeInput } from "./CodeInput";

type Props = {
  onSubmit: (pin: PinString) => void;
  pin: PinString;
  isOnboarding?: boolean;
};

/**
 * The PinConfirmation component is used in both the onboarding
 * process and the profile settings.
 *
 * This component checks if inserted pin matches the pin coming from the component props and, if so, submits the new pin.
 */
export const PinConfirmation = ({
  onSubmit,
  isOnboarding = false,
  pin
}: Props) => {
  const [pinConfirmation, setPinConfirmation] = React.useState("");

  const isFirstOnBoarding = useIOSelector(isProfileFirstOnBoardingSelector);
  const navigator = useIONavigation();

  const handleOnValidate = React.useCallback(
    (v: string) => {
      const isValid = v === pin;

      if (isValid) {
        onSubmit(v as PinString);
      } else {
        trackPinError("confirm", getFlowType(isOnboarding, isFirstOnBoarding));
        NativeAlert.alert(
          I18n.t("onboarding.pinConfirmation.errors.match.title"),
          undefined,
          [
            {
              text: I18n.t("onboarding.pinConfirmation.errors.match.cta"),
              onPress: navigator.goBack
            }
          ]
        );
      }

      return isValid;
    },
    [navigator, isFirstOnBoarding, isOnboarding, pin, onSubmit]
  );

  const insertValidPin = React.useCallback(() => {
    setPinConfirmation(defaultPin);
  }, []);

  return (
    <View style={styles.flex}>
      <View style={[IOStyles.horizontalContentPadding, styles.flex]}>
        <VSpacer size={8} />
        <View style={{ alignItems: "center" }}>
          <Pictogram name="key" size={64} />
          <VSpacer size={8} />
          <H4 testID="pin-confirmation-title">
            {I18n.t("onboarding.pinConfirmation.title")}
          </H4>
        </View>
        <VSpacer size={40} />
        <VSpacer size={40} />
        <CodeInput
          testID="pin-confirmation-input"
          length={PIN_LENGTH_SIX}
          accessibilityLabel={`${I18n.t(
            "onboarding.pin.pinConfirmationLabel"
          )}, ${I18n.t("accessibility.doubleTapToActivateHint")}`}
          onValidate={handleOnValidate}
          onValueChange={setPinConfirmation}
          onChange={setPinConfirmation}
          value={pinConfirmation}
        />
      </View>
      {isDevEnv && (
        <View style={{ alignSelf: "center" }}>
          <ButtonOutline
            label={`Enter Pin: ${defaultPin} (DevEnv Only)`}
            accessibilityLabel=""
            onPress={insertValidPin}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1
  }
});
