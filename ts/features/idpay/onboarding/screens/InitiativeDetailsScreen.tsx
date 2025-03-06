import {
  ContentWrapper,
  ForceScrollDownView,
  VSpacer
} from "@pagopa/io-app-design-system";
import { RouteProp, useRoute } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { useEffect } from "react";
import IOMarkdown from "../../../../components/IOMarkdown";
import ItemSeparatorComponent from "../../../../components/ItemSeparatorComponent";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import I18n from "../../../../i18n";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { isLoadingSelector } from "../../common/machine/selectors";
import { OnboardingDescriptionMarkdownSkeleton } from "../components/OnboardingDescriptionMarkdown";
import { OnboardingPrivacyAdvice } from "../components/OnboardingPrivacyAdvice";
import { OnboardingServiceHeader } from "../components/OnboardingServiceHeader";
import { IdPayOnboardingMachineContext } from "../machine/provider";
import { selectInitiative } from "../machine/selectors";
import { IdPayOnboardingParamsList } from "../navigation/params";

export type InitiativeDetailsScreenParams = {
  serviceId?: string;
};

type InitiativeDetailsScreenParamsRouteProps = RouteProp<
  IdPayOnboardingParamsList,
  "IDPAY_ONBOARDING_INITIATIVE_DETAILS"
>;

export const InitiativeDetailsScreen = () => {
  const { params } = useRoute<InitiativeDetailsScreenParamsRouteProps>();

  const { useActorRef, useSelector } = IdPayOnboardingMachineContext;
  const machine = useActorRef();

  useEffect(() => {
    if (params.serviceId !== undefined) {
      machine.send({
        type: "start-onboarding",
        serviceId: params.serviceId
      });
    }
  }, [machine, params]);

  const initiative = useSelector(selectInitiative);
  const isLoading = useSelector(isLoadingSelector);

  const handleGoBackPress = () => machine.send({ type: "close" });
  const handleContinuePress = () => machine.send({ type: "next" });

  const onboardingPrivacyAdvice = pipe(
    initiative,
    O.fold(
      () => null,
      ({ privacyLink, tcLink }) => (
        <OnboardingPrivacyAdvice privacyUrl={privacyLink} tosUrl={tcLink} />
      )
    )
  );

  const descriptionComponent = pipe(
    initiative,
    O.fold(
      () => <OnboardingDescriptionMarkdownSkeleton />,
      ({ description }) => <IOMarkdown content={description} />
    )
  );

  useHeaderSecondLevel({
    title: I18n.t("idpay.onboarding.headerTitle"),
    contextualHelp: emptyContextualHelp,
    goBack: handleGoBackPress,
    supportRequest: true
  });

  return (
    <ForceScrollDownView
      contentContainerStyle={{ flexGrow: 1 }}
      footerActions={{
        actions: {
          type: "SingleButton",
          primary: {
            label: I18n.t("global.buttons.continue"),
            onPress: handleContinuePress,
            testID: "IDPayOnboardingContinue",
            loading: isLoading,
            disabled: isLoading
          }
        }
      }}
    >
      <ContentWrapper>
        <VSpacer size={24} />
        <OnboardingServiceHeader initiative={initiative} />
        <VSpacer size={24} />
        {descriptionComponent}
        <VSpacer size={8} />
        <ItemSeparatorComponent noPadded={true} />
        <VSpacer size={16} />
        {onboardingPrivacyAdvice}
      </ContentWrapper>
    </ForceScrollDownView>
  );
};
