import { Text, View } from "native-base";
import * as React from "react";
import { Image, StyleSheet } from "react-native";
import I18n from "../../i18n";
import customVariables from "../../theme/variables";

const styles = StyleSheet.create({
  contentWrapper: {
    flex: 1,
    alignItems: "center"
  },
  message: {
    fontSize: customVariables.fontSizeBase,
    paddingTop: customVariables.contentPadding,
    textAlign: "center"
  }
});

export class SearchEmptyText extends React.PureComponent {
  public render() {
    return (
      <View style={styles.contentWrapper}>
        <View spacer={true} extralarge={true} />
        <View spacer={true} extralarge={true} />

        <Image source={require("../../../img/search/search-icon.png")} />
        <View spacer={true} />

        <Text style={styles.message}>
          {I18n.t("global.search.invalidSearchBarText")}
        </Text>
      </View>
    );
  }
}
