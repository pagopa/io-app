import { Content, Text, View } from "native-base";
import * as React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { NavigationStackScreenProps } from "react-navigation-stack";
import Pinpad from "../../components/Pinpad";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../components/screens/BaseScreenComponent";
import I18n from "../../i18n";
import variables from "../../theme/variables";
import { PinString } from "../../types/PinString";
import { LightModalContextInterface } from "../../components/ui/LightModal";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import { confirmButtonProps } from "../../features/bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { useOnboardingAbortAlert } from "../../utils/hooks/useOnboardingAbortAlert";
import { InfoBox } from "../../components/box/InfoBox";
import { IOColors } from "../../components/core/variables/IOColors";
import { Label } from "../../components/core/typography/Label";
import ROUTES from "../../navigation/routes";

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
  },
  description: { lineHeight: 22 },
  footerContainer: {
    overflow: "hidden",
    marginTop: -variables.footerShadowOffsetHeight,
    paddingTop: variables.footerShadowOffsetHeight
  }
});

/**
 * A screen that allows the user to set the unlock code.
 */
const OnboardingPinScreen: React.FC<Props> = ({ navigation }) => {
  const [pin, setPin] = React.useState<PinString | null>(null);
  const onboardingAbortAlert = useOnboardingAbortAlert();

  const handleGoBack = () => {
    onboardingAbortAlert.showAlert();
  };

  const resetPin = () => setPin(null);

  const mainButtonProps = React.useMemo(
    () => ({
      ...confirmButtonProps(() => null, I18n.t("global.buttons.continue")),
      disabled: pin === null,
      onPress: () => navigation.navigate(ROUTES.ONBOARDING_PIN_CONFIRMATION)
    }),
    [pin, navigation]
  );

  return (
    <BaseScreenComponent
      goBack={handleGoBack}
      contextualHelpMarkdown={contextualHelpMarkdown}
      faqCategories={["onboarding_pin", "unlock"]}
      headerTitle={I18n.t("onboarding.unlockCode.headerTitle")}
    >
      <SafeAreaView style={styles.flex}>
        <Content>
          <>
            <Text style={styles.header} bold={true} dark={true}>
              {I18n.t("onboarding.unlockCode.contentTitle")}
            </Text>

            <Text dark={true}>
              {I18n.t("onboarding.unlockCode.contentSubtitle")}
            </Text>
          </>

          <View spacer large />

          <>
            <Pinpad
              inactiveColor={variables.brandLightGray}
              activeColor={variables.contentPrimaryBackground}
              onFulfill={setPin}
              onDeleteLastDigit={resetPin}
              buttonType={"light"}
            />
          </>

          <View spacer large />

          <>
            <InfoBox iconName={"io-titolare"} iconColor={IOColors.bluegrey}>
              <Label color={"bluegrey"} weight={"Regular"}>
                {I18n.t(
                  "profile.main.privacy.shareData.screen.profileSettings"
                )}
              </Label>
            </InfoBox>
          </>
        </Content>

        <FooterWithButtons type="SingleButton" leftButton={mainButtonProps} />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default OnboardingPinScreen;
