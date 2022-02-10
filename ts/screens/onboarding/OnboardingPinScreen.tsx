import { Content, Text } from "native-base";
import * as React from "react";
import { Alert, SafeAreaView, StyleSheet } from "react-native";
import { NavigationStackScreenProps } from "react-navigation-stack";
import { useDispatch } from "react-redux";
import Pinpad from "../../components/Pinpad";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../components/screens/BaseScreenComponent";
import I18n from "../../i18n";
import { abortOnboarding } from "../../store/actions/onboarding";
import variables from "../../theme/variables";
import { PinString } from "../../types/PinString";
import { isOnboardingCompleted } from "../../utils/navigation";
import { LightModalContextInterface } from "../../components/ui/LightModal";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import { confirmButtonProps } from "../../features/bonus/bonusVacanze/components/buttons/ButtonConfigurations";

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
const PinScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch();

  const executeAbortOnboarding = () => {
    dispatch(abortOnboarding());
  };

  const handleGoBack = () => {
    if (isOnboardingCompleted()) {
      navigation.goBack(null);
      return;
    }

    Alert.alert(
      I18n.t("onboarding.alert.title"),
      I18n.t("onboarding.alert.description"),
      [
        {
          text: I18n.t("global.buttons.cancel"),
          style: "cancel"
        },
        {
          text: I18n.t("global.buttons.exit"),
          style: "default",
          onPress: executeAbortOnboarding
        }
      ]
    );
  };

  const onPinFulfill = (_code: PinString, _isValid: boolean) => null;

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

          <>
            <Pinpad
              inactiveColor={variables.brandLightGray}
              activeColor={variables.contentPrimaryBackground}
              onFulfill={onPinFulfill}
              buttonType={"light"}
            />
          </>
        </Content>

        <FooterWithButtons
          type="SingleButton"
          leftButton={{
            ...confirmButtonProps(() => null, I18n.t("global.buttons.continue"))
          }}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default PinScreen;
