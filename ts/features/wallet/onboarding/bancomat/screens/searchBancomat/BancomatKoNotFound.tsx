import * as React from "react";
import { SafeAreaView } from "react-native";
import { NavigationActions } from "react-navigation";
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
import { walletAddBancomatCancel } from "../../store/actions";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * This screen informs the user that no Bancomat in his name were found
 * @constructor
 */
const BancomatKoNotFound: React.FunctionComponent<Props> = props => (
  <BaseScreenComponent goBack={true} headerTitle={"NO BANCOMAT FOUND"}>
    <SafeAreaView style={IOStyles.flex}>
      <InfoScreenComponent
        image={renderInfoRasterImage(image)}
        title={"NO BANCOMAT FOUND"}
        body={"NO BANCOMAT FOUND"}
      />
      <FooterTwoButtons
        type={"TwoButtonsInlineHalf"}
        onRight={props.back}
        onCancel={props.cancel}
        rightText={"Scegli un'altra banca"}
        leftText={I18n.t("global.buttons.cancel")}
      />
    </SafeAreaView>
  </BaseScreenComponent>
);

const mapDispatchToProps = (dispatch: Dispatch) => ({
  cancel: () => dispatch(walletAddBancomatCancel()),
  back: () => dispatch(NavigationActions.back())
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(BancomatKoNotFound);
