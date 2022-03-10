import * as React from "react";
import { Image, StyleSheet } from "react-native";
import { connect } from "react-redux";
import BaseCardComponent from "../component/card/BaseCardComponent";
import satispayLogoExt from "../../../../img/wallet/payment-methods/satispay-logo.png";
import satispayLogoMin from "../../../../img/wallet/cards-icons/satispay.png";
import { Body } from "../../../components/core/typography/Body";
import { GlobalState } from "../../../store/reducers/types";
import { profileNameSurnameSelector } from "../../../store/reducers/profile";
import I18n from "../../../i18n";
import { BrandImage } from "../component/card/BrandImage";

type Props = ReturnType<typeof mapStateToProps>;

const styles = StyleSheet.create({
  satispayLogoExt: {
    width: 132,
    height: 33,
    resizeMode: "contain"
  }
});

/**
 * Generate the accessibility label for the card.
 */
const getAccessibilityRepresentation = (holder?: string) => {
  const satispay = I18n.t("wallet.onboarding.satispay.name");

  const computedHolder =
    typeof holder !== "undefined"
      ? `, ${I18n.t("wallet.accessibility.cardHolder")} ${holder}`
      : "";

  return `${satispay}${computedHolder}`;
};

const SatispayCard: React.FunctionComponent<Props> = (props: Props) => (
  <BaseCardComponent
    accessibilityLabel={getAccessibilityRepresentation(props.nameSurname)}
    topLeftCorner={
      <Image source={satispayLogoExt} style={styles.satispayLogoExt} />
    }
    bottomLeftCorner={
      <Body>{(props.nameSurname ?? "").toLocaleUpperCase()}</Body>
    }
    bottomRightCorner={<BrandImage image={satispayLogoMin} />}
  />
);

const mapStateToProps = (state: GlobalState) => ({
  nameSurname: profileNameSurnameSelector(state)
});

export default connect(mapStateToProps)(SatispayCard);
