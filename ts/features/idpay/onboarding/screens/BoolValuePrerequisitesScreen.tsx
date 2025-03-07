import { Divider, ListItemSwitch } from "@pagopa/io-app-design-system";
import { View } from "react-native";
import { SelfDeclarationBoolDTO } from "../../../../../definitions/idpay/SelfDeclarationBoolDTO";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import I18n from "../../../../i18n";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
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

  return (
    <IOScrollViewWithLargeHeader
      title={{
        label: I18n.t("idpay.onboarding.boolPrerequisites.header"),
        section: I18n.t("idpay.onboarding.navigation.header")
      }}
      goBack={goBackOnPress}
      contextualHelp={emptyContextualHelp}
      headerActionsProp={{ showHelp: true }}
      actions={{
        type: "SingleButton",
        primary: {
          label: I18n.t("global.buttons.continue"),
          onPress: continueOnPress,
          disabled: !areAllSelfCriteriaBoolAccepted
        }
      }}
      includeContentMargins
    >
      <LoadingSpinnerOverlay isLoading={isLoading}>
        {selfCriteriaBool.map((criteria, index) => (
          <View key={criteria.code}>
            <ListItemSwitch
              label={criteria.description}
              onSwitchValueChange={toggleCriteria(criteria)}
              value={getSelfCriteriaBoolAnswer(criteria)}
            />
            {index !== selfCriteriaBool.length - 1 && <Divider />}
          </View>
        ))}
      </LoadingSpinnerOverlay>
    </IOScrollViewWithLargeHeader>
  );
};

export default InitiativeSelfDeclarationsScreen;
