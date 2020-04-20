import { Body, Left, Right, Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { connect } from "react-redux";
import IconFont from "../../components/ui/IconFont";
import I18n from "../../i18n";
import { navigateBack } from "../../store/actions/navigation";
import { Dispatch } from "../../store/actions/types";
import { isSearchEnabledSelector } from "../../store/reducers/search";
import { GlobalState } from "../../store/reducers/types";
import variables from "../../theme/variables";
import ButtonDefaultOpacity from "../ButtonDefaultOpacity";
import GoBackButton from "../GoBackButton";
import { InstabugButtons } from "../InstabugButtons";
import SearchButton, { SearchType } from "../search/SearchButton";
import TouchableDefaultOpacity from "../TouchableDefaultOpacity";
import AppHeader from "../ui/AppHeader";

const styles = StyleSheet.create({
  helpButton: {
    padding: 8
  },

  noLeft: {
    marginLeft: variables.contentPadding - variables.appHeaderPaddingHorizontal
  }
});

interface OwnProps {
  dark?: boolean;
  headerTitle?: string;
  goBack?: React.ComponentProps<typeof GoBackButton>["goBack"];
  primary?: boolean;
  appLogo?: boolean;
  onShowHelp?: () => void;
  // A property to set a custom AppHeader body
  body?: React.ReactNode;
  isSearchAvailable?: boolean;
  searchType?: SearchType;
  customRightIcon?: {
    iconName: string;
    onPress: () => void;
  };
  customGoBack?: React.ReactNode;
}

type Props = OwnProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

class BaseHeaderComponent extends React.PureComponent<Props> {
  /**
   * if go back is a function it will be returned
   * otherwise the default goback navigation will be returned
   */
  private getGoBackHandler = () => {
    return typeof this.props.goBack === "function"
      ? this.props.goBack()
      : this.props.navigateBack();
  };

  private renderHeader = () => {
    const { customGoBack, headerTitle } = this.props;
    // if customGoBack is provided only the header text will be rendered
    if (customGoBack) {
      return (
        <Text white={this.props.primary} numberOfLines={1}>
          {headerTitle}
        </Text>
      );
    }
    // if no customGoBack is provided also the header text could be press to execute goBack
    // note goBack could a boolean or a function (check this.getGoBackHandler)
    return (
      <TouchableDefaultOpacity onPress={this.getGoBackHandler}>
        <Text white={this.props.primary} numberOfLines={1}>
          {headerTitle}
        </Text>
      </TouchableDefaultOpacity>
    );
  };

  public render() {
    const { goBack, headerTitle, body, isSearchEnabled, dark } = this.props;
    return (
      <AppHeader
        primary={this.props.primary}
        noShadow={isSearchEnabled}
        dark={dark}
      >
        {this.renderLeft()}

        {!isSearchEnabled && (
          <Body style={goBack ? {} : styles.noLeft}>
            {body ? body : headerTitle && this.renderHeader()}
          </Body>
        )}

        {this.renderRight()}
      </AppHeader>
    );
  }

  private renderRight = () => {
    const {
      isSearchEnabled,
      onShowHelp,
      isSearchAvailable,
      searchType,
      customRightIcon
    } = this.props;

    return (
      <Right>
        {!isSearchEnabled && <InstabugButtons />}
        {onShowHelp &&
          !isSearchEnabled && (
            <ButtonDefaultOpacity
              onPress={onShowHelp}
              style={styles.helpButton}
              transparent={true}
            >
              <IconFont name="io-question" />
            </ButtonDefaultOpacity>
          )}

        {isSearchAvailable && <SearchButton searchType={searchType} />}
        {customRightIcon &&
          !isSearchEnabled && (
            <ButtonDefaultOpacity
              onPress={customRightIcon.onPress}
              style={styles.helpButton}
              transparent={true}
            >
              <IconFont name={customRightIcon.iconName} />
            </ButtonDefaultOpacity>
          )}
      </Right>
    );
  };

  private renderGoBack = () => {
    const { goBack, dark, customGoBack } = this.props;
    return customGoBack ? (
      <Left>{customGoBack}</Left>
    ) : (
      goBack && (
        <Left>
          <GoBackButton
            testID={"back-button"}
            onPress={goBack}
            accessible={true}
            accessibilityLabel={I18n.t("global.buttons.back")}
            white={dark}
          />
        </Left>
      )
    );
  };

  private renderLeft = () => {
    const { isSearchEnabled, appLogo, primary, dark } = this.props;
    return (
      !isSearchEnabled &&
      (appLogo ? (
        <Left>
          <View>
            <IconFont
              name={"io-logo"}
              color={primary || dark ? "white" : variables.brandPrimary}
            />
          </View>
        </Left>
      ) : (
        this.renderGoBack()
      ))
    );
  };
}

const mapStateToProps = (state: GlobalState) => ({
  isSearchEnabled: isSearchEnabledSelector(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateBack: () => {
    dispatch(navigateBack());
  }
});

export const BaseHeader = connect(
  mapStateToProps,
  mapDispatchToProps
)(BaseHeaderComponent);
