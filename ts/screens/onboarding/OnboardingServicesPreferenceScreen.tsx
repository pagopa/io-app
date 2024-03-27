import {
  ContentWrapper,
  FeatureInfo,
  FooterWithButtons,
  IOStyles,
  IOToast,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import React, { ReactElement, useCallback, useEffect, useState } from "react";
import { SafeAreaView, View } from "react-native";
import { ServicesPreferencesModeEnum } from "../../../definitions/backend/ServicesPreferencesMode";
import { RNavScreenWithLargeHeader } from "../../components/ui/RNavScreenWithLargeHeader";
import I18n from "../../i18n";
import {
  IOStackNavigationRouteProps,
  useIONavigation
} from "../../navigation/params/AppParamsList";
import { OnboardingParamsList } from "../../navigation/params/OnboardingParamsList";
import { servicesOptinCompleted } from "../../store/actions/onboarding";
import { profileUpsert } from "../../store/actions/profile";
import {
  isServicesPreferenceModeSet,
  profileSelector,
  profileServicePreferencesModeSelector
} from "../../store/reducers/profile";
import { getFlowType } from "../../utils/analytics";
import { emptyContextualHelp } from "../../utils/emptyContextualHelp";
import { useOnFirstRender } from "../../utils/hooks/useOnFirstRender";
import {
  trackServiceConfiguration,
  trackServiceConfigurationScreen
} from "../profile/analytics";
import { useManualConfigBottomSheet } from "../profile/components/services/ManualConfigBottomSheet";
import ServicesContactComponent from "../profile/components/services/ServicesContactComponent";
import { useIODispatch, useIOSelector, useIOStore } from "../../store/hooks";
import LoadingSpinnerOverlay from "../../components/LoadingSpinnerOverlay";
import { usePrevious } from "../../utils/hooks/usePrevious";
import ROUTES from "../../navigation/routes";

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
  }, [isFirstOnboarding, onContinue, profileServicePreferenceMode, store]);

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
      IOToast.error(I18n.t("global.genericError"));
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
      IOToast.success(
        profileServicePreferenceMode === ServicesPreferencesModeEnum.MANUAL
          ? I18n.t("services.optIn.preferences.manualConfig.successAlert")
          : I18n.t("services.optIn.preferences.quickConfig.successAlert")
      );
    }
  }, [prevMode, prevProfile, profile, profileServicePreferenceMode]);

  // show a badge when the user is not new
  // As explained in this comment (https://pagopa.atlassian.net/browse/IOPID-1511?focusedCommentId=126354)
  // a future feature will be need this value,
  // so I didn't delete it even though it is not used
  const showBadge = !isFirstOnboarding;
  return (
    <LoadingSpinnerOverlay isLoading={isLoading}>
      <RNavScreenWithLargeHeader
        title={{
          label: I18n.t("services.optIn.preferences.title")
        }}
        canGoback={false}
        description={I18n.t("services.optIn.preferences.body")}
        headerActionsProp={{ showHelp: true }}
        contextualHelp={emptyContextualHelp}
        fixedBottomSlot={
          <FooterWithButtons
            type="SingleButton"
            primary={{
              type: "Solid",
              buttonProps: {
                label: I18n.t("global.buttons.confirm"),
                onPress: () => handleOnContinue(),
                accessibilityLabel: I18n.t("global.buttons.confirm"),
                disabled: !isServicesPreferenceModeSet(modeSelected)
              }
            }}
          />
        }
      >
        <SafeAreaView style={IOStyles.flex}>
          <ContentWrapper>
            <ServicesContactComponent
              mode={modeSelected}
              onSelectMode={handleOnSelectMode}
              showBadge={showBadge}
            />
            <VSpacer size={16} />
            <View>
              <FeatureInfo
                iconName="navProfile"
                body={I18n.t(
                  "profile.main.privacy.shareData.screen.profileSettings"
                )}
              />
            </View>
          </ContentWrapper>
          {manualConfigBottomSheet}
        </SafeAreaView>
      </RNavScreenWithLargeHeader>
    </LoadingSpinnerOverlay>
  );
};

export default OnboardingServicesPreferenceScreen;
