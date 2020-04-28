import { Body, Left, Right, Text, View } from "native-base";
import * as React from "react";
import { StyleSheet, BackHandler } from "react-native";
import { connect } from "react-redux";
import I18n from "../../i18n";
import { navigateBack } from "../../store/actions/navigation";
import { Dispatch } from "../../store/actions/types";
import { isSearchEnabledSelector } from "../../store/reducers/search";
import { GlobalState } from "../../store/reducers/types";
import variables from "../../theme/variables";
import ButtonDefaultOpacity from "../ButtonDefaultOpacity";
import GoBackButton from "../GoBackButton";
import GoBackButtonModal from "../GoBackButtonModal";
import InstabugChatsComponent from "../InstabugChatsComponent";
import SearchButton, { SearchType } from "../search/SearchButton";
import TouchableDefaultOpacity from "../TouchableDefaultOpacity";
import AppHeader from "../ui/AppHeader";
import IconFont from "../ui/IconFont";

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
  primary?: boolean;
  appLogo?: boolean;
  onShowHelp?: () => void;
  // A property to set a custom AppHeader body
  body?: React.ReactNode;
  isSearchAvailable?: boolean;
  searchType?: SearchType;
  customRightBack?: {
    iconName: string;
    onPress: () => void;
  };
  goBack?: (() => void)| boolean;
  isModal?: boolean;
  handleHardwareBack?: boolean;
}

type Props = OwnProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

/** A component representing the properties common to all the screens (and the most of modal/overlay displayed) */
class BaseHeaderComponent extends React.PureComponent<Props> {
  
  public componentDidMount(){
    if(this.props.handleHardwareBack){
      BackHandler.addEventListener("hardwareBackPress", this.getGoBackHandler);
    }
  }

  public componentWillUnmount(){
    if(this.props.handleHardwareBack){
      BackHandler.removeEventListener("hardwareBackPress", this.getGoBackHandler);
    }
  }
  
  /**
   * if go back is a function it will be returned
   * otherwise the default goback navigation will be returned
   */
  private getGoBackHandler = () => {
    if(this.props.goBack !== undefined) {
      if(typeof this.props.goBack === 'boolean'){
        return this.props.navigateBack();
      } else {
        return this.props.goBack()
      }
    } 
    if (this.props.customRightBack){
      return this.props.customRightBack.onPress()
    }
  }

  private renderHeader = () => (
      <TouchableDefaultOpacity onPress={this.getGoBackHandler}>
        <Text white={this.props.primary || this.props.dark} numberOfLines={1}>
          {this.props.headerTitle}
        </Text>
      </TouchableDefaultOpacity>
  );

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
      customRightBack
    } = this.props;

    return (
      <Right>
        {!isSearchEnabled && <InstabugChatsComponent />}
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
        {customRightBack &&
          !isSearchEnabled && (
            <ButtonDefaultOpacity
              onPress={customRightBack.onPress}
              style={styles.helpButton}
              transparent={true}
            >
              <IconFont name={customRightBack.iconName} />
            </ButtonDefaultOpacity>
          )}
      </Right>
    );
  };

  private renderGoBack = () => {
    const { goBack, dark } = this.props;
    return goBack && (
        <Left>
          {this.props.isModal ? (
            <GoBackButtonModal          
              testID={"back-button"}
              onPress={this.getGoBackHandler}
              accessible={true}
              accessibilityLabel={I18n.t("global.buttons.back")}
              white={dark}
            />
          ) : (
            <GoBackButton
              testID={"back-button"}
              onPress={goBack}
              accessible={true}
              accessibilityLabel={I18n.t("global.buttons.back")}
              white={dark}
            />
          )}
        </Left>
    );
  };

  private renderLeft = () => {
    const { isSearchEnabled, appLogo, primary } = this.props;
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BaseHeaderComponent);
