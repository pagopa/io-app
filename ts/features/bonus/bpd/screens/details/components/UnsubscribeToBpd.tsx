import * as React from "react";
import { StyleSheet } from "react-native";
import { NavigationActions } from "react-navigation";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import ButtonDefaultOpacity from "../../../../../../components/ButtonDefaultOpacity";
import { Label } from "../../../../../../components/core/typography/Label";
import { GlobalState } from "../../../../../../store/reducers/types";
import { bpdDeleteUserFromProgram } from "../../../store/actions/onboarding";
import I18n from "../../../../../../i18n";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const styles = StyleSheet.create({
  button: {
    width: "100%"
  }
});

/**
 * Allow the user to unsubscribe from bpd
 * TODO: ask confirmation to the user with bottomsheet, handle loading cancel, navigate to wallet with success
 * @constructor
 */
const UnsubscribeToBpd: React.FunctionComponent<Props> = props => (
  <ButtonDefaultOpacity
    alert={true}
    style={styles.button}
    onPress={props.cancelBpd}
  >
    <Label color={"white"}>{I18n.t("bonus.bpd.unsubscribe")}</Label>
  </ButtonDefaultOpacity>
);

const mapDispatchToProps = (dispatch: Dispatch) => ({
  cancelBpd: () => {
    dispatch(bpdDeleteUserFromProgram.request());
    dispatch(NavigationActions.back());
  }
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(UnsubscribeToBpd);
