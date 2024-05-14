import { FooterWithButtons, VSpacer } from "@pagopa/io-app-design-system";
import { useSelector } from "@xstate/react";
import React from "react";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SelfDeclarationBoolDTO } from "../../../../../definitions/idpay/SelfDeclarationBoolDTO";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { Body } from "../../../../components/core/typography/Body";
import { H1 } from "../../../../components/core/typography/H1";
import { Link } from "../../../../components/core/typography/Link";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import ListItemComponent from "../../../../components/screens/ListItemComponent";
import { useNavigationSwipeBackListener } from "../../../../hooks/useNavigationSwipeBackListener";
import I18n from "../../../../i18n";
import { dpr28Dec2000Url } from "../../../../urls";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { openWebUrl } from "../../../../utils/url";
import { useOnboardingMachineService } from "../xstate/provider";
import {
  areAllSelfDeclarationsToggledSelector,
  boolRequiredCriteriaSelector,
  isLoadingSelector,
  selectSelfDeclarationBoolAnswers
} from "../xstate/selectors";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";

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

  useHeaderSecondLevel({
    title: I18n.t("idpay.onboarding.navigation.header"),
    contextualHelp: emptyContextualHelp,
    goBack: goBackOnPress,
    supportRequest: true
  });

  return (
    <LoadingSpinnerOverlay isLoading={isLoading}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={IOStyles.horizontalContentPadding}>
          <H1>{I18n.t("idpay.onboarding.boolPrerequisites.header")}</H1>
          <VSpacer size={16} />
          <Body>{I18n.t("idpay.onboarding.boolPrerequisites.body")}</Body>
          <Link onPress={() => openWebUrl(dpr28Dec2000Url)}>
            {I18n.t("idpay.onboarding.boolPrerequisites.link")}
          </Link>
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
        type="TwoButtonsInlineHalf"
        primary={{
          type: "Outline",
          buttonProps: {
            label: I18n.t("global.buttons.back"),
            accessibilityLabel: I18n.t("global.buttons.back"),
            onPress: goBackOnPress
          }
        }}
        secondary={{
          type: "Solid",
          buttonProps: {
            label: I18n.t("global.buttons.continue"),
            accessibilityLabel: I18n.t("global.buttons.continue"),
            onPress: continueOnPress,
            disabled: !areAllSelfCriteriaBoolAccepted
          }
        }}
      />
    </LoadingSpinnerOverlay>
  );
};

export default InitiativeSelfDeclarationsScreen;
