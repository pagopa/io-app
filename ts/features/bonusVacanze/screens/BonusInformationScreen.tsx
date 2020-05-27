import { View } from "native-base";
import * as React from "react";
import { Image, StyleSheet } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { withLoadingSpinner } from "../../../components/helpers/withLoadingSpinner";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { EdgeBorderComponent } from "../../../components/screens/EdgeBorderComponent";
import ScreenContent from "../../../components/screens/ScreenContent";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import Markdown from "../../../components/ui/Markdown";
import I18n from "../../../i18n";
import { navigateBack } from "../../../store/actions/navigation";
import { ReduxProps } from "../../../store/actions/types";
import themeVariables from "../../../theme/variables";
import { BonusItem } from "../types/bonusList";

type NavigationParams = Readonly<{
  bonusItem: BonusItem;
}>;

type Props = ReduxProps &
  NavigationInjectedProps<NavigationParams> &
  ReturnType<typeof mapDispatchToProps>;

type State = {
  isMarkdownLoaded: boolean;
};

const styles = StyleSheet.create({
  mainContent: {
    flex: 1
  },
  markdownContainer: {
    paddingLeft: themeVariables.contentPadding,
    paddingRight: themeVariables.contentPadding
  },
  image: {
    resizeMode: "contain",
    width: "100%",
    height: 210,
    alignSelf: "center"
  }
});

/**
 * A screen to explain how the bonus activation works and how it will be assigned
 */
class BonusInformationScreen extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { isMarkdownLoaded: false };
  }

  get bonusItem() {
    return this.props.navigation.getParam("bonusItem");
  }

  public render() {
    const ContainerComponent = withLoadingSpinner(() => (
      <BaseScreenComponent goBack={true} headerTitle={this.bonusItem.name}>
        <ScreenContent
          title={this.bonusItem.name}
          subtitle={this.bonusItem.description}
          bounces={false}
        >
          {this.bonusItem.cover && (
            <Image
              source={{ uri: this.bonusItem.cover }}
              style={styles.image}
            />
          )}
          <View style={styles.markdownContainer}>
            <Markdown
              onLoadEnd={() => this.setState({ isMarkdownLoaded: true })}
            >
              {/* TODO Replace with correct text of bonus */
              I18n.t("profile.main.privacy.exportData.info.body")}
            </Markdown>
            {this.state.isMarkdownLoaded && <EdgeBorderComponent />}
          </View>
        </ScreenContent>
        {this.state.isMarkdownLoaded && (
          <FooterWithButtons
            type={"TwoButtonsInlineHalf"}
            rightButton={{
              block: true,
              primary: true,
              onPress: this.props.requestBonusActivation,
              title: I18n.t("bonus.bonusVacanza.cta.requestBonus")
            }}
            leftButton={{
              cancel: true,
              block: true,
              onPress: this.props.navigateBack,
              title: I18n.t("global.buttons.cancel")
            }}
          />
        )}
      </BaseScreenComponent>
    ));
    return <ContainerComponent isLoading={!this.state.isMarkdownLoaded} />;
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  // TODO add bonus request action or just navigate to TOS screen (?)
  requestBonusActivation: () => null,
  navigateBack: () => dispatch(navigateBack())
});

export default connect(
  undefined,
  mapDispatchToProps
)(BonusInformationScreen);
