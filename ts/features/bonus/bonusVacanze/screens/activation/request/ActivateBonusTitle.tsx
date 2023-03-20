import * as React from "react";
import { View, Image, StyleSheet } from "react-native";
import { H2 } from "../../../../../../components/core/typography/H2";
import { H1 } from "../../../../../../components/core/typography/H1";

type Props = {
  title: string;
  description: string;
  image?: string;
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  text: {
    width: "80%"
  },
  image: {
    width: 48,
    height: 48
  }
});

/**
 * The title of the ActivateBonus Screen, displaying some text with an image on the right
 * @param props
 * @constructor
 */
export const ActivateBonusTitle: React.FunctionComponent<Props> = props => (
  <View>
    <View style={styles.row}>
      <H1 style={styles.text}>{props.title}</H1>
      {props.image ? (
        <Image
          source={{ uri: props.image }}
          resizeMode={"contain"}
          style={styles.image}
        />
      ) : null}
    </View>
    <View style={styles.row}>
      <H2 style={styles.text}>{props.description}</H2>
      <View style={styles.image} />
    </View>
  </View>
);
