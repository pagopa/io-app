import * as React from "react";
import { connect } from "react-redux";
import { SafeAreaView, View } from "react-native";
import { FooterWithButtons } from "@pagopa/io-app-design-system";
import { GlobalState } from "../../../../../store/reducers/types";
import { Dispatch } from "../../../../../store/actions/types";
import { InfoScreenComponent } from "../../../../../components/infoScreen/InfoScreenComponent";
import { renderInfoRasterImage } from "../../../../../components/infoScreen/imageRendering";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { cgnActivationCancel } from "../../store/actions/activation";
import image from "../../../../../../img/servicesStatus/error-detail-icon.png";
import I18n from "../../../../../i18n";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

/**
 * Screen which is displayed when a user requested a CGN activation
 * but is not eligible for its activation
 */
const CgnActivationIneligibleScreen = (props: Props): React.ReactElement => (
  <SafeAreaView style={IOStyles.flex}>
    <InfoScreenComponent
      image={renderInfoRasterImage(image)}
      title={I18n.t("bonus.cgn.activation.ineligible.title")}
      body={I18n.t("bonus.cgn.activation.ineligible.body")}
    />
    <View>
      <FooterWithButtons
        type="SingleButton"
        primary={{
          type: "Outline",
          buttonProps: {
            onPress: props.onCancel,
            label: I18n.t("global.buttons.exit"),
            accessibilityLabel: I18n.t("global.buttons.exit")
          }
        }}
      />
    </View>
  </SafeAreaView>
);

const mapStateToProps = (_: GlobalState) => ({});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onCancel: () => dispatch(cgnActivationCancel())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CgnActivationIneligibleScreen);
