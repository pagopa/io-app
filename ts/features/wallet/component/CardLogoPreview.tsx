import * as React from "react";
import { Image, ImageSourcePropType, StyleSheet } from "react-native";
import { CardLayoutPreview } from "./CardLayoutPreview";

type Props = {
  left: React.ReactNode;
  image: ImageSourcePropType;
  onPress?: () => void;
};

const styles = StyleSheet.create({
  cardLogo: {
    height: 30,
    width: 48
  }
});

/**
 * A preview card that show as right section an image of fixed dimensions.
 * @param props
 * @constructor
 */
export const CardLogoPreview: React.FunctionComponent<Props> = props => (
  <CardLayoutPreview
    left={props.left}
    onPress={props.onPress}
    right={
      <Image
        source={props.image}
        style={styles.cardLogo}
        testID={"cardImage"}
      />
    }
  />
);
