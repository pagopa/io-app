import * as React from "react";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import { SafeAreaView } from "react-native";
import { InfoScreenComponent } from "../../../../../../components/infoScreen/InfoScreenComponent";
import { renderInfoRasterImage } from "../../../../../../components/infoScreen/imageRendering";
import image from "../../../../../../../img/servicesStatus/error-detail-icon.png";
import I18n from "../../../../../../i18n";
import { GlobalState } from "../../../../../../store/reducers/types";
import { svGenerateVoucherCancel } from "../../../store/actions/voucherGeneration";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import { cancelButtonProps } from "../../../../bonusVacanze/components/buttons/ButtonConfigurations";
import FooterWithButtons from "../../../../../../components/ui/FooterWithButtons";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const SvGeneratedVoucherTimeoutScreen: React.FC<Props> = (props: Props) => (
  <SafeAreaView style={IOStyles.flex}>
    <InfoScreenComponent
      image={renderInfoRasterImage(image)}
      title={I18n.t("bonus.sv.voucherGeneration.ko.timeout.title")}
      body={I18n.t("bonus.sv.voucherGeneration.ko.timeout.body")}
    />
    <FooterWithButtons
      type="SingleButton"
      leftButton={cancelButtonProps(
        props.onExit,
        I18n.t("global.buttons.exit")
      )}
    />
  </SafeAreaView>
);

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onExit: () => dispatch(svGenerateVoucherCancel())
});
const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SvGeneratedVoucherTimeoutScreen);
