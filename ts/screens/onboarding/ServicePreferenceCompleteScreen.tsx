import * as React from "react";
import { connect } from "react-redux";
import { SafeAreaView } from "react-native";
import { GlobalState } from "../../store/reducers/types";
import { Dispatch } from "../../store/actions/types";
import { InfoScreenComponent } from "../../components/infoScreen/InfoScreenComponent";
import { IOStyles } from "../../components/core/variables/IOStyles";
import I18n from "../../i18n";
import paymentCompleted from "../../../img/pictograms/payment-completed.png";
import { renderInfoRasterImage } from "../../components/infoScreen/imageRendering";
import { FooterStackButton } from "../../features/bonus/bonusVacanze/components/buttons/FooterStackButtons";
import { cancelButtonProps } from "../../features/bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { servicesOptinCompleted } from "../../store/actions/onboarding";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

/**
 * Screen which is displayed when a user requested a service preference change
 * and it has been correctly activated
 */
const ServicePreferenceCompleteScreen = (props: Props): React.ReactElement => (
  <SafeAreaView style={IOStyles.flex}>
    <InfoScreenComponent
      image={renderInfoRasterImage(paymentCompleted)}
      title={I18n.t("services.optIn.preferences.completed.title")}
      body={I18n.t("services.optIn.preferences.completed.body")}
    />
    <FooterStackButton
      buttons={[
        cancelButtonProps(props.onContinue, I18n.t("global.buttons.continue"))
      ]}
    />
  </SafeAreaView>
);

const mapStateToProps = (_: GlobalState) => ({});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onContinue: () => {
    dispatch(servicesOptinCompleted());
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ServicePreferenceCompleteScreen);
