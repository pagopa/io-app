import * as React from "react";
import { connect } from "react-redux";
import * as pot from "italia-ts-commons/lib/pot";
import FooterWithButtons from "../ui/FooterWithButtons";
import I18n from "../../i18n";
import { GlobalState } from "../../store/reducers/types";
import { Dispatch } from "../../store/actions/types";
import {
  profileSelector,
  profileServicePreferencesModeSelector
} from "../../store/reducers/profile";
import { ServicesPreferencesModeEnum } from "../../../definitions/backend/ServicesPreferencesMode";
import { profileUpsert } from "../../store/actions/profile";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

// this component shows a CTA to enable or disable services preference mode
const ServicesEnablingFooter = (props: Props): React.ReactElement => {
  const modeManual = {
    title: I18n.t("services.disableAll"),
    action: () =>
      props.onServicePreferenceSelected(ServicesPreferencesModeEnum.MANUAL)
  };
  const modeAuto = {
    action: () =>
      props.onServicePreferenceSelected(ServicesPreferencesModeEnum.AUTO),
    title: I18n.t("services.enableAll")
  };
  const buttonConfig =
    props.profileServicePreferenceMode === ServicesPreferencesModeEnum.AUTO
      ? modeManual
      : modeAuto;

  return (
    <FooterWithButtons
      type={"SingleButton"}
      leftButton={{
        title: props.isLoading
          ? I18n.t("services.updatingServiceMode")
          : buttonConfig.title,
        onPress: buttonConfig.action,
        disabled: props.isLoading,
        bordered: true,
        light: true
      }}
    />
  );
};

const mapStateToProps = (state: GlobalState) => {
  const profile = profileSelector(state);
  return {
    profileServicePreferenceMode: profileServicePreferencesModeSelector(state),
    isLoading: pot.isUpdating(profile) || pot.isLoading(profile),
    potProfile: profile
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onServicePreferenceSelected: (mode: ServicesPreferencesModeEnum) =>
    dispatch(profileUpsert.request({ service_preferences_settings: { mode } }))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ServicesEnablingFooter);
