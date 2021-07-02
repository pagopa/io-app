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

// this component shows two CTA to enable or disable services
const ServicesEnablingFooter = (props: Props): React.ReactElement => {
  const modeManual = {
    mode: ServicesPreferencesModeEnum.MANUAL,
    title: I18n.t("services.disableAll")
  };
  const modeAuto = {
    mode: ServicesPreferencesModeEnum.AUTO,
    title: I18n.t("services.enableAll")
  };
  const modeToUpdate =
    props.profileServicePreferenceMode === ServicesPreferencesModeEnum.AUTO
      ? modeManual
      : modeAuto;

  return (
    <FooterWithButtons
      type={"SingleButton"}
      leftButton={{
        title: props.isLoading
          ? I18n.t("services.updatingServiceMode")
          : modeToUpdate.title,
        onPress: () => props.onServicePreferenceSelected(modeToUpdate.mode),
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
