import * as React from "react";
import { Image, StyleSheet } from "react-native";
import { connect } from "react-redux";
import BaseCardComponent from "../../component/BaseCardComponent";
import satispayLogoExt from "../../../../img/wallet/payment-methods/satispay-logo.png";
import satispayLogoMin from "../../../../img/wallet/cards-icons/satispay.png";
import { Body } from "../../../../components/core/typography/Body";
import { GlobalState } from "../../../../store/reducers/types";
import { profileNameSurnameSelector } from "../../../../store/reducers/profile";

type Props = ReturnType<typeof mapStateToProps>;

const styles = StyleSheet.create({
  satispayLogoMin: {
    width: 60,
    height: 36,
    resizeMode: "contain"
  },
  satispayLogoExt: {
    width: 132,
    height: 33,
    resizeMode: "contain"
  }
});

const BPayCard: React.FunctionComponent<Props> = (props: Props) => (
  <BaseCardComponent
    topLeftCorner={
      <Image source={satispayLogoExt} style={styles.satispayLogoExt} />
    }
    bottomLeftCorner={
      <Body>{(props.nameSurname ?? "").toLocaleUpperCase()}</Body>
    }
    bottomRightCorner={
      <Image style={styles.satispayLogoMin} source={satispayLogoMin} />
    }
  />
);

const mapStateToProps = (state: GlobalState) => ({
  nameSurname: profileNameSurnameSelector(state)
});

export default connect(mapStateToProps)(BPayCard);
