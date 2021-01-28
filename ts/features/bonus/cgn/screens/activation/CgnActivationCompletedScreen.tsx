import * as React from "react";
import { connect } from "react-redux";
import { SafeAreaView } from "react-native";
import { GlobalState } from "../../../../../store/reducers/types";
import { Dispatch } from "../../../../../store/actions/types";
import { InfoScreenComponent } from "../../../../../components/infoScreen/InfoScreenComponent";
import { FooterStackButton } from "../../../bonusVacanze/components/buttons/FooterStackButtons";
import { confirmButtonProps } from "../../../bonusVacanze/components/buttons/ButtonConfigurations";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import IconFont from "../../../../../components/ui/IconFont";
import { cgnActivationComplete } from "../../store/actions/activation";
import { navigateToCgnDetails } from "../../navigation/actions";
import I18n from "../../../../../i18n";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

/**
 * Screen which is displayed when a user requested a CGN activation
 * and it has been correctly activated
 */
const CgnActivationCompletedScreen = (props: Props): React.ReactElement => (
  <SafeAreaView style={IOStyles.flex}>
    <InfoScreenComponent
      image={<IconFont name={"io-complete"} size={104} />}
      title={I18n.t("bonus.cgn.activation.success.title")}
      body={I18n.t("bonus.cgn.activation.success.body")}
    />
    <FooterStackButton
      buttons={[
        confirmButtonProps(props.onConfirm, I18n.t("bonus.cgn.cta.goToDetail"))
      ]}
    />
  </SafeAreaView>
);

const mapStateToProps = (_: GlobalState) => ({});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onConfirm: () => {
    dispatch(cgnActivationComplete());
    dispatch(navigateToCgnDetails());
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CgnActivationCompletedScreen);
