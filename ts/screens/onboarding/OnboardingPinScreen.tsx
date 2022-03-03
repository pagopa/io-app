import { View } from "native-base";
import * as React from "react";
import {
  SafeAreaView,
  StyleSheet,
  View as BaseView,
  ScrollView
} from "react-native";
import { NavigationStackScreenProps } from "react-navigation-stack";
import { useDispatch, useSelector } from "react-redux";
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
import { safeSetPin } from "../../utils/keychain";
import { PinString } from "../../types/PinString";
import {
  assistanceToolRemoteConfig,
  handleSendAssistanceLog
} from "../../utils/supportAssistance";
import { TypeLogs } from "../../boot/configureInstabug";
import { assistanceToolConfigSelector } from "../../store/reducers/backendStatus";
import { createPinSuccess } from "../../store/actions/pinset";

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
const instabuglogTag = "pin-creation";

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
  const assistanceToolConfig = useSelector(assistanceToolConfigSelector);
  const dispatch = useDispatch();

  const assistanceTool = React.useMemo(
    () => assistanceToolRemoteConfig(assistanceToolConfig),
    [assistanceToolConfig]
  );

  const handleGoBack = () => {
    onboardingAbortAlert.showAlert();
  };

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

    void safeSetPin(typedPin)
      .fold(
        error => {
          handleSendAssistanceLog(
            assistanceTool,
            `setPin error ${error}`,
            TypeLogs.DEBUG,
            instabuglogTag
          );

          // TODO: Here we should show an error to the
          // user probably.
        },
        () => {
          handleSendAssistanceLog(
            assistanceTool,
            `createPinSuccess`,
            TypeLogs.DEBUG,
            instabuglogTag
          );

          dispatch(createPinSuccess(typedPin));
        }
      )
      .run();
  }, [pin, assistanceTool, isFormValid, dispatch]);

  const computedConfirmButtonProps = React.useMemo(
    () => ({
      ...confirmButtonProps(() => null, I18n.t("global.buttons.continue")),
      disabled: !isFormValid,
      onPress: handleSubmit
    }),
    [isFormValid, handleSubmit]
  );

  return (
    <BaseScreenComponent
      goBack={handleGoBack}
      contextualHelpMarkdown={contextualHelpMarkdown}
      faqCategories={["onboarding_pin", "unlock"]}
      headerTitle={I18n.t("onboarding.pin.headerTitle")}
    >
      <SafeAreaView style={styles.flex}>
        <ScrollView style={[IOStyles.horizontalContentPadding, { flex: 1 }]}>
          <View spacer small />

          <H1>{I18n.t("onboarding.pin.title")}</H1>

          <View spacer small />

          <Body>{I18n.t("onboarding.pin.subTitle")}</Body>

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
            icon={!isPinValid ? "io-warning" : undefined}
            iconColor={IOColors.red}
            iconPosition="right"
            isValid={isPinValid ? undefined : false}
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
            icon={!isPinConfirmationValid ? "io-warning" : undefined}
            iconColor={IOColors.red}
            iconPosition="right"
            isValid={isPinConfirmationValid ? undefined : false}
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
