import {
  Divider,
  IOToast,
  ListItemSwitch,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import I18n from "i18next";
import { View } from "react-native";
import { _typeEnum as SelfConsentBoolTypeEnum } from "../../../../../definitions/idpay/SelfConsentBoolDTO";
import { SelfCriteriaBoolDTO } from "../../../../../definitions/idpay/SelfCriteriaBoolDTO";
import IOMarkdown from "../../../../components/IOMarkdown";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { emptyContextualHelp } from "../../../../utils/help";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { isLoadingSelector } from "../../common/machine/selectors";
import {
  trackIDPayOnboardingAlert,
  trackIDPayOnboardingSelfDeclaration
} from "../analytics";
import IdPayOnboardingStepper from "../components/IdPayOnboardingStepper";
import { IdPayOnboardingMachineContext } from "../machine/provider";
import {
  areAllSelfDeclarationsToggledSelector,
  boolRequiredCriteriaSelector,
  selectInitiative,
  selectSelfDeclarationBoolAnswers
} from "../machine/selectors";

const IdPayBoolValuePrerequisitesScreen = () => {
  const { useActorRef, useSelector } = IdPayOnboardingMachineContext;
  const machine = useActorRef();

  const initiative = useSelector(selectInitiative);

  const initiativeName = pipe(
    initiative,
    O.map(i => i.initiativeName),
    O.toUndefined
  );

  const initiativeId = pipe(
    initiative,
    O.map(i => i.initiativeId),
    O.getOrElse(() => "")
  );

  const isLoading = useSelector(isLoadingSelector);

  const selfCriteriaBool = useSelector(boolRequiredCriteriaSelector);
  const selfCriteriaBoolAnswers = useSelector(selectSelfDeclarationBoolAnswers);
  const areAllSelfCriteriaBoolAccepted = useSelector(
    areAllSelfDeclarationsToggledSelector
  );

  const continueOnPress = () => {
    if (!areAllSelfCriteriaBoolAccepted) {
      IOToast.error(
        I18n.t("idpay.onboarding.boolPrerequisites.emptyValueError")
      );
      trackIDPayOnboardingAlert({
        screen: "intent_declaration",
        initiativeId,
        initiativeName
      });
      return;
    }
    machine.send({ type: "next" });
  };

  const goBackOnPress = () => machine.send({ type: "back" });

  const toggleCriteria =
    (criteria: SelfCriteriaBoolDTO) => (value: boolean) => {
      if (!criteria.code) {
        return;
      }

      machine.send({
        type: "toggle-bool-criteria",
        criteria: {
          _type: SelfConsentBoolTypeEnum.boolean,
          code: criteria.code,
          accepted: value
        }
      });
    };

  const getSelfCriteriaBoolAnswer = (criteria: SelfCriteriaBoolDTO) =>
    criteria.code ? selfCriteriaBoolAnswers[criteria.code] ?? false : false;

  const selfCriteriaBoolSubtitle = selfCriteriaBool[0]?.subDescription;

  useOnFirstRender(() =>
    trackIDPayOnboardingSelfDeclaration({
      initiativeId,
      initiativeName
    })
  );

  return (
    <IOScrollViewWithLargeHeader
      topElement={<IdPayOnboardingStepper />}
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
          onPress: continueOnPress
        }
      }}
      includeContentMargins
    >
      <LoadingSpinnerOverlay isLoading={isLoading}>
        {selfCriteriaBoolSubtitle && (
          <>
            <IOMarkdown content={selfCriteriaBoolSubtitle} />
            <VSpacer size={16} />
          </>
        )}
        {selfCriteriaBool.map((criteria, index) => (
          <View key={criteria.code}>
            <ListItemSwitch
              label={criteria.description ?? ""}
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

export default IdPayBoolValuePrerequisitesScreen;
