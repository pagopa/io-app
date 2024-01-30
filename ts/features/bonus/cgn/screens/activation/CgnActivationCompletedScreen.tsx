import * as React from "react";
import { connect } from "react-redux";
import { View } from "react-native";
import { FooterWithButtons } from "@pagopa/io-app-design-system";

import { GlobalState } from "../../../../../store/reducers/types";
import { Dispatch } from "../../../../../store/actions/types";
import { InfoScreenComponent } from "../../../../../components/infoScreen/InfoScreenComponent";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { cgnActivationComplete } from "../../store/actions/activation";
import I18n from "../../../../../i18n";
import paymentCompleted from "../../../../../../img/pictograms/payment-completed.png";
import { renderInfoRasterImage } from "../../../../../components/infoScreen/imageRendering";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

/**
 * Screen which is displayed when a user requested a CGN activation
 * and it has been correctly activated
 */
const CgnActivationCompletedScreen = (props: Props): React.ReactElement => (
  <View style={IOStyles.flex}>
    <InfoScreenComponent
      image={renderInfoRasterImage(paymentCompleted)}
      title={I18n.t("bonus.cgn.activation.success.title")}
      body={I18n.t("bonus.cgn.activation.success.body")}
    />
    <FooterWithButtons
      type="SingleButton"
      primary={{
        type: "Solid",
        buttonProps: {
          label: I18n.t("bonus.cgn.cta.goToDetail"),
          onPress: props.onConfirm,
          accessibilityLabel: I18n.t("bonus.cgn.cta.goToDetail"),
          testID: "cgnConfirmButtonTestId"
        }
      }}
    />
  </View>
);

const mapStateToProps = (_: GlobalState) => ({});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onConfirm: () => {
    dispatch(cgnActivationComplete());
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CgnActivationCompletedScreen);
