import * as React from "react";
import { View, Image, StyleSheet } from "react-native";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import I18n from "../../i18n";
import { VSpacer } from "../core/spacer/Spacer";
import { Body } from "../core/typography/Body";
import { IOStyles } from "../core/variables/IOStyles";
import { MIN_CHARACTER_SEARCH_TEXT } from "./SearchButton";

const styles = StyleSheet.create({
  invalidSearchBarText: {
    height: hp("15%")
  },
  noResultsFound: {
    height: hp("15%")
  }
});

type ErrorSearchType = "InvalidSearchBarText" | "NoResultsFound";

/**
 * Print the icon according to current error type
 * @param errorType
 */
export const renderIconErrorSearch = (errorType: ErrorSearchType) => {
  switch (errorType) {
    case "InvalidSearchBarText":
      return (
        <Image
          style={styles.invalidSearchBarText}
          resizeMode="contain"
          source={require("../../../img/search/search-icon.png")}
        />
      );
    case "NoResultsFound":
      return (
        <Image
          style={styles.noResultsFound}
          resizeMode="contain"
          source={require("../../../img/search/beer-mug.png")}
        />
      );
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
    case "InvalidSearchBarText":
      return I18n.t("global.search.invalidSearchBarText", {
        minCharacter: MIN_CHARACTER_SEARCH_TEXT
      });
    case "NoResultsFound":
      return I18n.t("global.search.noResultsFound");
  }
};

type Props = {
  errorType: ErrorSearchType;
};

export class SearchNoResultMessage extends React.PureComponent<Props> {
  public render() {
    const { errorType } = this.props;
    return (
      <View style={[IOStyles.flex, IOStyles.alignCenter]}>
        <VSpacer size={40} />

        {renderIconErrorSearch(errorType)}

        <View style={[IOStyles.horizontalContentPadding, IOStyles.alignCenter]}>
          <VSpacer size={24} />
          <Body>{renderMessageErrorSearch(errorType)}</Body>
          <VSpacer size={24} />
        </View>
      </View>
    );
  }
}
