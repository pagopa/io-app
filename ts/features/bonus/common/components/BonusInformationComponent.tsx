import { Button, Content, Text, View } from "native-base";
import { ComponentProps } from "react";
import * as React from "react";
import { Image, StyleSheet, SafeAreaView } from "react-native";
import { widthPercentageToDP } from "react-native-responsive-screen";
import { BonusAvailable } from "../../../../../definitions/content/BonusAvailable";
import { BonusAvailableContent } from "../../../../../definitions/content/BonusAvailableContent";
import ButtonDefaultOpacity from "../../../../components/ButtonDefaultOpacity";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { withLightModalContext } from "../../../../components/helpers/withLightModalContext";
import { withLoadingSpinner } from "../../../../components/helpers/withLoadingSpinner";
import ItemSeparatorComponent from "../../../../components/ItemSeparatorComponent";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import { EdgeBorderComponent } from "../../../../components/screens/EdgeBorderComponent";
import TouchableDefaultOpacity from "../../../../components/TouchableDefaultOpacity";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import { LightModalContextInterface } from "../../../../components/ui/LightModal";
import Markdown from "../../../../components/ui/Markdown";
import I18n from "../../../../i18n";
import customVariables from "../../../../theme/variables";
import { useScreenReaderEnabled } from "../../../../utils/accessibility";
import { getLocalePrimaryWithFallback } from "../../../../utils/locale";
import { maybeNotNullyString } from "../../../../utils/strings";
import TosBonusComponent from "../../bonusVacanze/components/TosBonusComponent";
import { openWebUrl } from "../../../../utils/url";

type OwnProps = {
  bonus: BonusAvailable;
  onConfirm?: () => void;
  onCancel?: () => void;
};

type Props = OwnProps &
  LightModalContextInterface &
  Pick<
    ComponentProps<typeof BaseScreenComponent>,
    "contextualHelpMarkdown" | "faqCategories"
  >;

const CSS_STYLE = `
body {
  font-size: ${customVariables.fontSize1}px;
  color: ${customVariables.brandDarkestGray}
}

h4 {
  font-size: ${customVariables.fontSize2}px;
}
`;
const coverWidth = Math.min(48, widthPercentageToDP("30%"));
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
    width: widthPercentageToDP("70%"),
    alignSelf: "center"
  },
  cover: {
    resizeMode: "contain",
    width: coverWidth,
    height: coverWidth
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
  urlButton: { flex: 1, textAlign: "center" }
});

const loadingOpacity = 0.9;
// for long content markdown computed height should be not enough
const extraMarkdownBodyHeight = 20;
/**
 * A screen to explain how the bonus activation works and how it will be assigned
 */
const BonusInformationComponent: React.FunctionComponent<Props> = props => {
  const [isMarkdownLoaded, setMarkdownLoaded] = React.useState(false);
  const isScreenReaderEnabled = useScreenReaderEnabled();

  const bonusType = props.bonus;
  const bonusTypeLocalizedContent: BonusAvailableContent =
    bonusType[getLocalePrimaryWithFallback()];

  const cancelButtonProps = {
    block: true,
    light: true,
    bordered: true,
    onPress: props.onCancel,
    title: I18n.t("global.buttons.cancel")
  };
  const requestButtonProps = {
    block: true,
    primary: true,
    onPress: props.onConfirm,
    title: I18n.t("bonus.bonusVacanze.cta.requestBonus")
  };

  const handleModalPress = (tos: string) =>
    props.showModal(
      <TosBonusComponent tos_url={tos} onClose={props.hideModal} />
    );
  const onMarkdownLoaded = () => {
    setMarkdownLoaded(true);
  };

  const renderUrls = () => {
    const urls = bonusTypeLocalizedContent.urls;
    if (urls === undefined || urls.length === 0) {
      return null;
    }
    const buttons = urls.map((url, idx) => (
      <>
        <Button
          bordered={true}
          key={`${idx}_${url.url}`}
          onPress={() => openWebUrl(url.url)}
        >
          <Text style={styles.urlButton}>{url.name}</Text>
        </Button>
        {idx !== urls.length - 1 && <View spacer={true} small={true} />}
      </>
    ));
    return <>{buttons}</>;
  };
  const maybeBonusTos = maybeNotNullyString(bonusTypeLocalizedContent.tos_url);
  const maybeCover = maybeNotNullyString(bonusType.cover);
  const maybeSponsorshipDescription = maybeNotNullyString(
    bonusType.sponsorship_description
  );
  const footerComponent = (
    <FooterWithButtons
      type="TwoButtonsInlineThird"
      leftButton={cancelButtonProps}
      rightButton={requestButtonProps}
    />
  );
  const ContainerComponent = withLoadingSpinner(() => (
    <BaseScreenComponent
      goBack={true}
      headerTitle={bonusTypeLocalizedContent.name}
      contextualHelpMarkdown={props.contextualHelpMarkdown}
      faqCategories={props.faqCategories}
    >
      <SafeAreaView style={IOStyles.flex}>
        {isScreenReaderEnabled && isMarkdownLoaded && footerComponent}
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

          <View spacer={true} />
          <ItemSeparatorComponent noPadded={true} />
          <Markdown
            cssStyle={CSS_STYLE}
            extraBodyHeight={extraMarkdownBodyHeight}
            onLoadEnd={onMarkdownLoaded}
          >
            {bonusTypeLocalizedContent.content}
          </Markdown>
          <View spacer={true} extralarge={true} />
          {renderUrls()}
          {maybeBonusTos.isSome() && (
            <>
              <View spacer={true} large={true} />
              <ItemSeparatorComponent noPadded={true} />
              <View spacer={true} large={true} />

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
        {!isScreenReaderEnabled && isMarkdownLoaded && footerComponent}
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

export default withLightModalContext(BonusInformationComponent);
