import * as React from "react";
import { connect } from "react-redux";
import { SafeAreaView, ScrollView } from "react-native";
import { View } from "native-base";
import { NavigationInjectedProps } from "react-navigation";
import * as pot from "italia-ts-commons/lib/pot";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../utils/emptyContextualHelp";
import ServicesContactComponent from "../profile/components/services/ServicesContactComponent";
import { InfoBox } from "../../components/box/InfoBox";
import { H5 } from "../../components/core/typography/H5";
import { IOColors } from "../../components/core/variables/IOColors";
import I18n from "../../i18n";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import { confirmButtonProps } from "../../features/bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { GlobalState } from "../../store/reducers/types";
import { Dispatch } from "../../store/actions/types";
import { IOStyles } from "../../components/core/variables/IOStyles";
import { navigateToOnboardingServicePreferenceCompleteAction } from "../../store/actions/navigation";
import { useManualConfigBottomSheet } from "../profile/components/services/ManualConfigBottomSheet";
import { ServicesPreferencesModeEnum } from "../../../definitions/backend/ServicesPreferencesMode";
import {
  isServicesPreferenceModeSet,
  profileSelector,
  profileServicePreferencesModeSelector
} from "../../store/reducers/profile";
import { profileUpsert } from "../../store/actions/profile";
import { withLoadingSpinner } from "../../components/helpers/withLoadingSpinner";
import { showToast } from "../../utils/showToast";
import { servicesOptinCompleted } from "../../store/actions/onboarding";

type NavigationProps = {
  isFirstOnboarding: boolean;
};
type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  NavigationInjectedProps<NavigationProps>;

const OnboardingServicesPreferenceScreen = (
  props: Props
): React.ReactElement => {
  const isFirstOnboarding = props.navigation.getParam("isFirstOnboarding");
  // if the user is not new and he/she hasn't a preference set, pre-set with AUTO mode
  const mode =
    !isFirstOnboarding &&
    props.profileServicePreferenceMode === ServicesPreferencesModeEnum.LEGACY
      ? ServicesPreferencesModeEnum.AUTO
      : props.profileServicePreferenceMode;
  const [modeSelected, setModeSelected] = React.useState<
    ServicesPreferencesModeEnum | undefined
  >(mode);
  const [prevPotProfile, setPrevPotProfile] = React.useState<
    typeof props.potProfile
  >(props.potProfile);

  const { profileServicePreferenceMode, potProfile, onContinue } = props;

  React.useEffect(() => {
    // when the user made a choice (the profile is right updated), continue to the next step
    if (isServicesPreferenceModeSet(profileServicePreferenceMode)) {
      onContinue(isFirstOnboarding);
      return;
    }
    // show error toast only when the profile updating fails
    // otherwise, if the profile is in error state, the toast will be shown immediately without any updates
    if (!pot.isError(prevPotProfile) && pot.isError(potProfile)) {
      showToast(I18n.t("global.genericError"));
    }
    setPrevPotProfile(potProfile);
  }, [
    isFirstOnboarding,
    prevPotProfile,
    potProfile,
    profileServicePreferenceMode,
    onContinue
  ]);

  const handleOnContinue = () => {
    if (modeSelected) {
      props.onServicePreferenceSelected(modeSelected);
    }
  };
  const { present: confirmManualConfig } = useManualConfigBottomSheet();
  const handleOnSelectMode = (mode: ServicesPreferencesModeEnum) => {
    // if user's choice is 'manual', open bottom sheet to ask confirmation
    if (mode === ServicesPreferencesModeEnum.MANUAL) {
      void confirmManualConfig(() =>
        props.onServicePreferenceSelected(ServicesPreferencesModeEnum.MANUAL)
      );
      return;
    }
    setModeSelected(mode);
  };

  // show a badge when the user is not new
  const showBadge = !isFirstOnboarding;
  return (
    <BaseScreenComponent contextualHelp={emptyContextualHelp}>
      <SafeAreaView style={IOStyles.flex}>
        <ScrollView style={[IOStyles.horizontalContentPadding, IOStyles.flex]}>
          <ServicesContactComponent
            mode={modeSelected}
            onSelectMode={handleOnSelectMode}
            showBadge={showBadge}
          />
          <InfoBox iconName={"io-profilo"} iconColor={IOColors.bluegrey}>
            <H5 color={"bluegrey"} weight={"Regular"}>
              {I18n.t("profile.main.privacy.shareData.screen.profileSettings")}
            </H5>
          </InfoBox>
          <View spacer={true} />
        </ScrollView>
        <FooterWithButtons
          type={"SingleButton"}
          leftButton={{
            ...confirmButtonProps(handleOnContinue),
            disabled: !isServicesPreferenceModeSet(modeSelected)
          }}
        />
      </SafeAreaView>
    </BaseScreenComponent>
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
    dispatch(
      !isFirstOnboarding
        ? navigateToOnboardingServicePreferenceCompleteAction()
        : servicesOptinCompleted()
    ),
  onServicePreferenceSelected: (mode: ServicesPreferencesModeEnum) =>
    dispatch(profileUpsert.request({ service_preferences_settings: { mode } }))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withLoadingSpinner(OnboardingServicesPreferenceScreen));
