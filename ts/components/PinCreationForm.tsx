import { ButtonOutline, IOColors, VSpacer } from "@pagopa/io-app-design-system";
import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { defaultPin } from "../config";
import { confirmButtonProps } from "../features/bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { isValidPinNumber } from "../features/fastLogin/utils/pinPolicy";
import I18n from "../i18n";
import { trackPinError } from "../screens/profile/analytics";
import { useIOSelector } from "../store/hooks";
import { isProfileFirstOnBoardingSelector } from "../store/reducers/profile";
import { PinString } from "../types/PinString";
import { getFlowType } from "../utils/analytics";
import { PIN_LENGTH_SIX } from "../utils/constants";
import { isDevEnv } from "../utils/environment";
import { LabelledItem } from "./LabelledItem";
import { InfoBox } from "./box/InfoBox";
import { Body } from "./core/typography/Body";
import { H1 } from "./core/typography/H1";
import { Label } from "./core/typography/Label";
import { LabelSmall } from "./core/typography/LabelSmall";
import { IOStyles } from "./core/variables/IOStyles";
import FooterWithButtons from "./ui/FooterWithButtons";

export type Props = {
  onSubmit: (pin: PinString) => void;
  isOnboarding: boolean;
};

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  bulletList: {
    marginLeft: 10
  }
});

const pinLength = PIN_LENGTH_SIX;

/**
 * The Pin Creation form used in both the onboarding
 * process and the profile settings.
 *
 * This form will allow the user to create a new pin
 * handling the repetition check.
 */
