import { H6, HSpacer, Icon } from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { Image, StyleSheet, View } from "react-native";
import { connect } from "react-redux";
import bancomatLogoMin from "../../../../../img/wallet/payment-methods/bancomatpay-logo.png";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import I18n from "../../../../i18n";
import { profileNameSurnameSelector } from "../../../../store/reducers/profile";
import { GlobalState } from "../../../../store/reducers/types";
import BaseCardComponent from "../../component/card/BaseCardComponent";

type Props = {
  phone?: string;
} & ReturnType<typeof mapStateToProps>;

const styles = StyleSheet.create({
  bpayLogo: {
    width: 80,
    height: 40,
    resizeMode: "contain"
  }
});

/**
 * Generate the accessibility label for the card.
 */
const getAccessibilityRepresentation = (holder?: string, phone?: string) => {
  const cardRepresentation = I18n.t("wallet.accessibility.folded.bancomatPay");

  const computedHolder =
    holder !== undefined
      ? `, ${I18n.t("wallet.accessibility.cardHolder")} ${holder}`
      : "";

  const computedPhone = phone !== undefined ? `, ${phone}` : "";

  return `${cardRepresentation}${computedHolder}${computedPhone}`;
};

/**
 * Add a row; on the left the phone number, on the right the favourite star icon
 * @param phone
 */
const topLeft = (phone: string) => (
  <View style={IOStyles.rowSpaceBetween}>
    {phone && (
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Icon name="phone" size={24} />
        <HSpacer size={8} />
        <H6 testID="phone">{phone}</H6>
      </View>
    )}
  </View>
);

const BPayCard: React.FunctionComponent<Props> = (props: Props) => (
  <BaseCardComponent
    accessibilityLabel={getAccessibilityRepresentation(
      props.nameSurname,
      props.phone
    )}
    topLeftCorner={props.phone && topLeft(props.phone)}
    bottomLeftCorner={
      <View>
        {pipe(
          props.nameSurname,
          O.fromNullable,
          O.fold(
            () => undefined,
            nameSurname => (
              <H6 testID={"nameSurname"}>{nameSurname.toLocaleUpperCase()}</H6>
            )
          )
        )}
      </View>
    }
    bottomRightCorner={
      <View style={{ justifyContent: "flex-end", flexDirection: "column" }}>
        <Image
          accessibilityIgnoresInvertColors
          style={styles.bpayLogo}
          source={bancomatLogoMin}
        />
      </View>
    }
  />
);

const mapStateToProps = (state: GlobalState) => ({
  nameSurname: profileNameSurnameSelector(state)
});

export default connect(mapStateToProps)(BPayCard);