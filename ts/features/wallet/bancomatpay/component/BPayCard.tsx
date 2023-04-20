import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { View, Image, StyleSheet } from "react-native";
import { connect } from "react-redux";
import bancomatLogoMin from "../../../../../img/wallet/payment-methods/bancomatpay-logo.png";
import { H4 } from "../../../../components/core/typography/H4";
import IconFont from "../../../../components/ui/IconFont";
import I18n from "../../../../i18n";
import { profileNameSurnameSelector } from "../../../../store/reducers/profile";
import { GlobalState } from "../../../../store/reducers/types";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import BaseCardComponent from "../../component/card/BaseCardComponent";
import { HSpacer } from "../../../../components/core/spacer/Spacer";

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
        <IconFont name={"io-phone"} size={22} />
        <HSpacer size={8} />
        <H4 weight={"Regular"} testID="phone">
          {phone}
        </H4>
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
              <H4 weight={"Regular"} testID={"nameSurname"}>
                {nameSurname.toLocaleUpperCase()}
              </H4>
            )
          )
        )}
      </View>
    }
    bottomRightCorner={
      <View style={{ justifyContent: "flex-end", flexDirection: "column" }}>
        <Image style={styles.bpayLogo} source={bancomatLogoMin} />
      </View>
    }
  />
);

const mapStateToProps = (state: GlobalState) => ({
  nameSurname: profileNameSurnameSelector(state)
});

export default connect(mapStateToProps)(BPayCard);
