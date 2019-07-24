import I18n from "i18n-js";
import * as pot from "italia-ts-commons/lib/pot";
import { Text, View } from "native-base";
import React from "react";
import {
  Image,
  ImageSourcePropType,
  ListRenderItem,
  StyleSheet
} from "react-native";
import customVariables from "../theme/variables";
import ChooserList from "./ChooserList";

type OwnProps<T> = {
  listState: ReadonlyArray<T>;
  searchText: string;
  keyExtractor: (item: T, index: number) => string;
  renderItem: ListRenderItem<T>;
  onSearchItemContainsText?: (item: T, searchText: string) => boolean;
  noSearchResultsSourceIcon?: ImageSourcePropType;
  noSearchResultsSubtitle?: string;
};

type Props<T> = OwnProps<T>;

type State<T> = {
  potFilteredListStates: pot.Pot<ReadonlyArray<T>, string>;
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
class ChooserListSearch<T> extends React.PureComponent<Props<T>, State<T>> {
  constructor(props: Props<T>) {
    super(props);
    this.state = {
      potFilteredListStates: pot.noneLoading
    };
  }

  /**
   * Filter only the object that match the searchText.
   */
  private generateListStateMatchingSearchTextAsync(
    listState: ReadonlyArray<T>,
    searchText: string
  ): Promise<ReadonlyArray<T>> {
    const { onSearchItemContainsText } = this.props;
    // Don't apply the filter if searchText is empty
    if (searchText.length === 0) {
      return Promise.resolve(listState);
    }
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

  public async componentDidUpdate(prevProps: Props<T>) {
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
      <ChooserList<T>
        {...this.props}
        items={filteredListStates}
        isRefreshing={isFiltering}
      />
    ) : (
      this.renderResultEmptyComponent()
    );
  }
}

export default ChooserListSearch;
