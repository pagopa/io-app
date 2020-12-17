import * as React from "react";
import { StyleSheet } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import ButtonDefaultOpacity from "../../../../../../../components/ButtonDefaultOpacity";
import { Label } from "../../../../../../../components/core/typography/Label";
import { IOColors } from "../../../../../../../components/core/variables/IOColors";
import I18n from "../../../../../../../i18n";
import { GlobalState } from "../../../../../../../store/reducers/types";
import { useIOBottomSheetRaw } from "../../../../../../../utils/bottomSheet";
import { bpdDeleteUserFromProgram } from "../../../../store/actions/onboarding";
import { UnsubscribeComponent } from "./UnsubscribeComponent";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const styles = StyleSheet.create({
  button: {
    width: "100%",
    borderColor: IOColors.red,
    borderWidth: 1,
    backgroundColor: IOColors.white
  }
});

/**
 * Allow the user to unsubscribe from bpd
 * @constructor
 */
const UnsubscribeToBpd: React.FunctionComponent<Props> = props => {
  const { present, dismiss } = useIOBottomSheetRaw(
    I18n.t("bonus.bpd.unsubscribe.title"),
    582
  );

  const openModalBox = () =>
    present(
      <UnsubscribeComponent
        onCancel={dismiss}
        onConfirm={() => {
          dismiss();
          props.cancelBpd();
        }}
      />
    );

  return (
    <ButtonDefaultOpacity style={styles.button} onPress={openModalBox}>
      <Label color={"red"}>{I18n.t("bonus.bpd.unsubscribe.cta")}</Label>
    </ButtonDefaultOpacity>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  cancelBpd: () => {
    dispatch(bpdDeleteUserFromProgram.request());
  }
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(UnsubscribeToBpd);
