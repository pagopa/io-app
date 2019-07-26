import color from "color";
import { none, Option, some } from "fp-ts/lib/Option";
import I18n from "i18n-js";
import { Millisecond } from "italia-ts-commons/lib/units";
import { debounce } from "lodash";
import { Body, Button, Content, Input, Item, Right, View } from "native-base";
import * as React from "react";
import {
  ImageSourcePropType,
  KeyboardAvoidingView,
  ListRenderItem,
  Platform,
  StyleSheet
} from "react-native";
import variables from "../theme/variables";
import customVariables from "../theme/variables";
import ChooserList from "./ChooserList";
import ChooserListSearch from "./ChooserListSearch";
import AppHeader from "./ui/AppHeader";
import FooterWithButtons from "./ui/FooterWithButtons";
import IconFont from "./ui/IconFont";

type Props<T> = {
  items: ReadonlyArray<T>;
  keyExtractor: (item: T, index: number) => string;
  renderItem: ListRenderItem<T>;
  onCancel: () => void;
  isRefreshEnabled: boolean;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  isSearchEnabled: boolean;
  onSearchItemContainsText?: (item: T, searchText: string) => boolean;
  noSearchResultsSourceIcon?: ImageSourcePropType;
  noSearchResultsSubtitle?: string;
};

type State = {
  searchText: Option<string>;
  debouncedSearchText: Option<string>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  content: {
    flex: 1
  },
  headerNoSearch: {
    height: customVariables.contentPadding / 2
  }
});
// The number of milliseconds to delay for search
const DEBOUNCED_TIME = 300 as Millisecond;

/**
 * A component for view, search and select a list of items
 * TODO select will be introduced with story https://www.pivotaltracker.com/story/show/167102335
 */
export class ChooserListContainer<T> extends React.PureComponent<
  Props<T>,
  State
> {
  constructor(props: Props<T>) {
    super(props);
    this.state = {
      // The text entered by the user for the search
      searchText: this.props.isSearchEnabled ? some("") : none,
      // The debounced text used to avoid executing a search for each typed char
      debouncedSearchText: this.props.isSearchEnabled ? some("") : none
    };
  }

  private onPressCancel = () => {
    this.props.onCancel();
  };

  private onPressSave = () => {
    this.onPressCancel();
  };

  /**
   * Header SearchBar
   */
  private renderSearchBar() {
    const { searchText } = this.state;
    return (
      <React.Fragment>
        <Body />
        <Right>
          {searchText.isSome() ? (
            <Item>
              <Input
                placeholder={I18n.t("global.actions.search")}
                value={searchText.value}
                onChangeText={this.onSearchTextChange}
                autoFocus={true}
                placeholderTextColor={color(variables.brandGray)
                  .darken(0.2)
                  .string()}
              />
              <Button onPress={this.onSearchDisable} transparent={true}>
                <IconFont
                  name="io-close"
                  accessible={true}
                  accessibilityLabel={I18n.t("global.buttons.close")}
                />
              </Button>
            </Item>
          ) : (
            <Button onPress={this.handleSearchPress} transparent={true}>
              <IconFont
                name="io-search"
                accessible={true}
                accessibilityLabel={I18n.t("global.actions.search")}
              />
            </Button>
          )}
        </Right>
      </React.Fragment>
    );
  }

  /**
   * Search
   */
  private handleSearchPress = () => {
    this.setState({
      searchText: some("")
    });
  };

  private onSearchTextChange = (text: string) => {
    this.setState({
      searchText: some(text)
    });
    this.updateDebouncedSearchText(text);
  };

  private updateDebouncedSearchText = debounce(
    (text: string) =>
      this.setState({
        debouncedSearchText: some(text)
      }),
    DEBOUNCED_TIME
  );

  private onSearchDisable = () => {
    this.setState({
      searchText: none,
      debouncedSearchText: none
    });
  };

  /**
   * Footer
   */
  private renderFooterButtons() {
    const cancelButtonProps = {
      block: true,
      light: true,
      bordered: true,
      onPress: this.onPressCancel,
      title: I18n.t("global.buttons.cancel")
    };
    const saveButtonProps = {
      block: true,
      primary: true,
      onPress: this.onPressSave,
      title: I18n.t("global.buttons.saveSelection")
    };

    return (
      <FooterWithButtons
        type="TwoButtonsInlineThird"
        leftButton={cancelButtonProps}
        rightButton={saveButtonProps}
      />
    );
  }

  /**
   * Render Search component
   */
  private renderSearch = () => {
    const {
      items,
      onSearchItemContainsText,
      renderItem,
      keyExtractor,
      noSearchResultsSourceIcon,
      noSearchResultsSubtitle
    } = this.props;
    const { debouncedSearchText } = this.state;
    return (
      <ChooserListSearch<T>
        listState={items}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        searchText={debouncedSearchText.getOrElse("")}
        onSearchItemContainsText={onSearchItemContainsText}
        noSearchResultsSourceIcon={noSearchResultsSourceIcon}
        noSearchResultsSubtitle={noSearchResultsSubtitle}
      />
    );
  };

  public render() {
    const {
      isRefreshEnabled,
      isRefreshing,
      isSearchEnabled,
      items,
      onRefresh,
      onSearchItemContainsText,
      keyExtractor,
      renderItem
    } = this.props;

    const isOnRefresh =
      isRefreshEnabled && (isRefreshing || false) && onRefresh !== undefined;
    const refreshProps = {
      onRefresh,
      isRefreshing: isOnRefresh
    };

    return (
      <View style={styles.container}>
        <AppHeader style={!isSearchEnabled ? styles.headerNoSearch : undefined}>
          {isSearchEnabled && this.renderSearchBar()}
        </AppHeader>
        <Content noPadded={true} style={styles.content}>
          <View>
            {isSearchEnabled && onSearchItemContainsText
              ? this.renderSearch()
              : items.length > 0 && (
                  <ChooserList<T>
                    {...refreshProps}
                    items={items}
                    keyExtractor={keyExtractor}
                    renderItem={renderItem}
                  />
                )}
          </View>
        </Content>
        <KeyboardAvoidingView
          behavior="position"
          keyboardVerticalOffset={Platform.select({
            ios: 0,
            android: customVariables.contentPadding
          })}
        >
          {this.renderFooterButtons()}
        </KeyboardAvoidingView>
      </View>
    );
  }
}
