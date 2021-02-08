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
import { identificationRequest } from "../../../../../../../store/actions/identification";
import { shufflePinPadOnPayment } from "../../../../../../../config";
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
  const { present, dismiss } = useIOBottomSheetRaw(582);

  const openModalBox = () =>
    present(
      <UnsubscribeComponent
        onCancel={dismiss}
        onConfirm={() => {
          dismiss();
          props.cancelBpd();
        }}
      />,
      I18n.t("bonus.bpd.unsubscribe.title")
    );

  return (
    <ButtonDefaultOpacity
      style={styles.button}
      onPress={openModalBox}
      testID={"UnsubscribeOpenBSButtonTestID"}
    >
      <Label color={"red"}>{I18n.t("bonus.bpd.unsubscribe.cta")}</Label>
    </ButtonDefaultOpacity>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  cancelBpd: () => {
    const onSuccess = () => dispatch(bpdDeleteUserFromProgram.request());
    dispatch(
      identificationRequest(
        false,
        true,
        undefined,
        undefined,
        {
          onSuccess
        },
        shufflePinPadOnPayment
      )
    );
  }
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(UnsubscribeToBpd);
