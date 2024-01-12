import { ContentWrapper, VSpacer } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as React from "react";
import { connect } from "react-redux";
import { ServicesPreferencesModeEnum } from "../../../definitions/backend/ServicesPreferencesMode";
import { withLoadingSpinner } from "../../components/helpers/withLoadingSpinner";
import { RNavScreenWithLargeHeader } from "../../components/ui/RNavScreenWithLargeHeader";
import I18n from "../../i18n";
import { profileUpsert } from "../../store/actions/profile";
import { Dispatch } from "../../store/actions/types";
import {
  profileSelector,
  profileServicePreferencesModeSelector
} from "../../store/reducers/profile";
import { GlobalState } from "../../store/reducers/types";
import { getFlowType } from "../../utils/analytics";
import { useOnFirstRender } from "../../utils/hooks/useOnFirstRender";
import { showToast } from "../../utils/showToast";
import {
  trackServiceConfiguration,
  trackServiceConfigurationScreen
} from "./analytics";
import { useManualConfigBottomSheet } from "./components/services/ManualConfigBottomSheet";
import ServicesContactComponent from "./components/services/ServicesContactComponent";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

/**
 * Display the current profile services preference mode (auto or manual)
 * User can update his/her mode
 * @param props
 * @constructor
 */
const ServicesPreferenceScreen = (props: Props): React.ReactElement => {
  const { potProfile, state } = props;
  const { present: confirmManualConfig, manualConfigBottomSheet } =
    useManualConfigBottomSheet(() =>
      props.onServicePreferenceSelected(
        ServicesPreferencesModeEnum.MANUAL,
        state
      )
    );

  useOnFirstRender(() => {
    trackServiceConfigurationScreen(getFlowType(false, false));
  });

  const [prevPotProfile, setPrevPotProfile] = React.useState<
    typeof props.potProfile
  >(props.potProfile);
  React.useEffect(() => {
    // show error toast only when the profile updating fails
    // otherwise, if the profile is in error state, the toast will be shown immediately without any updates
    if (!pot.isError(prevPotProfile) && pot.isError(potProfile)) {
      showToast(I18n.t("global.genericError"));
    }

    setPrevPotProfile(potProfile);
  }, [potProfile, prevPotProfile]);

  const handleOnSelectMode = (mode: ServicesPreferencesModeEnum) => {
    // if user's choice is 'manual', open bottom sheet to ask confirmation
    if (mode === ServicesPreferencesModeEnum.MANUAL) {
      confirmManualConfig();
      return;
    }
    props.onServicePreferenceSelected(mode, state);
  };

  return (
    <RNavScreenWithLargeHeader
      title={I18n.t("services.optIn.preferences.title")}
      description={I18n.t("services.optIn.preferences.body")}
      headerActionsProp={{ showHelp: true }}
    >
      <VSpacer size={16} />
      <ContentWrapper>
        <ServicesContactComponent
          onSelectMode={handleOnSelectMode}
          mode={props.profileServicePreferenceMode}
        />
      </ContentWrapper>
      {manualConfigBottomSheet}
    </RNavScreenWithLargeHeader>
  );
};

const mapStateToProps = (state: GlobalState) => {
  const profile = profileSelector(state);
  return {
    isLoading: pot.isUpdating(profile) || pot.isLoading(profile),
    potProfile: profile,
    profileServicePreferenceMode: profileServicePreferencesModeSelector(state),
    state
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onServicePreferenceSelected: (
    mode: ServicesPreferencesModeEnum,
    state: GlobalState
  ) => {
    void trackServiceConfiguration(mode, getFlowType(false, false), state);
    dispatch(profileUpsert.request({ service_preferences_settings: { mode } }));
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withLoadingSpinner(ServicesPreferenceScreen));
