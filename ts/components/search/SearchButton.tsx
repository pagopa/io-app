import color from "color";
import debounce from "lodash/debounce";
import * as React from "react";
import { connect } from "react-redux";

import { none, Option, some } from "fp-ts/lib/Option";
import { Button, Input, Item } from "native-base";
import I18n from "../../i18n";
import {
  clearSearchText,
  searchEnabled,
  updateSearchText
} from "../../store/actions/search";
import { Dispatch } from "../../store/actions/types";
import variables from "../../theme/variables";
import IconFont from "../ui/IconFont";

interface OwnProps {
  color?: string;
}

type Props = OwnProps & ReturnType<typeof mapDispatchToProps>;

type State = {
  searchText: Option<string>;
  debouncedSearchText: Option<string>;
};

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
              onEndEditing={this.onSearchDisable}
              placeholderTextColor={color(variables.brandGray)
                .darken(0.2)
                .string()}
            />
            <Button onPress={this.onSearchDisable} transparent={true}>
              <IconFont
                name="io-close"
                color={this.props.color}
                accessible={true}
                accessibilityLabel={I18n.t("global.buttons.close")}
              />
            </Button>
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

  private handleSearchPress = () => {
    const { searchText } = this.state;
    this.setState({
      searchText: some("")
    });
    this.props.dispatchSearchText(searchText);
    this.props.dispatchSearchEnabled(true);
  };

  private onSearchTextChange = (text: string) => {
    this.setState({
      searchText: some(text)
    });
    this.updateDebouncedSearchText(text);
  };

  private updateDebouncedSearchText = debounce((text: string) => {
    this.setState({
      debouncedSearchText: some(text)
    });
    this.props.dispatchSearchText(this.state.debouncedSearchText);
  }, 300);

  private onSearchDisable = () => {
    this.setState({
      searchText: none,
      debouncedSearchText: none
    });
    this.props.dispatchClearSearchText();
    this.props.dispatchSearchEnabled(false);
  };
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  dispatchSearchText: (searchText: Option<string>) =>
    dispatch(updateSearchText(searchText)),
  dispatchClearSearchText: () => dispatch(clearSearchText()),
  dispatchSearchEnabled: (isSearchEnabled: boolean) =>
    dispatch(searchEnabled(isSearchEnabled))
});

export default connect(
  null,
  mapDispatchToProps
)(SearchButton);
