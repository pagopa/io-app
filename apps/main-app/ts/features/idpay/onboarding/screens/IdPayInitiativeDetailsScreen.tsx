import {
  ContentWrapper,
  ForceScrollDownView,
  VSpacer
} from "@pagopa/io-app-design-system";
import { INonEmptyStringTag } from "@pagopa/ts-commons/lib/strings";
import { RouteProp, useLinkTo, useRoute } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import I18n from "i18next";
import { useEffect } from "react";
import { ServiceId } from "../../../../../definitions/services/ServiceId";
import IOMarkdown from "../../../../components/IOMarkdown";
import { withAppRequiredUpdate } from "../../../../components/helpers/withAppRequiredUpdate";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { generateMessagesAndServicesRules } from "../../../common/components/IOMarkdown/customRules";
import { loadServicePreference } from "../../../services/details/store/actions/preference";
import { servicePreferenceResponseSuccessByIdSelector } from "../../../services/details/store/selectors";
import { IdPayEnabledSubFeatureGuard } from "../../common/components/IdPayEnabledFeatureFlagGuard";
import { isLoadingSelector } from "../../common/machine/selectors";
import {
  trackIDPayOnboardingAppUpdateConfirm,
  trackIDPayOnboardingAppUpdateRequired,
  trackIDPayOnboardingIntro,
  trackIDPayOnboardingStart
} from "../analytics";
import { IdPayOnboardingDescriptionSkeleton } from "../components/IdPayOnboardingDescriptionSkeleton";
import { IdPayOnboardingServiceHeader } from "../components/IdPayOnboardingServiceHeader";
import { IdPayOnboardingMachineContext } from "../machine/provider";
import { selectInitiative } from "../machine/selectors";
import { IdPayOnboardingParamsList } from "../navigation/params";
import { generateSmallTosMarkdownRules } from "../utils/markdown";

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
  const dispatch = useIODispatch();

  const servicePreferenceResponseSuccess = useIOSelector(state =>
    servicePreferenceResponseSuccessByIdSelector(
      state,
      params.serviceId as string & INonEmptyStringTag
    )
  );

  useEffect(() => {
    if (params.serviceId !== undefined) {
      dispatch(loadServicePreference.request(params.serviceId as ServiceId));
      machine.send({
        type: "start-onboarding",
        serviceId: params.serviceId,
        hasInbox: servicePreferenceResponseSuccess?.value.inbox ?? false
      });
    }
  }, [
    dispatch,
    machine,
    params,
    servicePreferenceResponseSuccess?.value.inbox
  ]);

  const initiative = useSelector(selectInitiative);
  const isLoading = useSelector(isLoadingSelector);

  const handleGoBackPress = () => machine.send({ type: "close" });
  const handleContinuePress = () => {
    trackIDPayOnboardingStart({ initiativeId });
    machine.send({ type: "next" });
  };

  const onboardingPrivacyAdvice = pipe(
    initiative,
    O.fold(
      () => null,
      ({ privacyLink, tcLink }) => (
        <IOMarkdown
          content={I18n.t("idpay.onboarding.beforeContinue.text", {
            privacyUrl: privacyLink,
            tosUrl: tcLink
          })}
          rules={generateSmallTosMarkdownRules(linkTo)}
        />
      )
    )
  );

  const linkTo = useLinkTo();

  const descriptionComponent = pipe(
    initiative,
    O.fold(
      () => <IdPayOnboardingDescriptionSkeleton />,
      ({ description }) => (
        <IOMarkdown
          content={description}
          rules={generateMessagesAndServicesRules(linkTo)}
        />
      )
    )
  );

  const initiativeId = pipe(
    initiative,
    O.map(i => i.initiativeId),
    O.toUndefined
  );

  useHeaderSecondLevel({
    title: "",
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
            label: I18n.t("idpay.onboarding.beforeContinue.requestBonus"),
            onPress: handleContinuePress,
            testID: "IDPayOnboardingContinue",
            loading: isLoading,
            disabled: isLoading
          }
        }
      }}
    >
      <IdPayOnboardingServiceHeader initiative={initiative} />
      <ContentWrapper>
        <VSpacer size={16} />
        {descriptionComponent}
        <VSpacer size={32} />
        {onboardingPrivacyAdvice}
      </ContentWrapper>
    </ForceScrollDownView>
  );
};

export const IdPayInitiativeDetailsScreen = () => {
  const { useSelector } = IdPayOnboardingMachineContext;
  const initiative = useSelector(selectInitiative);

  const initiativeId = pipe(
    initiative,
    O.map(i => i.initiativeId),
    O.toUndefined
  );

  const IdPayInitiativeDetails = () => (
    <IdPayEnabledSubFeatureGuard featureKey="idpay.onboarding">
      <IdPayInitiativeDetailsScreenComponent />
    </IdPayEnabledSubFeatureGuard>
  );

  useOnFirstRender(
    () => trackIDPayOnboardingIntro({ initiativeId }),
    () => O.isSome(initiative)
  );

  const WrappedComponent = withAppRequiredUpdate(
    IdPayInitiativeDetails,
    "idpay.onboarding",
    {
      onConfirm: () =>
        trackIDPayOnboardingAppUpdateConfirm({
          initiativeId
        }),
      onLanding: () =>
        trackIDPayOnboardingAppUpdateRequired({
          initiativeId
        })
    }
  );
  return <WrappedComponent />;
};
