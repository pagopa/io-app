import { Content, Text, View } from "native-base";
import * as React from "react";
import { Image, StyleSheet } from "react-native";
import { NavigationInjectedProps, SafeAreaView } from "react-navigation";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { BonusAvailable } from "../../../../definitions/content/BonusAvailable";
import { BonusAvailableContent } from "../../../../definitions/content/BonusAvailableContent";
import ButtonDefaultOpacity from "../../../components/ButtonDefaultOpacity";
import { withLightModalContext } from "../../../components/helpers/withLightModalContext";
import { withLoadingSpinner } from "../../../components/helpers/withLoadingSpinner";
import ItemSeparatorComponent from "../../../components/ItemSeparatorComponent";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../../components/screens/BaseScreenComponent";
import { EdgeBorderComponent } from "../../../components/screens/EdgeBorderComponent";
import TouchableDefaultOpacity from "../../../components/TouchableDefaultOpacity";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import { LightModalContextInterface } from "../../../components/ui/LightModal";
import Markdown from "../../../components/ui/Markdown";
import I18n from "../../../i18n";
import { navigateBack } from "../../../store/actions/navigation";
import customVariables from "../../../theme/variables";
import { getLocalePrimaryWithFallback } from "../../../utils/locale";
import { maybeNotNullyString } from "../../../utils/strings";
import { bonusVacanzeStyle } from "../components/Styles";
import TosBonusComponent from "../components/TosBonusComponent";
import { checkBonusVacanzeEligibility } from "../store/actions/bonusVacanze";

type NavigationParams = Readonly<{
  bonusItem: BonusAvailable;
}>;

type OwnProps = NavigationInjectedProps<NavigationParams>;

type Props = OwnProps &
  LightModalContextInterface &
  ReturnType<typeof mapDispatchToProps>;

const CSS_STYLE = `
body {
  font-size: ${customVariables.fontSizeSmall}px;
  color: ${customVariables.brandDarkestGray}
}

h4 {
  font-size: ${customVariables.fontSize1}px;
}
`;

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
  }
});

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "bonus.bonusInformation.contextualHelp.title",
  body: "bonus.bonusInformation.contextualHelp.body"
};

// the number of markdown component inside BonusInformationScreen
const markdownComponents = 1;
const loadingOpacity = 0.9;
// for long content markdown computed height should be not enough
const extraMarkdownBodyHeight = 20;
/**
 * A screen to explain how the bonus activation works and how it will be assigned
 */
const BonusInformationScreen: React.FunctionComponent<Props> = props => {
  const [markdownLoaded, setMarkdownLoaded] = React.useState(0);

  const getBonusItem = () => props.navigation.getParam("bonusItem");

  const bonusType = getBonusItem();
  const bonusTypeLocalizedContent: BonusAvailableContent =
    bonusType[getLocalePrimaryWithFallback()];

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
    title: `${I18n.t("bonus.bonusVacanze.cta.requestBonus")} ${
      bonusTypeLocalizedContent.name
    }`
  };

  const handleModalPress = (tos: string) =>
    props.showModal(
      <TosBonusComponent tos_url={tos} onClose={props.hideModal} />
    );
  const onMarkdownLoaded = () => {
    setMarkdownLoaded(c => Math.min(c + 1, markdownComponents));
  };
  const isMarkdownLoaded = markdownLoaded === markdownComponents;
  const maybeBonusTos = maybeNotNullyString(bonusTypeLocalizedContent.tos_url);
  const maybeCover = maybeNotNullyString(bonusType.cover);
  const maybeSponsorshipDescription = maybeNotNullyString(
    bonusType.sponsorship_description
  );
  const ContainerComponent = withLoadingSpinner(() => (
    <BaseScreenComponent
      goBack={true}
      headerTitle={bonusTypeLocalizedContent.name}
      contextualHelpMarkdown={contextualHelpMarkdown}
      faqCategories={["bonus_information"]}
    >
      <SafeAreaView style={bonusVacanzeStyle.flex}>
        <Content>
          <View style={styles.row}>
            <View style={styles.flexStart}>
              {maybeSponsorshipDescription.isSome() && (
                <Text dark={true} style={styles.orgName} semibold={true}>
                  {maybeSponsorshipDescription.value}
                </Text>
              )}

              <Text bold={true} dark={true} style={styles.title}>
                {bonusTypeLocalizedContent.title}
              </Text>
            </View>
            <View style={styles.flexEnd}>
              {maybeCover.isSome() && (
                <Image
                  source={{ uri: maybeCover.value }}
                  style={styles.cover}
                />
              )}
            </View>
          </View>
          <View spacer={true} large={true} />
          <Text dark={true}>{bonusTypeLocalizedContent.subtitle}</Text>
          {maybeBonusTos.isSome() && (
            <ButtonDefaultOpacity
              style={styles.noPadded}
              transparent={true}
              onPress={() => handleModalPress(maybeBonusTos.value)}
            >
              <Text semibold={true}>{I18n.t("bonus.tos.title")}</Text>
            </ButtonDefaultOpacity>
          )}
          <View spacer={true} />
          <ItemSeparatorComponent noPadded={true} />
          <View spacer={true} />
          <Markdown
            cssStyle={CSS_STYLE}
            extraBodyHeight={extraMarkdownBodyHeight}
            onLoadEnd={onMarkdownLoaded}
          >
            {bonusTypeLocalizedContent.content}
          </Markdown>
          {maybeBonusTos.isSome() && (
            <>
              <View spacer={true} extralarge={true} />
              <ItemSeparatorComponent noPadded={true} />
              <View spacer={true} extralarge={true} />
              <Text dark={true}>{I18n.t("bonus.bonusVacanze.advice")}</Text>
              <TouchableDefaultOpacity
                onPress={() => handleModalPress(maybeBonusTos.value)}
                accessibilityRole={"link"}
              >
                <Text
                  link={true}
                  semibold={true}
                  ellipsizeMode={"tail"}
                  numberOfLines={1}
                >
                  {I18n.t("bonus.tos.title")}
                </Text>
              </TouchableDefaultOpacity>
            </>
          )}
          {isMarkdownLoaded && <EdgeBorderComponent />}
        </Content>
        {isMarkdownLoaded && (
          <FooterWithButtons
            type="TwoButtonsInlineThird"
            leftButton={cancelButtonProps}
            rightButton={requestButtonProps}
          />
        )}
      </SafeAreaView>
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
  requestBonusActivation: () => {
    dispatch(checkBonusVacanzeEligibility.request());
  },
  navigateBack: () => dispatch(navigateBack())
});

export default withLightModalContext(
  connect(
    undefined,
    mapDispatchToProps
  )(BonusInformationScreen)
);
