import * as React from "react";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import { SafeAreaView } from "react-native";
import { InfoScreenComponent } from "../../../../../../components/infoScreen/InfoScreenComponent";
import RequestTimeoutImage from "../../../../../../../img/bonus/siciliaVola/generateVoucherTimeout.svg";
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
      image={<RequestTimeoutImage width={104} height={104} />}
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
