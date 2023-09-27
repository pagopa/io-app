import * as React from "react";
import { connect } from "react-redux";
import { SafeAreaView } from "react-native";
import { GlobalState } from "../../../../../store/reducers/types";
import { Dispatch } from "../../../../../store/actions/types";
import { InfoScreenComponent } from "../../../../../components/infoScreen/InfoScreenComponent";
import { renderInfoRasterImage } from "../../../../../components/infoScreen/imageRendering";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import { confirmButtonProps } from "../../../bonusVacanze/components/buttons/ButtonConfigurations";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { cgnActivationCancel } from "../../store/actions/activation";
import image from "../../../../../../img/messages/empty-due-date-list-icon.png";
import I18n from "../../../../../i18n";
import { navigateToCgnDetails } from "../../navigation/actions";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

/**
 * Screen which is displayed when a user requested a CGN activation
 * but it is yet active
 */
const CgnAlreadyActiveScreen = (props: Props): React.ReactElement => (
  <SafeAreaView style={IOStyles.flex}>
    <InfoScreenComponent
      image={renderInfoRasterImage(image)}
      title={I18n.t("bonus.cgn.activation.alreadyActive.title")}
      body={I18n.t("bonus.cgn.activation.alreadyActive.body")}
    />
    <FooterWithButtons
      type="SingleButton"
      leftButton={confirmButtonProps(
        props.navigateToDetail,
        I18n.t("bonus.cgn.cta.goToDetail"),
        undefined,
        "cgnConfirmButtonTestId"
      )}
    />
  </SafeAreaView>
);

const mapStateToProps = (_: GlobalState) => ({});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateToDetail: () => {
    dispatch(cgnActivationCancel());
    navigateToCgnDetails();
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CgnAlreadyActiveScreen);
