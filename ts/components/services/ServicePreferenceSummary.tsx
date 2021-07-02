import { View } from "native-base";
import * as React from "react";
import { connect } from "react-redux";
import { InfoBox } from "../box/InfoBox";
import { IOStyles } from "../core/variables/IOStyles";
import { IOColors } from "../core/variables/IOColors";
import { H5 } from "../core/typography/H5";
import I18n from "../../i18n";
import { Link } from "../core/typography/Link";
import { GlobalState } from "../../store/reducers/types";
import { Dispatch } from "../../store/actions/types";
import { navigateToServicePreferenceScreen } from "../../store/actions/navigation";
import { ServicesPreferencesModeEnum } from "../../../definitions/backend/ServicesPreferencesMode";
import { profileServicePreferencesModeSelector } from "../../store/reducers/profile";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

export const mapServicesPreferenceModeLabel: Record<
  ServicesPreferencesModeEnum,
  string
> = {
  [ServicesPreferencesModeEnum.AUTO]: I18n.t(
    "services.optIn.preferences.quickConfig.value"
  ),
  [ServicesPreferencesModeEnum.MANUAL]: I18n.t(
    "services.optIn.preferences.manualConfig.value"
  ),
  [ServicesPreferencesModeEnum.LEGACY]: I18n.t(
    "services.optIn.preferences.unavailable"
  )
};

/**
 * Display the current service preference mode set in the profile and link to navigate
 * to a screen to update it
 * @param props
 * @constructor
 */
const ServicePreferenceSummary = (props: Props): React.ReactElement => (
  <View style={IOStyles.horizontalContentPadding}>
    <View spacer />
    <InfoBox iconName={"io-info"} iconColor={IOColors.bluegrey} iconSize={24}>
      <H5 weight={"Regular"} color={"bluegrey"}>{`${I18n.t(
        "services.optIn.preferences.choiceLabel"
      )} ${
        mapServicesPreferenceModeLabel[
          props.profileServicePreferenceMode ??
            ServicesPreferencesModeEnum.LEGACY
        ]
      }`}</H5>
      <Link
        onPress={props.navigateToServicePreference}
        accessibilityRole={"button"}
      >
        {I18n.t("serviceDetail.updatePreferences")}
      </Link>
    </InfoBox>
    <View spacer />
  </View>
);

const mapStateToProps = (state: GlobalState) => ({
  profileServicePreferenceMode: profileServicePreferencesModeSelector(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateToServicePreference: () =>
    dispatch(navigateToServicePreferenceScreen())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ServicePreferenceSummary);
