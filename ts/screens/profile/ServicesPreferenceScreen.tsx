import * as React from "react";
import { ScrollView } from "react-native";
import { connect } from "react-redux";
import * as pot from "italia-ts-commons/lib/pot";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../utils/emptyContextualHelp";
import { IOStyles } from "../../components/core/variables/IOStyles";
import { GlobalState } from "../../store/reducers/types";
import { Dispatch } from "../../store/actions/types";
import I18n from "../../i18n";
import { ServicesPreferencesModeEnum } from "../../../definitions/backend/ServicesPreferencesMode";
import { profileUpsert } from "../../store/actions/profile";
import { profileSelector } from "../../store/reducers/profile";
import { withLoadingSpinner } from "../../components/helpers/withLoadingSpinner";
import ServicesContactComponent from "./components/services/ServicesContactComponent";
import { useManualConfigBottomSheet } from "./components/services/ManualConfigBottomSheet";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

/**
 * Display the current profile preference about services (auto or manual)
 * User can change it and update his/her profile
 * @param props
 * @constructor
 */
const ServicesPreferenceScreen = (props: Props): React.ReactElement => {
  const { present: confirmManualConfig } = useManualConfigBottomSheet();

  const handleOnSelectMode = (mode: ServicesPreferencesModeEnum) => {
    // if user's choice is 'manual', open bottom sheet to ask confirmation
    if (mode === ServicesPreferencesModeEnum.MANUAL) {
      void confirmManualConfig(() =>
        props.onServicePreferenceSelected(ServicesPreferencesModeEnum.MANUAL)
      );
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
        <ServicesContactComponent onSelectMode={handleOnSelectMode} />
      </ScrollView>
    </BaseScreenComponent>
  );
};

const mapStateToProps = (state: GlobalState) => {
  const profile = profileSelector(state);
  return {
    isLoading: pot.isUpdating(profile) || pot.isLoading(profile)
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
