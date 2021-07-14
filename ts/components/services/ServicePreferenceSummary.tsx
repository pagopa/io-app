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

const getServicesPreferenceModeLabel = (
  mode: ServicesPreferencesModeEnum
): string =>
  ({
    [ServicesPreferencesModeEnum.AUTO]: `${I18n.t(
      "services.optIn.preferences.quickConfig.value"
    )}: ${I18n.t("services.optIn.preferences.quickConfig.label")}`,
    [ServicesPreferencesModeEnum.MANUAL]: `${I18n.t(
      "services.optIn.preferences.manualConfig.value"
    )}: ${I18n.t("services.optIn.preferences.manualConfig.label")}`,
    [ServicesPreferencesModeEnum.LEGACY]: I18n.t(
      "services.optIn.preferences.unavailable"
    )
  }[mode]);

/**
 * Display the current services preference mode set in the profile
 * Display a link to navigate to a screen to update the service preference mode
 * @param props
 * @constructor
 */
const ServicePreferenceSummary = (props: Props): React.ReactElement => (
  <View footer style={IOStyles.horizontalContentPadding}>
    <InfoBox iconName={"io-info"} iconColor={IOColors.bluegrey} iconSize={24}>
      <H5 weight={"Regular"} color={"bluegrey"}>{`${I18n.t(
        "services.optIn.preferences.choiceLabel"
      )} ${getServicesPreferenceModeLabel(
        props.profileServicePreferenceMode ?? ServicesPreferencesModeEnum.LEGACY
      )}`}</H5>
      <Link
        onPress={props.navigateToServicePreference}
        accessibilityRole={"button"}
      >
        {I18n.t("serviceDetail.updatePreferences")}
      </Link>
    </InfoBox>
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
