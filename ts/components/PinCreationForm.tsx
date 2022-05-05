import * as React from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import I18n from "../i18n";
import FooterWithButtons from "../components/ui/FooterWithButtons";
import { confirmButtonProps } from "../features/bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { InfoBox } from "../components/box/InfoBox";
import { IOColors } from "../components/core/variables/IOColors";
import { Label } from "../components/core/typography/Label";
import { H1 } from "../components/core/typography/H1";
import { Body } from "../components/core/typography/Body";
import { LabelledItem } from "../components/LabelledItem";
import { IOStyles } from "../components/core/variables/IOStyles";
import { PIN_LENGTH_SIX } from "../utils/constants";
import { PinString } from "../types/PinString";
import { LabelSmall } from "../components/core/typography/LabelSmall";

type Props = {
  onSubmit: (pin: PinString) => void;
};

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  header: {
    fontSize: 20,
    lineHeight: 22
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
      ...confirmButtonProps(() => null, I18n.t("global.buttons.continue")),
      disabled: !isFormValid,
      onPress: handleSubmit
    }),
    [isFormValid, handleSubmit]
  );

  return (
    <View style={styles.flex}>
      <ScrollView style={[IOStyles.horizontalContentPadding, { flex: 1 }]}>
        <View style={{ marginTop: 10 }} />

        <H1>{I18n.t("onboarding.pin.title")}</H1>

        <View style={{ marginTop: 10 }} />

        <Body>{I18n.t("onboarding.pin.subTitle")}</Body>

        <View style={{ position: "relative", marginTop: 30 }}>
          <LabelledItem
            label={I18n.t("onboarding.pin.pinLabel")}
            inputProps={{
              value: pin,
              onChangeText: setPin,
              keyboardType: "number-pad",
              maxLength: pinLength,
              onEndEditing: handlePinBlur
            }}
            icon={isPinValid ? undefined : "io-warning"}
            iconColor={IOColors.red}
            iconPosition="right"
            isValid={isPinValid ? undefined : false}
            focusBorderColor={isPinValid ? undefined : IOColors.red}
          />

          {!isPinValid && (
            <View style={{ position: "absolute", bottom: -25, left: 2 }}>
              <LabelSmall weight="Regular" color="red">
                {I18n.t("onboarding.pin.errors.length")}
              </LabelSmall>
            </View>
          )}
        </View>

        <View style={{ position: "relative", marginTop: 45 }}>
          <LabelledItem
            label={I18n.t("onboarding.pin.pinConfirmationLabel")}
            inputProps={{
              value: pinConfirmation,
              onChangeText: setPinConfirmation,
              keyboardType: "number-pad",
              maxLength: pinLength,
              onEndEditing: handlePinConfirmationBlur
            }}
            icon={isPinConfirmationValid ? undefined : "io-warning"}
            iconColor={IOColors.red}
            iconPosition="right"
            isValid={isPinConfirmationValid ? undefined : false}
            focusBorderColor={isPinConfirmationValid ? undefined : IOColors.red}
          />

          {!isPinConfirmationValid && (
            <View style={{ position: "absolute", bottom: -25, left: 2 }}>
              <LabelSmall weight="Regular" color="red">
                {I18n.t("onboarding.pin.errors.match")}
              </LabelSmall>
            </View>
          )}
        </View>
      </ScrollView>

      <>
        <View style={IOStyles.horizontalContentPadding}>
          <InfoBox iconName={"io-titolare"} iconColor={IOColors.bluegrey}>
            <Label color={"bluegrey"} weight={"Regular"}>
              {I18n.t("onboarding.pin.tutorial")}
            </Label>
          </InfoBox>
        </View>

        <View style={{ marginTop: 20 }} />

        <FooterWithButtons
          type="SingleButton"
          leftButton={computedConfirmButtonProps}
        />
      </>
    </View>
  );
};
