import * as React from "react";
import { SafeAreaView } from "react-native";
import { connect } from "react-redux";
import paymentCompleted from "../../../img/pictograms/payment-completed.png";
import { FooterStackButton } from "../../components/buttons/FooterStackButtons";
import { IOStyles } from "../../components/core/variables/IOStyles";
import { InfoScreenComponent } from "../../components/infoScreen/InfoScreenComponent";
import { renderInfoRasterImage } from "../../components/infoScreen/imageRendering";
import I18n from "../../i18n";
import { servicesOptinCompleted } from "../../store/actions/onboarding";
import { Dispatch } from "../../store/actions/types";
import { GlobalState } from "../../store/reducers/types";

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
      primaryActionProps={{
        label: I18n.t("global.buttons.continue"),
        accessibilityLabel: I18n.t("global.buttons.continue"),
        onPress: props.onContinue
      }}
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
