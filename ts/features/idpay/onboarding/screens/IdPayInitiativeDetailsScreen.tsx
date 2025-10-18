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
import I18n from "i18next";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import IOMarkdown from "../../../../components/IOMarkdown";
import { withAppRequiredUpdate } from "../../../../components/helpers/withAppRequiredUpdate";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { loadServicePreference } from "../../../services/details/store/actions/preference";
import { servicePreferenceResponseSuccessByIdSelector } from "../../../services/details/store/selectors";
import { isLoadingSelector } from "../../common/machine/selectors";
import { IdPayOnboardingDescriptionSkeleton } from "../components/IdPayOnboardingDescriptionSkeleton";
import { IdPayOnboardingServiceHeader } from "../components/IdPayOnboardingServiceHeader";
import { IdPayOnboardingMachineContext } from "../machine/provider";
import { selectInitiative } from "../machine/selectors";
import { IdPayOnboardingParamsList } from "../navigation/params";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import {
  trackIDPayOnboardingAppUpdateConfirm,
  trackIDPayOnboardingAppUpdateRequired,
  trackIDPayOnboardingIntro,
  trackIDPayOnboardingStart
} from "../analytics";

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
    trackIDPayOnboardingStart({ initiativeName, initiativeId });
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

  const initiativeName = pipe(
    initiative,
    O.map(i => i.initiativeName),
    O.toUndefined
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
        <VSpacer size={24} />
        {onboardingPrivacyAdvice}
      </ContentWrapper>
    </ForceScrollDownView>
  );
};

export const IdPayInitiativeDetailsScreen = () => {
  const { useSelector } = IdPayOnboardingMachineContext;
  const initiative = useSelector(selectInitiative);

  const initiativeName = pipe(
    initiative,
    O.map(i => i.initiativeName),
    O.toUndefined
  );

  const initiativeId = pipe(
    initiative,
    O.map(i => i.initiativeId),
    O.toUndefined
  );

  useOnFirstRender(() =>
    trackIDPayOnboardingIntro({ initiativeName, initiativeId })
  );

  const WrappedComponent = withAppRequiredUpdate(
    IdPayInitiativeDetailsScreenComponent,
    "idpay.onboarding",
    {
      onConfirm: () =>
        trackIDPayOnboardingAppUpdateConfirm({
          initiativeName,
          initiativeId
        }),
      onLanding: () =>
        trackIDPayOnboardingAppUpdateRequired({
          initiativeName,
          initiativeId
        })
    }
  );
  return <WrappedComponent />;
};
