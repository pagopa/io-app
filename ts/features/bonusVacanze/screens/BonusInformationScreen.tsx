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
import Markdown from "../../../components/ui/Markdown";
import I18n from "../../../i18n";
import {
  navigateBack,
  navigateToBonusTosScreen
} from "../../../store/actions/navigation";
import { ReduxProps } from "../../../store/actions/types";
import themeVariables from "../../../theme/variables";
import { FooterTwoButtons } from "../components/markdown/FooterTwoButtons";
import { BonusAvailable } from "../types/bonusesAvailable";

type NavigationParams = Readonly<{
  bonusItem: BonusAvailable;
}>;

type Props = ReduxProps &
  NavigationInjectedProps<NavigationParams> &
  ReturnType<typeof mapDispatchToProps>;

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
const BonusInformationScreen: React.FunctionComponent<Props> = props => {
  const [isMarkdownLoaded, setMarkdownLoaded] = React.useState(false);

  const getBonusItem = () => props.navigation.getParam("bonusItem");

  const bonusItem = getBonusItem();
  const ContainerComponent = withLoadingSpinner(() => (
    <BaseScreenComponent goBack={true} headerTitle={bonusItem.name}>
      <ScreenContent
        title={bonusItem.name}
        subtitle={bonusItem.description}
        bounces={false}
      >
        {bonusItem.cover && (
          <Image source={{ uri: bonusItem.cover }} style={styles.image} />
        )}
        <View style={styles.markdownContainer}>
          <Markdown onLoadEnd={() => setMarkdownLoaded(true)}>
            {/* TODO Replace with correct text of bonus */
            I18n.t("profile.main.privacy.exportData.info.body")}
          </Markdown>
          {isMarkdownLoaded && <EdgeBorderComponent />}
        </View>
      </ScreenContent>
      {isMarkdownLoaded && (
        <FooterTwoButtons
          onRight={props.requestBonusActivation}
          title={I18n.t("bonus.bonusVacanza.cta.requestBonus")}
          onCancel={props.navigateBack}
        />
      )}
    </BaseScreenComponent>
  ));
  return <ContainerComponent isLoading={!isMarkdownLoaded} />;
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  requestBonusActivation: () => dispatch(navigateToBonusTosScreen()),
  navigateBack: () => dispatch(navigateBack())
});

export default connect(
  undefined,
  mapDispatchToProps
)(BonusInformationScreen);
