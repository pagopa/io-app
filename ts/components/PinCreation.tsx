import {
  Alert,
  ButtonOutline,
  H4,
  Pictogram,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { StyleSheet, View, Alert as NativeAlert } from "react-native";
import { defaultPin } from "../config";
import { isValidPinNumber } from "../features/fastLogin/utils/pinPolicy";
import I18n from "../i18n";
import { trackPinError } from "../screens/profile/analytics";
import { useIOSelector } from "../store/hooks";
import { isProfileFirstOnBoardingSelector } from "../store/reducers/profile";
import { PinString } from "../types/PinString";
import { getFlowType } from "../utils/analytics";
import { isDevEnv } from "../utils/environment";
import { PIN_LENGTH_SIX } from "../utils/constants";
import { useIONavigation } from "../navigation/params/AppParamsList";
import ROUTES from "../navigation/routes";
import { Body } from "./core/typography/Body";
import { IOStyles } from "./core/variables/IOStyles";
import { CodeInput } from "./CodeInput";

export type Props = {
  isOnboarding?: boolean;
};

/**
 * The Pin Creation component is used in both the onboarding
 * process and the profile settings.
 *
 * This component will allow the user to create a new pin.
 * The pin confirmation is handled by the `PinConfirmation` component.
 */
export const PinCreation = ({ isOnboarding = false }: Props) => {
  const [pin, setPin] = React.useState("");
  const isFirstOnBoarding = useIOSelector(isProfileFirstOnBoardingSelector);
  const navigation = useIONavigation();

  const insertValidPin = React.useCallback(() => {
    setPin(defaultPin);
  }, []);
  const handleOnValidate = React.useCallback(
    (v: string) => {
      const isValid = isValidPinNumber(v);

      if (isValid) {
        if (isOnboarding) {
          navigation.navigate(ROUTES.ONBOARDING, {
            screen: ROUTES.ONBOARDING_CONFIRMATION_PIN,
            params: { pin: v as PinString }
          });
        } else {
          navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
            screen: ROUTES.PIN_CONFIRMATION,
            params: { pin: v as PinString }
          });
        }
        setPin("");
      } else {
        trackPinError("creation", getFlowType(isOnboarding, isFirstOnBoarding));

        NativeAlert.alert(
          I18n.t("onboarding.pin.errors.invalid.title"),
          I18n.t("onboarding.pin.errors.invalid.description"),
          [
            {
              text: I18n.t("onboarding.pin.errors.invalid.cta")
            }
          ]
        );
      }

      return isValid;
    },
    [navigation, isFirstOnBoarding, isOnboarding]
  );

  return (
    <View style={styles.flex}>
      <View style={[IOStyles.horizontalContentPadding, { flex: 1 }]}>
        <VSpacer size={8} />
        <View style={{ alignItems: "center" }}>
          <Pictogram name="key" size={64} />
          <VSpacer size={8} />
          <H4 testID="pin-creation-form-title">
            {I18n.t("onboarding.pin.title")}
          </H4>
          <Body style={{ textAlign: "center" }}>
            {I18n.t("onboarding.pin.subTitle")}
          </Body>
        </View>
        <VSpacer size={32} />
        <CodeInput
          accessibilityLabel={`${I18n.t("onboarding.pin.pinLabel")}, ${I18n.t(
            "accessibility.doubleTapToOpenKeyboardHint"
          )}`}
          length={PIN_LENGTH_SIX}
          onValidate={handleOnValidate}
          onValueChange={setPin}
          onChange={setPin}
          value={pin}
        />
        <VSpacer size={32} />
        <Alert
          variant="info"
          content={`${I18n.t(
            "onboarding.pin.policy.headerTitle"
          )}\n\u2022 ${I18n.t("onboarding.pin.policy.first")}\n\u2022 ${I18n.t(
            "onboarding.pin.policy.second"
          )}`}
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
