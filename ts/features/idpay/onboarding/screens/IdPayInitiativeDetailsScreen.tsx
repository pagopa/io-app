import {
  ContentWrapper,
  ForceScrollDownView,
  VSpacer
} from "@pagopa/io-app-design-system";
import { INonEmptyStringTag } from "@pagopa/ts-commons/lib/strings";
import { RouteProp, useRoute } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { useEffect } from "react";
import IOMarkdown from "../../../../components/IOMarkdown";
import ItemSeparatorComponent from "../../../../components/ItemSeparatorComponent";
import { withAppRequiredUpdate } from "../../../../components/helpers/withAppRequiredUpdate";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import I18n from "../../../../i18n";
import { useIOSelector } from "../../../../store/hooks";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { servicePreferenceResponseSuccessByIdSelector } from "../../../services/details/store/reducers";
import { isLoadingSelector } from "../../common/machine/selectors";
import { IdPayOnboardingDescriptionSkeleton } from "../components/IdPayOnboardingDescriptionSkeleton";
import { IdPayOnboardingPrivacyAdvice } from "../components/IdPayOnboardingPrivacyAdvice";
import { IdPayOnboardingServiceHeader } from "../components/IdPayOnboardingServiceHeader";
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

const IdPayInitiativeDetailsScreenComponent = () => {
  const { params } = useRoute<InitiativeDetailsScreenParamsRouteProps>();

  const { useActorRef, useSelector } = IdPayOnboardingMachineContext;
  const machine = useActorRef();

  const servicePreferenceResponseSuccess = useIOSelector(state =>
    servicePreferenceResponseSuccessByIdSelector(
      state,
      params.serviceId as string & INonEmptyStringTag
    )
  );

  useEffect(() => {
    if (params.serviceId !== undefined) {
      machine.send({
        type: "start-onboarding",
        serviceId: params.serviceId,
        hasInbox: servicePreferenceResponseSuccess?.value.inbox ?? false
      });
    }
  }, [machine, params, servicePreferenceResponseSuccess?.value.inbox]);

  const initiative = useSelector(selectInitiative);
  const isLoading = useSelector(isLoadingSelector);

  const handleGoBackPress = () => machine.send({ type: "close" });
  const handleContinuePress = () => machine.send({ type: "next" });

  const onboardingPrivacyAdvice = pipe(
    initiative,
    O.fold(
      () => null,
      ({ privacyLink, tcLink }) => (
        <IdPayOnboardingPrivacyAdvice
          privacyUrl={privacyLink}
          tosUrl={tcLink}
        />
      )
    )
  );

  const descriptionComponent = pipe(
    initiative,
    O.fold(
      () => <IdPayOnboardingDescriptionSkeleton />,
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
        <IdPayOnboardingServiceHeader initiative={initiative} />
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

export const IdPayInitiativeDetailsScreen = withAppRequiredUpdate(
  IdPayInitiativeDetailsScreenComponent,
  "idpay.onboarding"
);
