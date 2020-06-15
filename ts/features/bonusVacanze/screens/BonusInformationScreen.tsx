import { Content, Text, View } from "native-base";
import * as React from "react";
import { Image, StyleSheet } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { BonusAvailable } from "../../../../definitions/content/BonusAvailable";
import ButtonDefaultOpacity from "../../../components/ButtonDefaultOpacity";
import { withLightModalContext } from "../../../components/helpers/withLightModalContext";
import { withLoadingSpinner } from "../../../components/helpers/withLoadingSpinner";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { EdgeBorderComponent } from "../../../components/screens/EdgeBorderComponent";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import { LightModalContextInterface } from "../../../components/ui/LightModal";
import Markdown from "../../../components/ui/Markdown";
import I18n from "../../../i18n";
import { navigateBack } from "../../../store/actions/navigation";
import customVariables from "../../../theme/variables";
import TosBonusComponent from "../components/TosBonusComponent";
import { checkBonusEligibility } from "../store/actions/bonusVacanze";

type NavigationParams = Readonly<{
  bonusItem: BonusAvailable;
}>;

type OwnProps = NavigationInjectedProps<NavigationParams>;

type Props = OwnProps &
  LightModalContextInterface &
  ReturnType<typeof mapDispatchToProps>;

const styles = StyleSheet.create({
  noPadded: {
    paddingLeft: 0,
    paddingRight: 0
  },
  mainContent: {
    flex: 1
  },
  flexEnd: {
    alignSelf: "flex-end"
  },
  flexStart: {
    alignSelf: "flex-start"
  },
  cover: {
    resizeMode: "contain",
    width: 48,
    height: 48
  },
  bonusImage: {
    width: 48,
    height: 48
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  orgName: {
    fontSize: 18,
    lineHeight: customVariables.lineHeight2
  },
  title: {
    fontSize: customVariables.fontSize3,
    lineHeight: customVariables.lineHeightH3,
    color: customVariables.colorBlack
  }
});

// the number of markdown component inside BonusInformationScreen
const markdownComponents = 1;
/**
 * A screen to explain how the bonus activation works and how it will be assigned
 */
const BonusInformationScreen: React.FunctionComponent<Props> = props => {
  const [markdownLoaded, setMarkdownLoaded] = React.useState(0);

  const getBonusItem = () => props.navigation.getParam("bonusItem");

  const bonusItem = getBonusItem();

  const cancelButtonProps = {
    block: true,
    light: true,
    bordered: true,
    onPress: props.navigateBack,
    title: I18n.t("global.buttons.cancel")
  };
  const requestButtonProps = {
    block: true,
    primary: true,
    onPress: props.requestBonusActivation,
    title: `${I18n.t("bonus.bonusVacanza.request")} ${bonusItem.name}`
  };

  const handleModalPress = () =>
    props.showModal(<TosBonusComponent onClose={props.hideModal} />);
  const onMarkdownLoaded = () => {
    setMarkdownLoaded(c => Math.min(c + 1, markdownComponents));
  };
  const isMarkdownLoaded = markdownLoaded === markdownComponents;
  const ContainerComponent = withLoadingSpinner(() => (
    <BaseScreenComponent goBack={true} headerTitle={bonusItem.name}>
      <Content>
        <View style={styles.row}>
          <View style={styles.flexStart}>
            {bonusItem.sponsorship_cover && (
              <Image
                style={styles.bonusImage}
                source={{ uri: bonusItem.sponsorship_cover }}
              />
            )}
          </View>
          <View style={styles.flexEnd}>
            {bonusItem.cover && (
              <Image source={{ uri: bonusItem.cover }} style={styles.cover} />
            )}
          </View>
        </View>
        <View spacer={true} />
        <Text dark={true} style={styles.orgName}>
          {bonusItem.subtitle}
        </Text>
        <Text bold={true} dark={true} style={styles.title}>{`${I18n.t(
          "bonus.requestTitle"
        )} ${bonusItem.name}`}</Text>
        <View spacer={true} large={true} />
        <Markdown onLoadEnd={onMarkdownLoaded}>{bonusItem.content}</Markdown>
        <ButtonDefaultOpacity
          style={styles.noPadded}
          small={true}
          transparent={true}
          onPress={handleModalPress}
        >
          <Text>{I18n.t("bonus.tos.title")}</Text>
        </ButtonDefaultOpacity>
        {isMarkdownLoaded && <EdgeBorderComponent />}
      </Content>
      {isMarkdownLoaded && (
        <FooterWithButtons
          type="TwoButtonsInlineThird"
          leftButton={cancelButtonProps}
          rightButton={requestButtonProps}
        />
      )}
    </BaseScreenComponent>
  ));
  return (
    <ContainerComponent isLoading={!isMarkdownLoaded} loadingOpacity={0.9} />
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  // TODO add bonus request action or just navigate to TOS screen (?)
  requestBonusActivation: () => dispatch(checkBonusEligibility.request()),
  navigateBack: () => dispatch(navigateBack())
});

export default withLightModalContext(
  connect(
    undefined,
    mapDispatchToProps
  )(BonusInformationScreen)
);
