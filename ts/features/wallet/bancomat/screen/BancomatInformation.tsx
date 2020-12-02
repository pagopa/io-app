import { none } from "fp-ts/lib/Option";
import { View } from "native-base";
import * as React from "react";
import { Image, StyleSheet } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import maestro from "../../../../../img/wallet/cards-icons/maestro.png";
import mastercard from "../../../../../img/wallet/cards-icons/mastercard.png";
import visaElectron from "../../../../../img/wallet/cards-icons/visa-electron.png";
import visa from "../../../../../img/wallet/cards-icons/visa.png";
import { InfoBox } from "../../../../components/box/InfoBox";
import ButtonDefaultOpacity from "../../../../components/ButtonDefaultOpacity";
import { Body } from "../../../../components/core/typography/Body";
import { H4 } from "../../../../components/core/typography/H4";
import { Label } from "../../../../components/core/typography/Label";
import { IOColors } from "../../../../components/core/variables/IOColors";
import Markdown from "../../../../components/ui/Markdown";
import I18n from "../../../../i18n";
import { navigateToWalletAddPaymentMethod } from "../../../../store/actions/navigation";
import { GlobalState } from "../../../../store/reducers/types";

type OwnProps = { onAddPaymentMethod?: () => void };

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

const BrandIconsBar = () => (
  <View style={styles.row}>
    <Image source={visa} style={styles.brandLogo} />
    <View hspacer={true} />
    <Image source={mastercard} style={styles.brandLogo} />
    <View hspacer={true} />
    <Image source={maestro} style={styles.brandLogo} />
    <View hspacer={true} />
    <Image source={visaElectron} style={styles.brandLogo} />
  </View>
);

/**
 * Display generic information on bancomat and a cta to start the onboarding of a new
 * payment method.
 * TODO: this will be also visualized inside a bottomsheet after an addition of a new bancomat
 * @constructor
 */

const BancomatInformation: React.FunctionComponent<Props> = props => (
  <View>
    <InfoBox iconColor={IOColors.black}>
      <Body>
        {I18n.t("wallet.bancomat.details.infobox.one")}
        <H4>{I18n.t("wallet.bancomat.details.infobox.two")}</H4>
        {I18n.t("wallet.bancomat.details.infobox.three")}
      </Body>
    </InfoBox>
    <View spacer={true} large={true} />
    <View spacer={true} small={true} />
    <H4>{I18n.t("wallet.bancomat.details.debit.title")}</H4>
    <View spacer={true} />
    <BrandIconsBar />
    <View spacer={true} />
    <Markdown>{I18n.t("wallet.bancomat.details.debit.body")}</Markdown>
    <View spacer={true} />
    <ButtonDefaultOpacity
      style={styles.button}
      bordered={true}
      onPress={() => {
        props.onAddPaymentMethod?.();
          props.onAddPaymentMethod();
        }
        props.addPaymentMethod();
      }}
      onPressWithGestureHandler={true}
    >
      <Label>{I18n.t("wallet.bancomat.details.debit.addCta")}</Label>
    </ButtonDefaultOpacity>
  </View>
);

const mapDispatchToProps = (dispatch: Dispatch) => ({
  addPaymentMethod: () =>
    dispatch(navigateToWalletAddPaymentMethod({ inPayment: none }))
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BancomatInformation);
