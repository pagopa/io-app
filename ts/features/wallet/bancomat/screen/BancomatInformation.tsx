import { View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import ButtonDefaultOpacity from "../../../../components/ButtonDefaultOpacity";
import { H4 } from "../../../../components/core/typography/H4";
import { Label } from "../../../../components/core/typography/Label";
import { IOColors } from "../../../../components/core/variables/IOColors";
import Markdown from "../../../../components/ui/Markdown";
import InternationalCircuitIconsBar from "../../../../components/wallet/InternationalCircuitIconBar";
import I18n from "../../../../i18n";
import { GlobalState } from "../../../../store/reducers/types";

type OwnProps = {
  onAddPaymentMethod?: () => void;
  hideCobrandTitle?: true;
};

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  OwnProps;

const styles = StyleSheet.create({
  button: {
    width: "100%",
    borderColor: IOColors.blue
  },
  brandLogo: {
    width: 40,
    height: 25,
    resizeMode: "contain"
  },
  vPay: {
    width: 25,
    height: 25,
    resizeMode: "contain"
  },
  row: {
    flexDirection: "row"
  }
});

/**
 * Display generic information on bancomat and a cta to start the onboarding of a new
 * payment method.
 * TODO: this will be also visualized inside a bottomsheet after an addition of a new bancomat
 * @constructor
 */

const BancomatInformation: React.FunctionComponent<Props> = props => (
  <View>
    {!props.hideCobrandTitle && (
      <H4>{I18n.t("wallet.bancomat.details.debit.title")}</H4>
    )}
    <View spacer={true} />
    <InternationalCircuitIconsBar />
    <View spacer={true} />
    <Markdown>{I18n.t("wallet.bancomat.details.debit.body")}</Markdown>
    <View spacer={true} />
    <ButtonDefaultOpacity
      style={styles.button}
      bordered={true}
      onPress={() => {
        props.onAddPaymentMethod?.();
      }}
      onPressWithGestureHandler={true}
    >
      <Label>{I18n.t("wallet.bancomat.details.debit.addCta")}</Label>
    </ButtonDefaultOpacity>
  </View>
);

const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BancomatInformation);
