import * as React from "react";
import { StyleSheet } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import ButtonDefaultOpacity from "../../../../../../../components/ButtonDefaultOpacity";
import { Label } from "../../../../../../../components/core/typography/Label";
import { IOColors } from "../../../../../../../components/core/variables/IOColors";
import I18n from "../../../../../../../i18n";
import { GlobalState } from "../../../../../../../store/reducers/types";
import { bpdDeleteUserFromProgram } from "../../../../store/actions/onboarding";
import { identificationRequest } from "../../../../../../../store/actions/identification";
import { shufflePinPadOnPayment } from "../../../../../../../config";
import { useLegacyIOBottomSheetModal } from "../../../../../../../utils/hooks/bottomSheet";
import {
  cancelButtonProps,
  errorButtonProps
} from "../../../../../bonusVacanze/components/buttons/ButtonConfigurations";
import FooterWithButtons from "../../../../../../../components/ui/FooterWithButtons";
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
  const { present, bottomSheet, dismiss } = useLegacyIOBottomSheetModal(
    <UnsubscribeComponent />,
    I18n.t("bonus.bpd.unsubscribe.title"),
    582,
    <FooterWithButtons
      type={"TwoButtonsInlineThird"}
      leftButton={{
        ...cancelButtonProps(() => dismiss()),
        onPressWithGestureHandler: true
      }}
      rightButton={{
        ...errorButtonProps(() => {
          dismiss();
          props.cancelBpd();
        }, I18n.t("bonus.bpd.unsubscribe.confirmCta")),
        onPressWithGestureHandler: true
      }}
    />
  );

  return (
    <>
      <ButtonDefaultOpacity style={styles.button} onPress={present}>
        <Label color={"red"}>{I18n.t("bonus.bpd.unsubscribe.cta")}</Label>
      </ButtonDefaultOpacity>
      {bottomSheet}
    </>
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
        {
          label: I18n.t("global.buttons.cancel"),
          onCancel: () => undefined
        },
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
