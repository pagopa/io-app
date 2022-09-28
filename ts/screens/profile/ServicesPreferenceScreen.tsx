import * as pot from "@pagopa/ts-commons/lib/pot";
import * as React from "react";
import { ScrollView } from "react-native";
import { connect } from "react-redux";
import { ServicesPreferencesModeEnum } from "../../../definitions/backend/ServicesPreferencesMode";
import { IOStyles } from "../../components/core/variables/IOStyles";
import { withLoadingSpinner } from "../../components/helpers/withLoadingSpinner";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import I18n from "../../i18n";
import { profileUpsert } from "../../store/actions/profile";
import { Dispatch } from "../../store/actions/types";
import {
  profileSelector,
  profileServicePreferencesModeSelector
} from "../../store/reducers/profile";
import { GlobalState } from "../../store/reducers/types";
import { emptyContextualHelp } from "../../utils/emptyContextualHelp";
import { showToast } from "../../utils/showToast";
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
  const { present: confirmManualConfig, manualConfigBottomSheet } =
    useManualConfigBottomSheet(() =>
      props.onServicePreferenceSelected(ServicesPreferencesModeEnum.MANUAL)
    );

  const { potProfile } = props;
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
    props.onServicePreferenceSelected(mode);
  };

  return (
    <BaseScreenComponent
      goBack={true}
      contextualHelp={emptyContextualHelp}
      headerTitle={I18n.t("profile.preferences.list.service_contact")}
    >
      <ScrollView style={[IOStyles.flex, IOStyles.horizontalContentPadding]}>
        <ServicesContactComponent
          onSelectMode={handleOnSelectMode}
          mode={props.profileServicePreferenceMode}
        />
      </ScrollView>
      {manualConfigBottomSheet}
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
  onServicePreferenceSelected: (mode: ServicesPreferencesModeEnum) =>
    dispatch(profileUpsert.request({ service_preferences_settings: { mode } }))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withLoadingSpinner(ServicesPreferenceScreen));
