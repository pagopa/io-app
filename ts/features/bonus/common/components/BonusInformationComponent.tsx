import * as AR from "fp-ts/lib/Array";
import { constNull, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { Content, Text as NBButtonText } from "native-base";
import * as React from "react";
import { ComponentProps } from "react";
import { View, Image, SafeAreaView, StyleSheet } from "react-native";
import { widthPercentageToDP } from "react-native-responsive-screen";
import { BonusAvailable } from "../../../../../definitions/content/BonusAvailable";
import { BonusAvailableContent } from "../../../../../definitions/content/BonusAvailableContent";
import ButtonDefaultOpacity from "../../../../components/ButtonDefaultOpacity";
import { VSpacer } from "../../../../components/core/spacer/Spacer";
import { Body } from "../../../../components/core/typography/Body";
import { H1 } from "../../../../components/core/typography/H1";
import { H3 } from "../../../../components/core/typography/H3";
import { Link } from "../../../../components/core/typography/Link";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { withLightModalContext } from "../../../../components/helpers/withLightModalContext";
import { withLoadingSpinner } from "../../../../components/helpers/withLoadingSpinner";
import ItemSeparatorComponent from "../../../../components/ItemSeparatorComponent";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import { EdgeBorderComponent } from "../../../../components/screens/EdgeBorderComponent";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import { LightModalContextInterface } from "../../../../components/ui/LightModal";
import Markdown from "../../../../components/ui/Markdown";
import I18n from "../../../../i18n";
import customVariables from "../../../../theme/variables";
import { useScreenReaderEnabled } from "../../../../utils/accessibility";
import { getRemoteLocale } from "../../../../utils/messages";
import { maybeNotNullyString } from "../../../../utils/strings";
import { confirmButtonProps } from "../../bonusVacanze/components/buttons/ButtonConfigurations";
import TosBonusComponent from "./TosBonusComponent";

type OwnProps = {
  onBack?: () => void;
  bonus: BonusAvailable;
  onConfirm?: () => void;
  onCancel?: () => void;
  primaryCtaText: string;
};

type Props = OwnProps &
  LightModalContextInterface &
  Pick<
    ComponentProps<typeof BaseScreenComponent>,
    "contextualHelp" | "contextualHelpMarkdown" | "faqCategories"
  >;

const CSS_STYLE = `
body {
  font-size: ${customVariables.fontSizeBase}px;
  color: ${customVariables.textColorDark}
}

h4 {
  font-size: ${customVariables.fontSize2}px;
}
`;
const coverImageWidth = Math.min(48, widthPercentageToDP("30%"));
const styles = StyleSheet.create({
  flexEnd: {
    alignSelf: "flex-start"
  },
  flexStart: {
    width: widthPercentageToDP("70%"),
    alignSelf: "center"
  },
  cover: {
    resizeMode: "contain",
    width: coverImageWidth,
    height: coverImageWidth
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  urlButton: { flex: 1, textAlign: "center" }
});

const loadingOpacity = 0.9;
// for long content markdown computed height should be not enough
const extraMarkdownBodyHeight = 20;

// TODO get the tos footer from props
const getTosFooter = (
  maybeBonusTos: O.Option<string>,
  maybeRegulationUrl: O.Option<{ url: string; name: string }>,
  handleModalPress: (tos: string) => void,
  ctaText: string
) =>
  pipe(
    maybeBonusTos,
    O.fold(
      () => null,
      bT =>
        pipe(
          maybeRegulationUrl,
          O.fold(
            () => (
              // if tos is defined and the regolation url is not defined
              // return the link (BONUS VACANZE)
              <>
                <VSpacer size={40} />
                <ItemSeparatorComponent noPadded={true} />
                <VSpacer size={40} />
                <Body color="bluegreyDark">
                  {I18n.t("bonus.bonusVacanze.advice")}
                </Body>
                <Link
                  weight={"SemiBold"}
                  numberOfLines={1}
                  onPress={() => handleModalPress(bT)}
                >
                  {I18n.t("bonus.tos.title")}
                </Link>
              </>
            ),
            // if tos and regulation url is defined
            // return a markdown footer including both links reference (BPD)
            rU => (
              <>
                <VSpacer size={40} />
                <ItemSeparatorComponent noPadded={true} />
                <VSpacer size={40} />
                <Markdown
                  cssStyle={CSS_STYLE}
                  extraBodyHeight={extraMarkdownBodyHeight}
                >
                  {I18n.t("bonus.termsAndConditionFooter", {
                    ctaText,
                    regulationLink: rU.url,
                    tosUrl: bT
                  })}
                </Markdown>
              </>
            )
          )
        )
    )
  );

/**
 * A screen to explain how the bonus activation works and how it will be assigned
 */
const BonusInformationComponent: React.FunctionComponent<Props> = props => {
  const [isMarkdownLoaded, setMarkdownLoaded] = React.useState(false);
  const isScreenReaderEnabled = useScreenReaderEnabled();

  const bonusType = props.bonus;
  const bonusTypeLocalizedContent: BonusAvailableContent =
    bonusType[getRemoteLocale()];

  const cancelButtonProps = {
    block: true,
    light: true,
    bordered: true,
    onPress: props.onCancel,
    title: I18n.t("global.buttons.cancel")
  };
  const requestButtonProps = confirmButtonProps(
    props.onConfirm ?? constNull,
    props.primaryCtaText,
    undefined,
    "activate-bonus-button"
  );

  const onMarkdownLoaded = () => {
    setMarkdownLoaded(true);
  };

  const handleModalPress = (tos: string) =>
    props.showModal(
      <TosBonusComponent tos_url={tos} onClose={props.hideModal} />
    );

  // bonus rules url should be the first one in the urls list
  const maybeRegulationUrl = pipe(
    bonusTypeLocalizedContent.urls,
    O.fromNullable,
    O.chain(urls => AR.lookup(0, [...urls]))
  );

  // render a stack of button each one representing a url
  const renderUrls = () => {
    const urls = bonusTypeLocalizedContent.urls;
    if (urls === undefined || urls.length === 0) {
      return null;
    }
    const buttons = urls.map((url, idx) => (
      <View key={`${idx}_${url.url}`}>
        <ButtonDefaultOpacity
          bordered={true}
          onPress={() => handleModalPress(url.url)}
        >
          <NBButtonText style={styles.urlButton}>{url.name}</NBButtonText>
        </ButtonDefaultOpacity>
        {idx !== urls.length - 1 && <VSpacer size={8} />}
      </View>
    ));
    return <>{buttons}</>;
  };
  const maybeBonusTos = maybeNotNullyString(bonusTypeLocalizedContent.tos_url);

  const maybeCover = maybeNotNullyString(bonusType.cover);
  const maybeSponsorshipDescription = maybeNotNullyString(
    bonusType.sponsorship_description
  );
  const footerComponent = props.onConfirm ? (
    <FooterWithButtons
      type="TwoButtonsInlineThird"
      leftButton={cancelButtonProps}
      rightButton={requestButtonProps}
    />
  ) : (
    <FooterWithButtons type="SingleButton" leftButton={cancelButtonProps} />
  );
  const ContainerComponent = withLoadingSpinner(() => (
    <BaseScreenComponent
      goBack={props.onBack ?? true}
      headerTitle={bonusTypeLocalizedContent.name}
      contextualHelpMarkdown={props.contextualHelpMarkdown}
      contextualHelp={props.contextualHelp}
      faqCategories={props.faqCategories}
    >
      <SafeAreaView style={IOStyles.flex}>
        {isScreenReaderEnabled && isMarkdownLoaded && footerComponent}
        <Content>
          <View style={styles.row}>
            <View style={styles.flexStart}>
              {O.isSome(maybeSponsorshipDescription) && (
                <H3>{maybeSponsorshipDescription.value}</H3>
              )}

              <H1>{bonusTypeLocalizedContent.title}</H1>
            </View>
            <View style={styles.flexEnd}>
              {O.isSome(maybeCover) && (
                <Image
                  source={{ uri: maybeCover.value }}
                  style={styles.cover}
                />
              )}
            </View>
          </View>
          <VSpacer size={24} />
          <Body color="bluegreyDark">{bonusTypeLocalizedContent.subtitle}</Body>

          <VSpacer size={16} />
          <ItemSeparatorComponent noPadded={true} />
          <Markdown
            cssStyle={CSS_STYLE}
            extraBodyHeight={extraMarkdownBodyHeight}
            onLoadEnd={onMarkdownLoaded}
          >
            {bonusTypeLocalizedContent.content}
          </Markdown>
          <VSpacer size={40} />
          {isMarkdownLoaded && renderUrls()}
          {getTosFooter(
            maybeBonusTos,
            maybeRegulationUrl,
            handleModalPress,
            props.primaryCtaText
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
