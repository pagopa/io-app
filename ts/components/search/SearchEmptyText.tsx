import { Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import I18n from "../../i18n";

const styles = StyleSheet.create({
  noSearchBarText: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  }
});

export class SearchEmptyText extends React.PureComponent {
  public render() {
    return (
      <View style={styles.noSearchBarText}>
        <Text>{I18n.t("global.search.invalidSearchBarText")}</Text>
      </View>
    );
  }
}
