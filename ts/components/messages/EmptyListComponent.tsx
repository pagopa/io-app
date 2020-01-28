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
    paddingTop: customVariables.contentPadding,
    fontSize: customVariables.fontSizeSmall
  }
});

type Props = Readonly<{
  image: ImageSourcePropType;
  title: string;
  subtitle?: string;
}>;

export class EmptyListComponent extends React.Component<Props> {
  public render() {
    return (
      <View style={styles.view}>
        <View spacer={true} />
        <Image source={this.props.image} />
        <Text style={styles.title}>{this.props.title}</Text>
        {this.props.subtitle && (
          <Text style={styles.subtitle}>{this.props.subtitle}</Text>
        )}
      </View>
    );
  }
}