export const PinCreationForm = ({ onSubmit, isOnboarding }: Props) => {
  const isFirstOnBoarding = useIOSelector(isProfileFirstOnBoardingSelector);

  const [pin, setPin] = React.useState("");
  const [isPinDirty, setIsPinDirty] = React.useState(false);
  const [pinConfirmation, setPinConfirmation] = React.useState("");
  const [isPinConfirmationDirty, setIsPinConfirmationDirty] =
    React.useState(false);

  const isPinValid = !isPinDirty || isValidPinNumber(pin);

  const isPinConfirmationValid =
    !isPinConfirmationDirty || (pinConfirmation && pinConfirmation === pin);

  const isFormValid = isValidPinNumber(pin) && pinConfirmation === pin;

  const handlePinBlur = React.useCallback(() => {
    setIsPinDirty(true);
  }, [setIsPinDirty]);

  const handlePinConfirmationBlur = React.useCallback(() => {
    setIsPinConfirmationDirty(true);
  }, [setIsPinConfirmationDirty]);

  const handleSubmit = React.useCallback(() => {
    if (!isFormValid) {
      return;
    }

    const typedPin = pin as PinString;

    onSubmit(typedPin);
  }, [pin, isFormValid, onSubmit]);

  const computedConfirmButtonProps = React.useMemo(
    () => ({
      ...confirmButtonProps(
        () => null,
        I18n.t("global.buttons.continue"),
        undefined,
        "pin-creation-form-confirm"
      ),
      disabled: !isFormValid,
      onPress: handleSubmit
    }),
    [isFormValid, handleSubmit]
  );

  const pinFieldA11yLabel = React.useMemo(() => {
    if (!isPinValid) {
      trackPinError("creation", getFlowType(isOnboarding, isFirstOnBoarding));
    }
    return `${I18n.t("onboarding.pin.pinLabel")}${
      !isPinValid ? ", " + I18n.t("onboarding.pin.errors.invalid") : ""
    }`;
  }, [isFirstOnBoarding, isOnboarding, isPinValid]);

  const pinConfirmationFieldA11yLabel = React.useMemo(() => {
    if (!isPinConfirmationValid) {
      trackPinError("confirm", getFlowType(isOnboarding, isFirstOnBoarding));
    }
    return `${I18n.t("onboarding.pin.pinConfirmationLabel")}${
      !isPinConfirmationValid
        ? ", " + I18n.t("onboarding.pin.errors.match")
        : ""
    }`;
  }, [isFirstOnBoarding, isOnboarding, isPinConfirmationValid]);

  const bulletList = () => (
    <View style={styles.bulletList}>
      <Body>{`\u2022 ${I18n.t("onboarding.pin.policy.first")} `}</Body>
      <Body>{`\u2022 ${I18n.t("onboarding.pin.policy.second")} `}</Body>
    </View>
  );

  const insertValidPin = () => {
    setPin(defaultPin);
    setPinConfirmation(defaultPin);
  };

  return (
    <View style={styles.flex}>
      <ScrollView
        testID="pin-creation-form-scroll-view"
        style={[IOStyles.horizontalContentPadding, { flex: 1 }]}
      >
        <View style={{ marginTop: 10 }} />

        <H1 testID="pin-creation-form-title">
          {I18n.t("onboarding.pin.title")}
        </H1>

        <View style={{ marginTop: 10 }} />

        <Body>{I18n.t("onboarding.pin.subTitle")}</Body>
        <VSpacer />

        <Body>{I18n.t("onboarding.pin.policy.headerTitle")}</Body>
        {bulletList()}

        <View style={{ position: "relative", marginTop: 30 }}>
          <LabelledItem
            label={I18n.t("onboarding.pin.pinLabel")}
            accessibilityLabel={pinFieldA11yLabel}
            inputProps={{
              value: pin,
              onChangeText: setPin,
              keyboardType: "number-pad",
              maxLength: pinLength,
              onEndEditing: handlePinBlur,
              secureTextEntry: true,
              returnKeyType: "done",
              contextMenuHidden: true
            }}
            icon={isPinValid ? undefined : "notice"}
            iconColor={"red"}
            iconPosition="right"
            isValid={isPinValid ? undefined : false}
            overrideBorderColor={isPinValid ? undefined : IOColors.red}
            testID="PinField"
            inputAccessoryViewID="" // hide keyboard toolbar
          />

          {!isPinValid && (
            <View
              style={{ position: "absolute", bottom: -25, left: 2 }}
              accessibilityElementsHidden={true}
              importantForAccessibility="no-hide-descendants"
            >
              <LabelSmall weight="Regular" color="red">
                {I18n.t("onboarding.pin.errors.invalid")}
              </LabelSmall>
            </View>
          )}
        </View>

        <View style={{ position: "relative", marginTop: 45 }}>
          <LabelledItem
            label={I18n.t("onboarding.pin.pinConfirmationLabel")}
            accessibilityLabel={pinConfirmationFieldA11yLabel}
            inputProps={{
              value: pinConfirmation,
              onChangeText: setPinConfirmation,
              keyboardType: "number-pad",
              maxLength: pinLength,
              onEndEditing: handlePinConfirmationBlur,
              secureTextEntry: true,
              returnKeyType: "done",
              contextMenuHidden: true
            }}
            icon={isPinConfirmationValid ? undefined : "notice"}
            iconColor={"red"}
            iconPosition="right"
            isValid={isPinConfirmationValid ? undefined : false}
            overrideBorderColor={
              isPinConfirmationValid ? undefined : IOColors.red
            }
            testID="PinConfirmationField"
            inputAccessoryViewID="" // hide keyboard toolbar
          />

          {!isPinConfirmationValid && (
            <View
              style={{ position: "absolute", bottom: -25, left: 2 }}
              accessibilityElementsHidden={true}
              importantForAccessibility="no-hide-descendants"
            >
              <LabelSmall weight="Regular" color="red">
                {I18n.t("onboarding.pin.errors.match")}
              </LabelSmall>
            </View>
          )}
        </View>

        <View style={{ marginTop: 45 }}>
          <InfoBox iconName="profile" iconColor="bluegrey">
            <Label color={"bluegrey"} weight={"Regular"}>
              {I18n.t("onboarding.pin.tutorial")}
            </Label>
          </InfoBox>
        </View>
      </ScrollView>

      {isDevEnv && (
        <View style={{ alignSelf: "center" }}>
          <ButtonOutline
            label={`Enter Pin: ${defaultPin} (DevEnv Only)`}
            accessibilityLabel=""
            onPress={insertValidPin}
          />
        </View>
      )}

      <FooterWithButtons
        type="SingleButton"
        leftButton={computedConfirmButtonProps}
      />
    </View>
  );
};
