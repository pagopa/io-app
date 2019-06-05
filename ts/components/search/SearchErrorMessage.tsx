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
    padding: customVariables.contentPadding,
    textAlign: "center"
  }
});

export enum ErrorSearchType {
  InvalidSearchBarText,
  NoResultsFound
}

/**
 * Print the icon according to current error type
 * @param errorType
 */
export const renderIconErrorSearch = (errorType: ErrorSearchType) => {
  switch (errorType) {
    case ErrorSearchType.InvalidSearchBarText:
      return require("../../../img/search/search-icon.png");
    case ErrorSearchType.NoResultsFound:
      return require("../../../img/search/beer-mug.png");
  }
};

/**
 * Convert the error type into a user-readable string
 * @param errorType
 */
export const renderMessageErrorSearch = (
  errorType: ErrorSearchType
): string => {
  switch (errorType) {
    case ErrorSearchType.InvalidSearchBarText:
      return I18n.t("global.search.invalidSearchBarText");
    case ErrorSearchType.NoResultsFound:
      return I18n.t("global.search.noResultsFound");
  }
};

type Props = {
  errorType: ErrorSearchType;
};

export class SearchErrorMessage extends React.PureComponent<Props> {
  public render() {
    const { errorType } = this.props;
    return (
      <View style={styles.contentWrapper}>
        <View spacer={true} extralarge={true} />
        <View spacer={true} extralarge={true} />

        <Image source={renderIconErrorSearch(errorType)} />
        <View spacer={true} />

        <Text style={styles.message}>
          {renderMessageErrorSearch(errorType)}
        </Text>
      </View>
    );
  }
}
