import { View } from "native-base";
import * as React from "react";
import {
  SafeAreaView,
  StyleSheet,
  View as BaseView,
  ScrollView
} from "react-native";
import { NavigationStackScreenProps } from "react-navigation-stack";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../components/screens/BaseScreenComponent";
import I18n from "../../i18n";
import { LightModalContextInterface } from "../../components/ui/LightModal";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import { confirmButtonProps } from "../../features/bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { useOnboardingAbortAlert } from "../../utils/hooks/useOnboardingAbortAlert";
import { InfoBox } from "../../components/box/InfoBox";
import { IOColors } from "../../components/core/variables/IOColors";
import { Label } from "../../components/core/typography/Label";
import { H1 } from "../../components/core/typography/H1";
import { Body } from "../../components/core/typography/Body";
import { LabelledItem } from "../../components/LabelledItem";
import { IOStyles } from "../../components/core/variables/IOStyles";
import { PIN_LENGTH_SIX } from "../../utils/constants";

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "onboarding.unlockCode.contextualHelpTitle",
  body: "onboarding.unlockCode.contextualHelpContent"
};

type Props = NavigationStackScreenProps & LightModalContextInterface;

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
 * A screen that allows the user to set the unlock code.
 */
const OnboardingPinScreen: React.FC<Props> = () => {
  const [pin, setPin] = React.useState("");
  const [isPinDirty, setIsPinDirty] = React.useState(false);
  const [pinConfirmation, setPinConfirmation] = React.useState("");
  const [isPinConfirmationDirty, setIsPinConfirmationDirty] =
    React.useState(false);
  const onboardingAbortAlert = useOnboardingAbortAlert();

  const handleGoBack = () => {
    onboardingAbortAlert.showAlert();
  };

  const isPinValid = !isPinDirty || pin.length === pinLength;

  const isPinConfirmationValid =
    !isPinConfirmationDirty || pinConfirmation === pin;

  const isFormValid =
    pin.length === pinLength &&
    pinConfirmation.length === pinLength &&
    pinConfirmation === pin;

  const computedConfirmButtonProps = React.useMemo(
    () => ({
      ...confirmButtonProps(() => null, I18n.t("global.buttons.continue")),
      disabled: !isFormValid,
      onPress: () => null
    }),
    [isFormValid]
  );

  const handlePinBlur = React.useCallback(() => {
    setIsPinDirty(true);
  }, [setIsPinDirty]);

  const handlePinConfirmationBlur = React.useCallback(() => {
    setIsPinConfirmationDirty(true);
  }, [setIsPinConfirmationDirty]);

  return (
    <BaseScreenComponent
      goBack={handleGoBack}
      contextualHelpMarkdown={contextualHelpMarkdown}
      faqCategories={["onboarding_pin", "unlock"]}
      headerTitle={I18n.t("onboarding.pin.headerTitle")}
    >
      <SafeAreaView style={styles.flex}>
        <ScrollView style={[IOStyles.horizontalContentPadding, { flex: 1 }]}>
          <>
            <H1>{I18n.t("onboarding.pin.title")}</H1>

            <View spacer small />

            <Body>{I18n.t("onboarding.pin.subTitle")}</Body>
          </>

          <View spacer extralarge />

          <LabelledItem
            label={I18n.t("onboarding.pin.pinLabel")}
            inputProps={{
              value: pin,
              onChangeText: setPin,
              keyboardType: "number-pad",
              maxLength: pinLength,
              onEndEditing: handlePinBlur
            }}
            isValid={isPinValid}
          />

          <View spacer extralarge />

          <LabelledItem
            label={I18n.t("onboarding.pin.pinConfirmationLabel")}
            inputProps={{
              value: pinConfirmation,
              onChangeText: setPinConfirmation,
              keyboardType: "number-pad",
              maxLength: pinLength,
              onEndEditing: handlePinConfirmationBlur
            }}
            isValid={isPinConfirmationValid}
          />
        </ScrollView>

        <>
          <BaseView style={IOStyles.horizontalContentPadding}>
            <InfoBox iconName={"io-titolare"} iconColor={IOColors.bluegrey}>
              <Label color={"bluegrey"} weight={"Regular"}>
                {I18n.t("onboarding.pin.tutorial")}
              </Label>
            </InfoBox>
          </BaseView>

          <View spacer />

          <FooterWithButtons
            type="SingleButton"
            leftButton={computedConfirmButtonProps}
          />
        </>
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default OnboardingPinScreen;
