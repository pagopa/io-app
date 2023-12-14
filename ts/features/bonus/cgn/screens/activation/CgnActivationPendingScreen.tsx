import * as React from "react";
import { connect } from "react-redux";
import { SafeAreaView, View } from "react-native";
import { FooterWithButtons } from "@pagopa/io-app-design-system";

import { GlobalState } from "../../../../../store/reducers/types";
import { Dispatch } from "../../../../../store/actions/types";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { InfoScreenComponent } from "../../../../../components/infoScreen/InfoScreenComponent";
import { renderInfoRasterImage } from "../../../../../components/infoScreen/imageRendering";
import image from "../../../../../../img/messages/empty-message-list-icon.png";
import I18n from "../../../../../i18n";
import { cgnActivationCancel } from "../../store/actions/activation";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

/**
 * Screen which is displayed when a user requested a CGN activation
 * and the server has already another request pending for the user
 */
const CgnActivationPendingScreen = (props: Props): React.ReactElement => (
  <SafeAreaView style={IOStyles.flex}>
    <InfoScreenComponent
      image={renderInfoRasterImage(image)}
      title={I18n.t("bonus.cgn.activation.pending.title")}
      body={I18n.t("bonus.cgn.activation.pending.body")}
    />
    <View>
      <FooterWithButtons
        type="SingleButton"
        primary={{
          type: "Outline",
          buttonProps: {
            onPress: props.onExit,
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
  onExit: () => dispatch(cgnActivationCancel())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CgnActivationPendingScreen);
