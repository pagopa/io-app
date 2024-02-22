import {
  FeatureInfo,
  FooterWithButtons,
  IOStyles,
  IOToast,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import React, { ReactElement, useEffect, useState } from "react";
import { SafeAreaView, View } from "react-native";
import { connect, useStore } from "react-redux";
import { ServicesPreferencesModeEnum } from "../../../definitions/backend/ServicesPreferencesMode";
import { withLoadingSpinner } from "../../components/helpers/withLoadingSpinner";
import { RNavScreenWithLargeHeader } from "../../components/ui/RNavScreenWithLargeHeader";
import I18n from "../../i18n";
import { IOStackNavigationRouteProps } from "../../navigation/params/AppParamsList";
import { OnboardingParamsList } from "../../navigation/params/OnboardingParamsList";
import { navigateToOnboardingServicePreferenceCompleteAction } from "../../store/actions/navigation";
import { servicesOptinCompleted } from "../../store/actions/onboarding";
import { profileUpsert } from "../../store/actions/profile";
import { Dispatch } from "../../store/actions/types";
import {
  isServicesPreferenceModeSet,
  profileSelector,
  profileServicePreferencesModeSelector
} from "../../store/reducers/profile";
import { GlobalState } from "../../store/reducers/types";
import { getFlowType } from "../../utils/analytics";
import { emptyContextualHelp } from "../../utils/emptyContextualHelp";
import { useOnFirstRender } from "../../utils/hooks/useOnFirstRender";
import {
  trackServiceConfiguration,
  trackServiceConfigurationScreen
} from "../profile/analytics";
import { useManualConfigBottomSheet } from "../profile/components/services/ManualConfigBottomSheet";
import ServicesContactComponent from "../profile/components/services/ServicesContactComponent";

export type OnboardingServicesPreferenceScreenNavigationParams = {
  isFirstOnboarding: boolean;
};
type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  IOStackNavigationRouteProps<
    OnboardingParamsList,
    "ONBOARDING_SERVICES_PREFERENCE"
  >;

const OnboardingServicesPreferenceScreen = (props: Props): ReactElement => {
  const isFirstOnboarding = props.route.params.isFirstOnboarding;
  // if the user is not new and he/she hasn't a preference set, pre-set with AUTO mode
  const mode = props.profileServicePreferenceMode;
  const [modeSelected, setModeSelected] = useState<
    ServicesPreferencesModeEnum | undefined
  >(mode);
  const [prevPotProfile, setPrevPotProfile] = useState<typeof props.potProfile>(
    props.potProfile
  );

  const { profileServicePreferenceMode, potProfile, onContinue } = props;

  useOnFirstRender(() => {
    trackServiceConfigurationScreen(getFlowType(true, isFirstOnboarding));
  });

  const store = useStore();

  useEffect(() => {
    // when the user made a choice (the profile is right updated), continue to the next step
    if (isServicesPreferenceModeSet(profileServicePreferenceMode)) {
      void trackServiceConfiguration(
        profileServicePreferenceMode,
        getFlowType(true, isFirstOnboarding),
        store.getState()
      );
      onContinue(isFirstOnboarding);
      return;
    }
    // show error toast only when the profile updating fails
    // otherwise, if the profile is in error state, the toast will be shown immediately without any updates
    if (!pot.isError(prevPotProfile) && pot.isError(potProfile)) {
      IOToast.error(I18n.t("global.genericError"));
    }
    setPrevPotProfile(potProfile);
  }, [
    isFirstOnboarding,
    prevPotProfile,
    potProfile,
    profileServicePreferenceMode,
    onContinue,
    store
  ]);

  const handleOnContinue = () => {
    if (modeSelected) {
      props.onServicePreferenceSelected(modeSelected);
    }
  };

  const { present: confirmManualConfig, manualConfigBottomSheet } =
    useManualConfigBottomSheet(() =>
      props.onServicePreferenceSelected(ServicesPreferencesModeEnum.MANUAL)
    );

  const handleOnSelectMode = (mode: ServicesPreferencesModeEnum) => {
    // if user's choice is 'manual', open bottom sheet to ask confirmation
    if (mode === ServicesPreferencesModeEnum.MANUAL) {
      confirmManualConfig();
      return;
    }
    setModeSelected(mode);
  };

  // show a badge when the user is not new
  const showBadge = !isFirstOnboarding;
  return (
    <RNavScreenWithLargeHeader
      title={{
        label: I18n.t("services.optIn.preferences.title")
      }}
      description={I18n.t("services.optIn.preferences.body")}
      headerActionsProp={{ showHelp: true }}
      contextualHelp={emptyContextualHelp}
      fixedBottomSlot={
        <SafeAreaView>
          <FooterWithButtons
            type="SingleButton"
            primary={{
              type: "Solid",
              buttonProps: {
                label: I18n.t("global.buttons.confirm"),
                onPress: handleOnContinue,
                accessibilityLabel: I18n.t("global.buttons.confirm"),
                disabled: !isServicesPreferenceModeSet(modeSelected)
              }
            }}
          />
        </SafeAreaView>
      }
    >
      <SafeAreaView style={IOStyles.flex}>
        <View style={[IOStyles.horizontalContentPadding, { flexGrow: 1 }]}>
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
        </View>
        {manualConfigBottomSheet}
      </SafeAreaView>
    </RNavScreenWithLargeHeader>
  );
};

const mapStateToProps = (state: GlobalState) => {
  const profile = profileSelector(state);
  return {
    isLoading: pot.isUpdating(profile) || pot.isLoading(profile),
    potProfile: profile,
    profileServicePreferenceMode: profileServicePreferencesModeSelector(state)
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onContinue: (isFirstOnboarding: boolean) =>
    // if the user is not new, navigate to the thank-you screen
    !isFirstOnboarding
      ? navigateToOnboardingServicePreferenceCompleteAction()
      : dispatch(servicesOptinCompleted()),
  onServicePreferenceSelected: (mode: ServicesPreferencesModeEnum) =>
    dispatch(profileUpsert.request({ service_preferences_settings: { mode } }))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withLoadingSpinner(OnboardingServicesPreferenceScreen));
