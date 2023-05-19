import * as React from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import I18n from "../i18n";
import { PIN_LENGTH_SIX } from "../utils/constants";
import { PinString } from "../types/PinString";
import { confirmButtonProps } from "../features/bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import FooterWithButtons from "./ui/FooterWithButtons";
import { InfoBox } from "./box/InfoBox";
import { IOColors } from "./core/variables/IOColors";
import { Label } from "./core/typography/Label";
import { H1 } from "./core/typography/H1";
import { Body } from "./core/typography/Body";
import { LabelledItem } from "./LabelledItem";
import { IOStyles } from "./core/variables/IOStyles";
import { LabelSmall } from "./core/typography/LabelSmall";

export type Props = {
  onSubmit: (pin: PinString) => void;
};

const styles = StyleSheet.create({
  flex: {
    flex: 1
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
export const PinCreationForm = ({ onSubmit }: Props) => {
  const [pin, setPin] = React.useState("");
  const [isPinDirty, setIsPinDirty] = React.useState(false);
  const [pinConfirmation, setPinConfirmation] = React.useState("");
  const [isPinConfirmationDirty, setIsPinConfirmationDirty] =
    React.useState(false);

  const isPinValid = !isPinDirty || pin.length === pinLength;

  const isPinConfirmationValid =
    !isPinConfirmationDirty || (pinConfirmation && pinConfirmation === pin);

  const isFormValid =
    pin.length === pinLength &&
    pinConfirmation.length === pinLength &&
    pinConfirmation === pin;

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

  const pinFieldA11yLabel = React.useMemo(
    () =>
      `${I18n.t("onboarding.pin.pinLabel")}${
        !isPinValid ? ", " + I18n.t("onboarding.pin.errors.length") : ""
      }`,
    [isPinValid]
  );

  const pinConfirmationFieldA11yLabel = React.useMemo(
    () =>
      `${I18n.t("onboarding.pin.pinConfirmationLabel")}${
        !isPinConfirmationValid
          ? ", " + I18n.t("onboarding.pin.errors.match")
          : ""
      }`,
    [isPinConfirmationValid]
  );

  return (
    <View style={styles.flex}>
      <ScrollView style={[IOStyles.horizontalContentPadding, { flex: 1 }]}>
        <View style={{ marginTop: 10 }} />

        <H1 testID="pin-creation-form-title">
          {I18n.t("onboarding.pin.title")}
        </H1>

        <View style={{ marginTop: 10 }} />

        <Body>{I18n.t("onboarding.pin.subTitle")}</Body>

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
            icon={isPinValid ? undefined : "io-warning"}
            iconColor={IOColors.red}
            iconPosition="right"
            isValid={isPinValid ? undefined : false}
            overrideBorderColor={isPinValid ? undefined : IOColors.red}
            testID="PinField"
          />

          {!isPinValid && (
            <View
              style={{ position: "absolute", bottom: -25, left: 2 }}
              accessibilityElementsHidden={true}
              importantForAccessibility="no-hide-descendants"
            >
              <LabelSmall weight="Regular" color="red">
                {I18n.t("onboarding.pin.errors.length")}
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
            icon={isPinConfirmationValid ? undefined : "io-warning"}
            iconColor={IOColors.red}
            iconPosition="right"
            isValid={isPinConfirmationValid ? undefined : false}
            overrideBorderColor={
              isPinConfirmationValid ? undefined : IOColors.red
            }
            testID="PinConfirmationField"
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
          <InfoBox iconName="profileAlt" iconColor="bluegrey">
            <Label color={"bluegrey"} weight={"Regular"}>
              {I18n.t("onboarding.pin.tutorial")}
            </Label>
          </InfoBox>
        </View>
      </ScrollView>

      <FooterWithButtons
        type="SingleButton"
        leftButton={computedConfirmButtonProps}
      />
    </View>
  );
};
