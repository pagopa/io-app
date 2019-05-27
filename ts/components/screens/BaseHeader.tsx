import { Body, Button, Left, Right, Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";

import IconFont from "../../components/ui/IconFont";
import AppHeader from "../ui/AppHeader";

import { connect } from "react-redux";
import I18n from "../../i18n";
import { isSearchEnabledSelector } from "../../store/reducers/search";
import { GlobalState } from "../../store/reducers/types";
import variables from "../../theme/variables";
import GoBackButton from "../GoBackButton";
import { InstabugButtons } from "../InstabugButtons";
import SearchButton, { SearchType } from "../search/SearchButton";

const styles = StyleSheet.create({
  helpButton: {
    padding: 8
  },

  noLeft: {
    marginLeft: variables.contentPadding - variables.appHeaderPaddingHorizontal
  }
});

interface OwnProps {
  headerTitle?: string;
  goBack?: React.ComponentProps<typeof GoBackButton>["goBack"];
  primary?: boolean;
  appLogo?: boolean;
  onShowHelp?: () => void;
  // A property to set a custom AppHeader body
  body?: React.ReactNode;
  isSearchAvailable?: boolean;
  searchType?: SearchType;
}

type Props = OwnProps & ReturnType<typeof mapStateToProps>;

class BaseHeaderComponent extends React.PureComponent<Props> {
  public render() {
    const { goBack, headerTitle, body, isSearchEnabled } = this.props;
    return (
      <AppHeader primary={this.props.primary} noShadow={isSearchEnabled}>
        {this.renderLeft()}

        {!isSearchEnabled && (
          <Body style={goBack ? {} : styles.noLeft}>
            {body
              ? body
              : headerTitle && (
                  <Text white={this.props.primary} numberOfLines={1}>
                    {headerTitle}
                  </Text>
                )}
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
      searchType
    } = this.props;

    return (
      <Right>
        {!isSearchEnabled && <InstabugButtons />}
        {onShowHelp &&
          !isSearchEnabled && (
            <Button
              onPress={onShowHelp}
              style={styles.helpButton}
              transparent={true}
            >
              <IconFont name="io-question" />
            </Button>
          )}
        {isSearchAvailable && <SearchButton searchType={searchType} />}
      </Right>
    );
  };

  private renderLeft = () => {
    const { isSearchEnabled, appLogo, goBack, primary } = this.props;

    return (
      !isSearchEnabled &&
      (appLogo ? (
        <Left>
          <View>
            <IconFont
              name="io-logo"
              color={primary ? "white" : variables.brandPrimary}
            />
          </View>
        </Left>
      ) : (
        goBack && (
          <Left>
            <GoBackButton
              testID="back-button"
              onPress={goBack}
              accessible={true}
              accessibilityLabel={I18n.t("global.buttons.back")}
            />
          </Left>
        )
      ))
    );
  };
}

const mapStateToProps = (state: GlobalState) => ({
  isSearchEnabled: isSearchEnabledSelector(state)
});

export const BaseHeader = connect(mapStateToProps)(BaseHeaderComponent);
