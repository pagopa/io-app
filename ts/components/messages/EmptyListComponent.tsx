import { Text, View } from "native-base";
import * as React from "react";
import { Image, ImageSourcePropType, StyleSheet } from "react-native";
import customVariables from "../../theme/variables";

const styles = StyleSheet.create({
  view: {
    padding: customVariables.contentPadding,
    alignItems: "center"
  },
  title: {
    paddingTop: customVariables.contentPadding
  },
  subtitle: {
    textAlign: "center",
    paddingTop: customVariables.contentPadding
  }
});

type Props = Readonly<{
  image: ImageSourcePropType;
  title: string;
  subtitle?: string;
}>;

export const EmptyListComponent = (props: Props) => (
    <View style={styles.view}>
      <View spacer={true} />
      <Image source={props.image} />
      <Text style={styles.title}>{props.title}</Text>
      {props.subtitle && <Text style={styles.subtitle}>{props.subtitle}</Text>}
    </View>
  );
