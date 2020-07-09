import { Body, Left, Right, Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { NavigationEvents } from "react-navigation";
import { connect } from "react-redux";
import IconFont from "../../components/ui/IconFont";
import I18n from "../../i18n";
import { navigateBack } from "../../store/actions/navigation";
import { Dispatch } from "../../store/actions/types";
import { navHistorySelector } from "../../store/reducers/navigationHistory";
import { isPagoPATestEnabledSelector } from "../../store/reducers/persistedPreferences";
import { isSearchEnabledSelector } from "../../store/reducers/search";
import { GlobalState } from "../../store/reducers/types";
import variables from "../../theme/variables";
import { setAccessibilityFocus } from "../../utils/accessibility";
import ButtonDefaultOpacity from "../ButtonDefaultOpacity";
import GoBackButton from "../GoBackButton";
import InstabugChatsComponent from "../InstabugChatsComponent";
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
  showInstabugChat?: boolean;
  searchType?: SearchType;
  customRightIcon?: {
    iconName: string;
    onPress: () => void;
    accessibilityLabel?: string;
  };
  customGoBack?: React.ReactNode;
}

type Props = OwnProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

/** A component representing the properties common to all the screens (and the most of modal/overlay displayed) */
class BaseHeaderComponent extends React.PureComponent<Props> {
  private firstElementRef = React.createRef<View>();

  public constructor(props: Props) {
    super(props);
    this.handleFocus = this.handleFocus.bind(this);
  }

  // set accessibility focus when component is mounted
  // it should be used paired with avoidNavigationEvents === true (navigation context not available)
  public componentDidMount() {
    if (this.props.avoidNavigationEvents) {
      setTimeout(() => setAccessibilityFocus(this.firstElementRef), 10);
    }
  }

  // set accessibility focus when this view comes visible
  public handleFocus() {
    setAccessibilityFocus(this.firstElementRef);
  }

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
    const isWhite = this.props.primary || this.props.dark;

    // if customGoBack is provided or if the app is in accessibility mode only the header text will be rendered
    if (customGoBack) {
      return (
        <Text
          white={isWhite}
          numberOfLines={1}
          accessible={false}
          accessibilityElementsHidden={true}
          importantForAccessibility="no-hide-descendants"
        >
          {headerTitle}
        </Text>
      );
    }
    // if no customGoBack is provided also the header text could be press to execute goBack
    // note goBack could a boolean or a function (check this.getGoBackHandler)
    return (
      <TouchableDefaultOpacity
        onPress={this.getGoBackHandler}
        accessible={false}
      >
        <Text
          white={isWhite}
          numberOfLines={1}
          accessibilityElementsHidden={true}
          importantForAccessibility="no-hide-descendants"
        >
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
            <View ref={this.firstElementRef} accessible={true}>
              {body ? body : headerTitle && this.renderHeader()}
            </View>
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
      showInstabugChat,
      customRightIcon
    } = this.props;

    return (
      <Right>
        {!isSearchEnabled &&
          showInstabugChat !== false && <InstabugChatsComponent />}
        {onShowHelp &&
          !isSearchEnabled && (
            <ButtonDefaultOpacity
              onPress={onShowHelp}
              style={styles.helpButton}
              transparent={true}
              accessibilityLabel={I18n.t(
                "global.accessibility.contextualHelp.open.label"
              )}
              accessibilityHint={I18n.t(
                "global.accessibility.contextualHelp.open.hint"
              )}
            >
              <IconFont name={"io-question"} />
            </ButtonDefaultOpacity>
          )}

        {isSearchAvailable && <SearchButton searchType={searchType} />}
        {customRightIcon &&
          !isSearchEnabled && (
            <ButtonDefaultOpacity
              onPress={customRightIcon.onPress}
              style={styles.helpButton}
              transparent={true}
              accessible={customRightIcon.accessibilityLabel !== undefined}
              accessibilityLabel={customRightIcon.accessibilityLabel}
            >
              <IconFont name={customRightIcon.iconName} />
            </ButtonDefaultOpacity>
          )}
        {this.props.isNavigationHistoryNonEmpty && (
          <NavigationEvents onDidFocus={this.handleFocus} />
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
    const {
      isSearchEnabled,
      appLogo,
      primary,
      dark,
      isPagoPATestEnabled
    } = this.props;

    const iconColor = isPagoPATestEnabled
      ? variables.brandHighlight
      : primary || dark
        ? variables.colorWhite
        : variables.brandPrimary;

    return (
      !isSearchEnabled &&
      (appLogo ? (
        <Left>
          <View
            accessible={true}
            accessibilityElementsHidden={true}
            importantForAccessibility="no-hide-descendants"
          >
            <IconFont name={"io-logo"} color={iconColor} accessible={false} />
          </View>
        </Left>
      ) : (
        this.renderGoBack()
      ))
    );
  };
}

const mapStateToProps = (state: GlobalState) => ({
  isSearchEnabled: isSearchEnabledSelector(state),
  isNavigationHistoryNonEmpty: navHistorySelector(state).length > 0,
  isPagoPATestEnabled: isPagoPATestEnabledSelector(state)
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
