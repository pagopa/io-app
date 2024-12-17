import {
  Body,
  FooterActionsInline,
  H2,
  VSpacer
} from "@pagopa/io-app-design-system";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SelfDeclarationBoolDTO } from "../../../../../definitions/idpay/SelfDeclarationBoolDTO";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import ListItemComponent from "../../../../components/screens/ListItemComponent";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import I18n from "../../../../i18n";
import { dpr28Dec2000Url } from "../../../../urls";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { openWebUrl } from "../../../../utils/url";
import { isLoadingSelector } from "../../common/machine/selectors";
import { IdPayOnboardingMachineContext } from "../machine/provider";
import {
  areAllSelfDeclarationsToggledSelector,
  boolRequiredCriteriaSelector,
  selectSelfDeclarationBoolAnswers
} from "../machine/selectors";

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
          <H2>{I18n.t("idpay.onboarding.boolPrerequisites.header")}</H2>
          <VSpacer size={16} />
          <Body>{I18n.t("idpay.onboarding.boolPrerequisites.body")}</Body>
          <Body
            weight="Semibold"
            asLink
            onPress={() => openWebUrl(dpr28Dec2000Url)}
          >
            {I18n.t("idpay.onboarding.boolPrerequisites.link")}
          </Body>
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
      <FooterActionsInline
        startAction={{
          color: "primary",
          label: I18n.t("global.buttons.back"),
          onPress: goBackOnPress
        }}
        endAction={{
          label: I18n.t("global.buttons.continue"),
          onPress: continueOnPress,
          disabled: !areAllSelfCriteriaBoolAccepted
        }}
      />
    </LoadingSpinnerOverlay>
  );
};

export default InitiativeSelfDeclarationsScreen;
