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

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const ServicePreferenceSummary = (props: Props): React.ReactElement => (
  // FIXME Replace the string with the current preference option saved on profile
  <View style={IOStyles.horizontalContentPadding}>
    <View spacer />
    <InfoBox iconName={"io-info"} iconColor={IOColors.bluegrey} iconSize={24}>
      <H5 weight={"Regular"} color={"bluegrey"}>{`${I18n.t(
        "services.optIn.preferences.choiceLabel"
      )} ${I18n.t("services.optIn.preferences.choiceLabel")}`}</H5>
      <Link onPress={props.navigateToServicePreference}>
        {I18n.t("serviceDetail.updatePreferences")}
      </Link>
    </InfoBox>
    <View spacer />
  </View>
);

const mapStateToProps = (_: GlobalState) => ({});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateToServicePreference: () =>
    dispatch(navigateToServicePreferenceScreen())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ServicePreferenceSummary);
