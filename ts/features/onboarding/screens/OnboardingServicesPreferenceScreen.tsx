import {
  Banner,
  ContentWrapper,
  VSpacer,
  useIOToast
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { ReactElement, useCallback, useEffect, useState } from "react";
import { SafeAreaView } from "react-native";
import I18n from "i18next";
import { ServicesPreferencesModeEnum } from "../../../../definitions/backend/ServicesPreferencesMode";
import LoadingSpinnerOverlay from "../../../components/LoadingSpinnerOverlay";
import {
  IOStackNavigationRouteProps,
  useIONavigation
} from "../../../navigation/params/AppParamsList";
import { OnboardingParamsList } from "../navigation/params/OnboardingParamsList";
import ROUTES from "../../../navigation/routes";
import { servicesOptinCompleted } from "../store/actions";
import { profileUpsert } from "../../settings/common/store/actions";
import { useIODispatch, useIOSelector, useIOStore } from "../../../store/hooks";
import {
  profileSelector,
  profileServicePreferencesModeSelector
} from "../../settings/common/store/selectors";
import { isServicesPreferenceModeSet } from "../../settings/common/store/utils/guards";
import { getFlowType } from "../../../utils/analytics";
import { emptyContextualHelp } from "../../../utils/contextualHelp";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import { usePrevious } from "../../../utils/hooks/usePrevious";
import {
  trackServiceConfiguration,
  trackServiceConfigurationScreen
} from "../../settings/common/analytics";
import { useManualConfigBottomSheet } from "../../settings/preferences/shared/hooks/useManualConfigBottomSheet";
import ServicesContactComponent from "../../settings/preferences/shared/components/ServicesContactComponent";
import { IOScrollViewWithLargeHeader } from "../../../components/ui/IOScrollViewWithLargeHeader";

export type OnboardingServicesPreferenceScreenNavigationParams = {
  isFirstOnboarding: boolean;
};
type Props = IOStackNavigationRouteProps<
  OnboardingParamsList,
  "ONBOARDING_SERVICES_PREFERENCE"
>;

const OnboardingServicesPreferenceScreen = (props: Props): ReactElement => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();
  const toast = useIOToast();
  const isFirstOnboarding = props.route.params.isFirstOnboarding;
  const store = useIOStore();
  const profile = useIOSelector(profileSelector);
  const prevProfile = usePrevious(profile);
  const isLoading = pot.isUpdating(profile) || pot.isLoading(profile);
  const profileServicePreferenceMode = useIOSelector(
    profileServicePreferencesModeSelector
  );
  const prevMode = usePrevious(profileServicePreferenceMode);

  // if the user is not new and he/she hasn't a preference set, pre-set with AUTO mode
  const mode = profileServicePreferenceMode;
  const [modeSelected, setModeSelected] = useState<
    ServicesPreferencesModeEnum | undefined
  >(mode);

  const dispatchServicesOptinCompleted = useCallback(
    () => dispatch(servicesOptinCompleted()),
    [dispatch]
  );

  const onServicePreferenceSelected = useCallback(
    (mode: ServicesPreferencesModeEnum) =>
      dispatch(
        profileUpsert.request({ service_preferences_settings: { mode } })
      ),
    [dispatch]
  );

  const navigateToOnboardingServicePreferenceComplete = useCallback(() => {
    navigation.navigate(ROUTES.ONBOARDING, {
      screen: ROUTES.ONBOARDING_SERVICES_PREFERENCE_COMPLETE
    });
  }, [navigation]);

  const onContinue = useCallback(
    (isFirstOnboarding: boolean) =>
      // if the user is not new, navigate to the thank-you screen
      !isFirstOnboarding
        ? navigateToOnboardingServicePreferenceComplete()
        : dispatchServicesOptinCompleted(),
    [
      dispatchServicesOptinCompleted,
      navigateToOnboardingServicePreferenceComplete
    ]
  );

  const handleOnContinue = useCallback(() => {
    void trackServiceConfiguration(
      profileServicePreferenceMode,
      getFlowType(true, isFirstOnboarding),
      store.getState()
    );
    onContinue(isFirstOnboarding);
    toast.hideAll();
  }, [
    isFirstOnboarding,
    onContinue,
    profileServicePreferenceMode,
    store,
    toast
  ]);

  const selectCurrentMode = useCallback(
    (mode: ServicesPreferencesModeEnum) => {
      onServicePreferenceSelected(mode);
    },
    [onServicePreferenceSelected]
  );

  const { present: confirmManualConfig, manualConfigBottomSheet } =
    useManualConfigBottomSheet(() => {
      selectCurrentMode(ServicesPreferencesModeEnum.MANUAL);
    });

  const handleOnSelectMode = useCallback(
    (mode: ServicesPreferencesModeEnum) => {
      // if user's choice is 'manual', open bottom sheet to ask confirmation
      if (mode === ServicesPreferencesModeEnum.MANUAL) {
        confirmManualConfig();
        return;
      }
      selectCurrentMode(mode);
    },
    [confirmManualConfig, selectCurrentMode]
  );

  useOnFirstRender(() => {
    trackServiceConfigurationScreen(getFlowType(true, isFirstOnboarding));
  });

  useEffect(() => {
    // show error toast only when the profile updating fails
    // otherwise, if the profile is in error state,
    // the toast will be shown immediately without any updates
    if (prevProfile && !pot.isError(prevProfile) && pot.isError(profile)) {
      toast.error(I18n.t("global.genericError"));
      return;
    }

    // if profile preferences are updated correctly
    // the button is selected
    // and the success banner is shown
    if (
      prevProfile &&
      pot.isUpdating(prevProfile) &&
      pot.isSome(profile) &&
      profileServicePreferenceMode !== prevMode
    ) {
      setModeSelected(profileServicePreferenceMode);
      toast.hideAll();
      toast.success(
        profileServicePreferenceMode === ServicesPreferencesModeEnum.MANUAL
          ? I18n.t("services.optIn.preferences.manualConfig.successAlert")
          : I18n.t("services.optIn.preferences.quickConfig.successAlert")
      );
    }
  }, [prevMode, prevProfile, profile, profileServicePreferenceMode, toast]);

  // show a badge when the user is not new
  // As explained in this comment (https://pagopa.atlassian.net/browse/IOPID-1511?focusedCommentId=126354)
  // a future feature will be need this value,
  // so I didn't delete it even though it is not used
  const showBadge = !isFirstOnboarding;
  return (
    <LoadingSpinnerOverlay isLoading={isLoading}>
      <IOScrollViewWithLargeHeader
        title={{
          label: I18n.t("services.optIn.preferences.title")
        }}
        canGoback={false}
        description={I18n.t("services.optIn.preferences.body")}
        headerActionsProp={{ showHelp: true }}
        contextualHelp={emptyContextualHelp}
        actions={{
          type: "SingleButton",
          primary: {
            label: I18n.t("global.buttons.confirm"),
            onPress: handleOnContinue,
            accessibilityLabel: I18n.t("global.buttons.confirm"),
            disabled: !isServicesPreferenceModeSet(modeSelected)
          }
        }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <ContentWrapper>
            <ServicesContactComponent
              mode={modeSelected}
              onSelectMode={handleOnSelectMode}
              showBadge={showBadge}
            />
            <VSpacer size={16} />
            <Banner
              color="neutral"
              pictogramName="settings"
              content={I18n.t("services.optIn.preferences.banner")}
            />
          </ContentWrapper>
          {manualConfigBottomSheet}
        </SafeAreaView>
      </IOScrollViewWithLargeHeader>
    </LoadingSpinnerOverlay>
  );
};

export default OnboardingServicesPreferenceScreen;
