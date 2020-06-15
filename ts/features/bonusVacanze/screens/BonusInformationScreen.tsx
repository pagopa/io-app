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
import ItemSeparatorComponent from "../../../components/ItemSeparatorComponent";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { EdgeBorderComponent } from "../../../components/screens/EdgeBorderComponent";
import TouchableDefaultOpacity from "../../../components/TouchableDefaultOpacity";
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
    alignSelf: "center"
  },
  flexStart: {
    alignSelf: "center"
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
    alignItems: "center",
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
  },
  disclaimer: {
    fontSize: customVariables.fontSizeXSmall
  }
});

// the number of markdown component inside BonusInformationScreen
const markdownComponents = 1;
const loadingOpacity = 0.9;
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
            <Text dark={true} style={styles.orgName} semibold={true}>
              {/* FIXME: replace with correct attribute from the object */}
              {"Agenzia delle Entrate"}
            </Text>
            <Text bold={true} dark={true} style={styles.title}>{`${I18n.t(
              "bonus.requestTitle"
            )} ${bonusItem.name}`}</Text>
          </View>
          <View style={styles.flexEnd}>
            {bonusItem.cover && (
              <Image source={{ uri: bonusItem.cover }} style={styles.cover} />
            )}
          </View>
        </View>
        <View spacer={true} large={true} />
        <Text dark={true}>{bonusItem.subtitle}</Text>
        <ButtonDefaultOpacity
          style={styles.noPadded}
          small={true}
          transparent={true}
          onPress={handleModalPress}
        >
          <Text>{I18n.t("bonus.tos.title")}</Text>
        </ButtonDefaultOpacity>
        <View spacer={true} />
        <ItemSeparatorComponent noPadded={true} />
        <View spacer={true} />
        <Markdown onLoadEnd={onMarkdownLoaded}>{bonusItem.content}</Markdown>
        <View spacer={true} extralarge={true} />
        <ItemSeparatorComponent noPadded={true} />
        <View spacer={true} extralarge={true} />
        <Text style={styles.disclaimer} dark={true}>
          {I18n.t("bonus.bonusVacanza.advice")}
        </Text>
        <TouchableDefaultOpacity onPress={handleModalPress}>
          <Text
            style={styles.disclaimer}
            link={true}
            ellipsizeMode={"tail"}
            numberOfLines={1}
          >
            {I18n.t("bonus.tos.title")}
          </Text>
        </TouchableDefaultOpacity>
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
    <ContainerComponent
      isLoading={!isMarkdownLoaded}
      loadingOpacity={loadingOpacity}
    />
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
