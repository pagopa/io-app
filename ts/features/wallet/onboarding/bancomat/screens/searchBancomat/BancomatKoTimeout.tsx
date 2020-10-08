import * as React from "react";
import { SafeAreaView } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import image from "../../../../../../../img/search/search-icon.png";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import { renderInfoRasterImage } from "../../../../../../components/infoScreen/imageRendering";
import { InfoScreenComponent } from "../../../../../../components/infoScreen/InfoScreenComponent";
import BaseScreenComponent from "../../../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../../../i18n";
import { GlobalState } from "../../../../../../store/reducers/types";
import { FooterTwoButtons } from "../../../../../bonus/bonusVacanze/components/markdown/FooterTwoButtons";
import { loadPans, walletAddBancomatCancel } from "../../store/actions";
import { onboardingBancomatAbiSelectedSelector } from "../../store/reducers/abiSelected";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * This screen informs the user that the search operation could not be completed
 * @constructor
 */
const BancomatKoTimeout: React.FunctionComponent<Props> = props => (
  <BaseScreenComponent goBack={true} headerTitle={"Bancomat TIMEOUT"}>
    <SafeAreaView style={IOStyles.flex}>
      <InfoScreenComponent
        image={renderInfoRasterImage(image)}
        title={"BANCOMAT TIMEOUT"}
        body={"BANCOMAT TIMEOUT"}
      />
      <FooterTwoButtons
        type={"TwoButtonsInlineHalf"}
        onRight={() => props.retry(props.abiSelected)}
        onCancel={props.cancel}
        rightText={"Riprova"}
        leftText={I18n.t("global.buttons.cancel")}
      />
    </SafeAreaView>
  </BaseScreenComponent>
);
const mapDispatchToProps = (dispatch: Dispatch) => ({
  cancel: () => dispatch(walletAddBancomatCancel()),
  retry: (abiSelected: string | undefined) =>
    dispatch(loadPans.request(abiSelected))
});

const mapStateToProps = (state: GlobalState) => ({
  abiSelected: onboardingBancomatAbiSelectedSelector(state)
});

export default connect(mapStateToProps, mapDispatchToProps)(BancomatKoTimeout);
