import { VSpacer } from "@pagopa/io-app-design-system";
import React from "react";
import { SafeAreaView, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SelfDeclarationBoolDTO } from "../../../../../definitions/idpay/SelfDeclarationBoolDTO";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { Body } from "../../../../components/core/typography/Body";
import { H1 } from "../../../../components/core/typography/H1";
import { Link } from "../../../../components/core/typography/Link";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import ListItemComponent from "../../../../components/screens/ListItemComponent";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import { useNavigationSwipeBackListener } from "../../../../hooks/useNavigationSwipeBackListener";
import I18n from "../../../../i18n";
import { dpr28Dec2000Url } from "../../../../urls";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { openWebUrl } from "../../../../utils/url";
import { IdPayOnboardingMachineContext } from "../machine/provider";
import {
  areAllSelfDeclarationsToggledSelector,
  boolRequiredCriteriaSelector,
  selectSelfDeclarationBoolAnswers
} from "../machine/selectors";
import { isLoadingSelector } from "../../../../xstate/selectors";

const InitiativeSelfDeclarationsScreen = () => {
  const { useActorRef, useSelector } = IdPayOnboardingMachineContext;
  const machine = useActorRef();

  const isLoading = useSelector(isLoadingSelector);

  const selfCriteriaBool = useSelector(boolRequiredCriteriaSelector);
  const selfCriteriaBoolAnswers = useSelector(selectSelfDeclarationBoolAnswers);
  const areAllSelfCriteriaBoolAccepted = useSelector(
    areAllSelfDeclarationsToggledSelector
  );

  const continueOnPress = () => machine.send({ type: "next" });
  const goBackOnPress = () => machine.send({ type: "back" });

  const toggleCriteria =
    (criteria: SelfDeclarationBoolDTO) => (value: boolean) =>
      machine.send({
        type: "toggle-bool-criteria",
        criteria: { ...criteria, value }
      });

  const getSelfCriteriaBoolAnswer = (criteria: SelfDeclarationBoolDTO) =>
    selfCriteriaBoolAnswers[criteria.code] ?? false;

  useNavigationSwipeBackListener(() => {
    machine.send({ type: "back", skipNavigation: true });
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
