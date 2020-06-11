import { H3, View } from "native-base";
import * as React from "react";
import { Image, StyleSheet } from "react-native";
import H5 from "../../../../../../components/ui/H5";
import { activateBonusStyle } from "./Style";

type Props = {
  title: string;
  description: string;
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  image: {
    width: 48,
    height: 48
  }
});

const bonusVacanzeImage = require("../../../../../../../img/bonus/bonusVacanze/vacanze.png");

/**
 * The title of the ActivateBonus Screen, displaying some text with an image on the right
 * @param props
 * @constructor
 */
export const ActivateBonusTitle: React.FunctionComponent<Props> = props => {
  return (
    <View style={activateBonusStyle.horizontalPadding}>
      <View style={styles.row}>
        <H3>{props.title}</H3>
        <Image
          source={bonusVacanzeImage}
          resizeMode={"contain"}
          style={styles.image}
        />
      </View>
      <View style={styles.row}>
        <H5>{props.description}</H5>
        <View style={styles.image} />
      </View>
    </View>
  );
};
