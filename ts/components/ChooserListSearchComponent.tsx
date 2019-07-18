import I18n from "i18n-js";
import * as pot from "italia-ts-commons/lib/pot";
import { Text, View } from "native-base";
import React, { ComponentProps } from "react";
import { Image, ImageSourcePropType, StyleSheet } from "react-native";
import customVariables from "../theme/variables";
import ChooserList from "./ChooserList";

type OwnProps = {
  listState: ReadonlyArray<any>;
  searchText: string;
  onSearchItemContainsText?: (item: any, searchText: string) => boolean;
  noSearchResultsSourceIcon?: ImageSourcePropType;
  noSearchResultsSubtitle?: string;
};

type Props = OwnProps &
  Pick<ComponentProps<typeof ChooserList>, "keyExtractor" | "renderItem">;

type State = {
  potFilteredListStates: pot.Pot<ReadonlyArray<any>, string>;
};

const styles = StyleSheet.create({
  emptyContentWrapper: {
    flex: 1,
    alignItems: "center"
  },
  emptyTitle: {
    fontSize: customVariables.fontSizeBase,
    paddingRight: customVariables.contentPadding,
    paddingLeft: customVariables.contentPadding,
    paddingTop: customVariables.contentPadding,
    textAlign: "center"
  },
  emptySubtitle: {
    fontSize: customVariables.fontSizeBase,
    paddingRight: customVariables.contentPadding,
    paddingLeft: customVariables.contentPadding,
    paddingBottom: customVariables.contentPadding,
    textAlign: "center"
  }
});
/**
 * A component that renders a list of object that match a search text.
 */
class ChooserListSearchComponent extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      potFilteredListStates: pot.noneLoading
    };
  }

  /**
   * Filter only the object that match the searchText.
   */
  private generateListStateMatchingSearchTextAsync(
    listState: ReadonlyArray<any>,
    searchText: string
  ): Promise<ReadonlyArray<any>> {
    const { onSearchItemContainsText } = this.props;
    return new Promise(resolve => {
      const result = listState.filter(
        _ =>
          onSearchItemContainsText
            ? onSearchItemContainsText(_, searchText)
            : false
      );
      resolve(result);
    });
  }

  private renderResultEmptyComponent() {
    const { noSearchResultsSourceIcon, noSearchResultsSubtitle } = this.props;
    return (
      <View style={styles.emptyContentWrapper}>
        <View spacer={true} />

        <Text style={styles.emptyTitle} bold={true}>
          {I18n.t("global.search.noResultsTitle")}
        </Text>

        {noSearchResultsSubtitle && (
          <Text style={styles.emptySubtitle}>{noSearchResultsSubtitle}</Text>
        )}

        <Image
          source={
            noSearchResultsSourceIcon
              ? noSearchResultsSourceIcon
              : require("../../img/search/beer-mug.png")
          }
        />
        <View spacer={true} />
      </View>
    );
  }

  public async componentDidMount() {
    const { listState, searchText } = this.props;
    const { potFilteredListStates } = this.state;

    // Set filtering status
    this.setState({
      potFilteredListStates: pot.toLoading(potFilteredListStates)
    });

    // Start filtering list
    const filteredServiceSectionsStates = await this.generateListStateMatchingSearchTextAsync(
      listState,
      searchText
    );

    // Unset filtering status
    this.setState({
      potFilteredListStates: pot.some(filteredServiceSectionsStates)
    });
  }

  public async componentDidUpdate(prevProps: Props) {
    const { listState: prevListState, searchText: prevSearchText } = prevProps;
    const { listState, searchText } = this.props;
    const { potFilteredListStates } = this.state;

    if (listState !== prevListState || searchText !== prevSearchText) {
      // Set filtering status
      this.setState({
        potFilteredListStates: pot.toLoading(potFilteredListStates)
      });

      // Start filtering list
      const filteredListStates = await this.generateListStateMatchingSearchTextAsync(
        listState,
        searchText
      );

      // Unset filtering status
      this.setState({
        potFilteredListStates: pot.some(filteredListStates)
      });
    }
  }

  public render() {
    const { potFilteredListStates } = this.state;

    const isFiltering = pot.isLoading(potFilteredListStates);

    const filteredListStates = pot.getOrElse(potFilteredListStates, []);

    return filteredListStates.length > 0 ? (
      <ChooserList
        {...this.props}
        items={filteredListStates}
        refreshing={isFiltering}
      />
    ) : (
      this.renderResultEmptyComponent()
    );
  }
}

export default ChooserListSearchComponent;
