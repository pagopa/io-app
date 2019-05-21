import debounce from "lodash/debounce";
import * as React from "react";
import { connect } from "react-redux";

import { none, Option, some } from "fp-ts/lib/Option";
import { Button, Icon, Input, Item, Text, View } from "native-base";
import { StyleSheet } from "react-native";
import I18n from "../i18n";
import { Dispatch } from "../store/actions/types";
import { GlobalState } from "../store/reducers/types";
import IconFont from "./ui/IconFont";

const MIN_CHARACTER_FOR_SEARCH = 3;

interface OwnProps {
  color?: string;
  isSearchEnabled?: boolean;
  searchResult?: React.ReactNode;
}

type Props = ReturnType<typeof mapStateToProps> &
  OwnProps &
  ReturnType<typeof mapDispatchToProps>;

type State = {
  searchText: Option<string>;
  debouncedSearchText: Option<string>;
};

const styles = StyleSheet.create({
  noSearchBarText: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  ioSearch: {
    // Corrects the position of the font icon inside the button
    paddingHorizontal: 2
  }
});

class SearchButton extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      searchText: none,
      debouncedSearchText: none
    };
  }

  public render() {
    const { searchText } = this.state;
    return (
      <React.Fragment>
        {searchText.isSome() ? (
          <Item>
            <Input
              placeholder={I18n.t("global.actions.search")}
              value={searchText.value}
              onChangeText={this.onSearchTextChange}
              autoFocus={true}
            />
            <Icon name="cross" onPress={this.onSearchDisable} />
          </Item>
        ) : (
          <Button onPress={this.handleSearchPress} transparent={true}>
            <IconFont
              name="io-search"
              color={this.props.color}
              accessible={true}
              accessibilityLabel={I18n.t("global.actions.search")}
            />
          </Button>
        )}
      </React.Fragment>
    );
  }

  // private renderSearch = () => {
  //   const { searchResult } = this.props;

  //   const { debouncedSearchText } = this.state;

  //   return debouncedSearchText
  //     .map(
  //       _ =>
  //         _.length < MIN_CHARACTER_FOR_SEARCH
  //           ? this.renderInvalidSearchBarText()
  //           : searchResult
  //     )
  //     .getOrElse(this.renderInvalidSearchBarText());
  // };

  private renderInvalidSearchBarText = () => {
    return (
      <View style={styles.noSearchBarText}>
        <Text>{I18n.t("global.search.invalidSearchBarText")}</Text>
      </View>
    );
  };

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
    300
  );

  private onSearchDisable = () => {
    this.setState({
      searchText: none,
      debouncedSearchText: none
    });
  };
}

const mapStateToProps = (state: GlobalState) => ({
  isDebugModeEnabled: state.debug.isDebugModeEnabled
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  //   dispatchIBReportOpen: (type: string) =>
  //     dispatch(instabugReportOpened({ type })),
  //   dispatchIBReportClosed: (type: string, how: string) =>
  //     dispatch(instabugReportClosed({ type, how }))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SearchButton);
