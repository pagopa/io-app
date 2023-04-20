import * as pot from "@pagopa/ts-commons/lib/pot";
import { Option } from "fp-ts/lib/Option";
import React, { ComponentProps } from "react";
import { View, Image, ImageSourcePropType } from "react-native";
import I18n from "../i18n";
import ChooserList from "./ChooserList";
import ChooserListItem from "./ChooserListItem";
import { VSpacer } from "./core/spacer/Spacer";
import { Body } from "./core/typography/Body";
import { IOStyles } from "./core/variables/IOStyles";

type OwnProps<T> = {
  listState: ReadonlyArray<T>;
  searchText: string;
  matchingTextPredicate?: (item: T, searchText: string) => boolean;
  noSearchResultsSourceIcon?: ImageSourcePropType;
  noSearchResultsSubtitle?: string;
  keyExtractor: (item: T) => string;
  itemTitleExtractor: (item: T) => string;
  selectedItemIds: Option<Set<string>>;
};

type ChooserListItemProps = "itemIconComponent" | "onPressItem";

type Props<T> = OwnProps<T> &
  Pick<ComponentProps<typeof ChooserListItem>, ChooserListItemProps>;

type State<T> = {
  potFilteredListStates: pot.Pot<ReadonlyArray<T>, string>;
};

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
   * Filter object matching the given searchText.
   */
  private generateListStateMatchingSearchTextAsync(
    listState: ReadonlyArray<T>,
    searchText: string
  ): Promise<ReadonlyArray<T>> {
    const { matchingTextPredicate } = this.props;
    // Don't apply the filter if searchText is empty
    if (searchText.length === 0) {
      return Promise.resolve(listState);
    }
    return new Promise(resolve => {
      const result = listState.filter(_ =>
        matchingTextPredicate ? matchingTextPredicate(_, searchText) : false
      );
      resolve(result);
    });
  }

  private renderResultEmptyComponent() {
    const { noSearchResultsSourceIcon, noSearchResultsSubtitle } = this.props;
    return (
      <View style={[IOStyles.flex, IOStyles.alignCenter]}>
        <VSpacer size={16} />

        <View style={[IOStyles.alignCenter, IOStyles.horizontalContentPadding]}>
          <VSpacer size={24} />
          <Body weight="SemiBold">
            {I18n.t("global.search.noResultsTitle")}
          </Body>
        </View>

        {noSearchResultsSubtitle && (
          <View
            style={[IOStyles.alignCenter, IOStyles.horizontalContentPadding]}
          >
            <Body weight="SemiBold">{noSearchResultsSubtitle}</Body>
            <VSpacer size={24} />
          </View>
        )}

        <Image
          source={
            noSearchResultsSourceIcon
              ? noSearchResultsSourceIcon
              : require("../../img/search/beer-mug.png")
          }
        />
        <VSpacer size={16} />
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
    const filteredServiceSectionsStates =
      await this.generateListStateMatchingSearchTextAsync(
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
      const filteredListStates =
        await this.generateListStateMatchingSearchTextAsync(
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
