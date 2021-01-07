import { View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import I18n from "../../../../i18n";
import { H4 } from "../../../../components/core/typography/H4";
import Markdown from "../../../../components/ui/Markdown";
import { GlobalState } from "../../../../store/reducers/types";
import { walletAddBPayStart } from "../../onboarding/bancomatPay/store/actions";
import ButtonDefaultOpacity from "../../../../components/ButtonDefaultOpacity";
import { Label } from "../../../../components/core/typography/Label";
import { IOColors } from "../../../../components/core/variables/IOColors";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const styles = StyleSheet.create({
  button: {
    width: "100%",
    borderColor: IOColors.blue
  }
});

const AddBPay: React.FunctionComponent<Props> = props => (
  <View>
    <H4>{I18n.t("wallet.methods.bancomatPay.name")}</H4>
    <View spacer={true} />
    <Markdown>{I18n.t("wallet.bancomat.details.bPay.body")}</Markdown>
    <View spacer={true} />
    <ButtonDefaultOpacity
      style={styles.button}
      bordered={true}
      onPress={props.startAddBPay}
      onPressWithGestureHandler={true}
    >
      <Label>{I18n.t("wallet.bancomat.details.bPay.addCta")}</Label>
    </ButtonDefaultOpacity>
  </View>
);

const mapDispatchToProps = (dispatch: Dispatch) => ({
  startAddBPay: () => dispatch(walletAddBPayStart())
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(AddBPay);
