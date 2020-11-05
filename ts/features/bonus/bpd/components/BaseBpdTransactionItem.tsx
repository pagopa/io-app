import { View } from "native-base";
import * as React from "react";
import { Image, ImageSourcePropType, StyleSheet } from "react-native";
import { H5 } from "../../../../components/core/typography/H5";
import { Label } from "../../../../components/core/typography/Label";
import pagoBancomatImage from "../../../../../img/wallet/cards-icons/pagobancomat.png";

type Props = {
  image: ImageSourcePropType;
  title: string;
  subtitle: string;
  rightText: string;
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row"
  },
  body: {
    height: 64,
    backgroundColor: "white",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 19
  },
  cardIcon: {
    width: 40,
    height: 25,
    overflow: "hidden",
    resizeMode: "contain",
    alignSelf: "center"
  }
});

export const BaseBpdTransactionItem: React.FunctionComponent<Props> = props => (
  <View style={[styles.body, styles.row]}>
    <View style={[styles.row]}>
      <Image source={pagoBancomatImage} style={styles.cardIcon} />
      <View hspacer={true} />
      <View>
        <Label color={"bluegrey"}>Intesa San paolo</Label>
        <H5>20:45 € 45,45</H5>
      </View>
    </View>

    <Label color={"bluegrey"}>6.5</Label>
  </View>
);
