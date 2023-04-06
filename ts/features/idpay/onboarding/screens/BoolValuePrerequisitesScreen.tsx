import { useSelector } from "@xstate/react";
import React from "react";
import { SafeAreaView, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SelfDeclarationBoolDTO } from "../../../../../definitions/idpay/SelfDeclarationBoolDTO";
import { VSpacer } from "../../../../components/core/spacer/Spacer";
import { Body } from "../../../../components/core/typography/Body";
import { H1 } from "../../../../components/core/typography/H1";
import { Link } from "../../../../components/core/typography/Link";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import ListItemComponent from "../../../../components/screens/ListItemComponent";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import { useNavigationSwipeBackListener } from "../../../../hooks/useNavigationSwipeBackListener";
import I18n from "../../../../i18n";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { useOnboardingMachineService } from "../xstate/provider";
import {
  areAllSelfDeclarationsToggledSelector,
  boolRequiredCriteriaSelector,
  isLoadingSelector,
  selectSelfDeclarationBoolAnswers
} from "../xstate/selectors";

const InitiativeSelfDeclarationsScreen = () => {
  const machine = useOnboardingMachineService();

  const isLoading = useSelector(machine, isLoadingSelector);

  const selfCriteriaBool = useSelector(machine, boolRequiredCriteriaSelector);
  const selfCriteriaBoolAnswers = useSelector(
    machine,
    selectSelfDeclarationBoolAnswers
  );
  const areAllSelfCriteriaBoolAccepted = useSelector(
    machine,
    areAllSelfDeclarationsToggledSelector
  );

  const continueOnPress = () =>
    machine.send({ type: "ACCEPT_REQUIRED_BOOL_CRITERIA" });

  const goBackOnPress = () => machine.send({ type: "BACK" });

  const toggleCriteria =
    (criteria: SelfDeclarationBoolDTO) => (value: boolean) =>
      machine.send({
        type: "TOGGLE_BOOL_CRITERIA",
        criteria: { ...criteria, value }
      });

  const getSelfCriteriaBoolAnswer = (criteria: SelfDeclarationBoolDTO) =>
    selfCriteriaBoolAnswers[criteria.code] ?? false;

  useNavigationSwipeBackListener(() => {
    machine.send({ type: "BACK", skipNavigation: true });
  });

  return (
    <BaseScreenComponent
      headerTitle={I18n.t("idpay.onboarding.navigation.header")}
      goBack={goBackOnPress}
      contextualHelp={emptyContextualHelp}
    >
      <LoadingSpinnerOverlay isLoading={isLoading}>
        <SafeAreaView style={IOStyles.flex}>
          <ScrollView style={IOStyles.flex}>
            <View style={IOStyles.horizontalContentPadding}>
              <H1>{I18n.t("idpay.onboarding.boolPrerequisites.header")}</H1>
              <VSpacer size={16} />
              <Body>{I18n.t("idpay.onboarding.boolPrerequisites.body")}</Body>
              <Link>{I18n.t("idpay.onboarding.boolPrerequisites.link")}</Link>
              <VSpacer size={24} />
              {selfCriteriaBool.map((criteria, index) => (
                <View key={criteria.code}>
                  <ListItemComponent
                    key={index}
                    title={criteria.description}
                    switchValue={getSelfCriteriaBoolAnswer(criteria)}
                    accessibilityRole={"switch"}
                    accessibilityState={{
                      checked: getSelfCriteriaBoolAnswer(criteria)
                    }}
                    isLongPressEnabled={true}
                    onSwitchValueChanged={toggleCriteria(criteria)}
                  />
                  <VSpacer size={16} />
                </View>
              ))}
            </View>
          </ScrollView>
          <FooterWithButtons
            type={"TwoButtonsInlineHalf"}
            leftButton={{
              bordered: true,
              title: I18n.t("global.buttons.back"),
              onPress: goBackOnPress
            }}
            rightButton={{
              title: I18n.t("global.buttons.continue"),
              onPress: continueOnPress,
              disabled: !areAllSelfCriteriaBoolAccepted
            }}
          />
        </SafeAreaView>
      </LoadingSpinnerOverlay>
    </BaseScreenComponent>
  );
};

export default InitiativeSelfDeclarationsScreen;
