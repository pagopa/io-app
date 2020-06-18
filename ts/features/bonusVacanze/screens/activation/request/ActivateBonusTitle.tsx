import { H3, View } from "native-base";
import * as React from "react";
import { Image, StyleSheet } from "react-native";
import H5 from "../../../../../components/ui/H5";

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
export const ActivateBonusTitle: React.FunctionComponent<Props> = props => {
  return (
    <View>
      <View style={styles.row}>
        <H3 style={styles.text}>{props.title}</H3>
        {props.image ? (
          <Image
            source={{ uri: props.image }}
            resizeMode={"contain"}
            style={styles.image}
          />
        ) : null}
      </View>
      <View style={styles.row}>
        <H5 style={styles.text}>{props.description}</H5>
        <View style={styles.image} />
      </View>
    </View>
  );
};
