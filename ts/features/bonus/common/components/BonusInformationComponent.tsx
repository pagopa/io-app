import * as AR from "fp-ts/lib/Array";
import { constNull, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { ComponentProps } from "react";
import { View } from "react-native";
import {
  Body,
  ButtonOutline,
  ButtonSolid,
  ButtonSolidProps,
  ContentWrapper,
  IOStyles,
  LabelLink,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BonusAvailable } from "../../../../../definitions/content/BonusAvailable";
import { BonusAvailableContent } from "../../../../../definitions/content/BonusAvailableContent";
import { LightModalContext } from "../../../../components/ui/LightModal";
import I18n from "../../../../i18n";
import customVariables from "../../../../theme/variables";
import { useScreenReaderEnabled } from "../../../../utils/accessibility";
import { getRemoteLocale } from "../../../messages/utils/messages";
import { maybeNotNullyString } from "../../../../utils/strings";
import { Markdown } from "../../../../components/ui/Markdown/Markdown";
import { RNavScreenWithLargeHeader } from "../../../../components/ui/RNavScreenWithLargeHeader";
import TosBonusComponent from "./TosBonusComponent";

type OwnProps = {
  onBack?: () => void;
  bonus: BonusAvailable;
  onConfirm?: () => void;
  onCancel?: () => void;
  primaryCtaText: string;
};

type Props = OwnProps &
  Pick<
    ComponentProps<typeof RNavScreenWithLargeHeader>,
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

// for long content markdown computed height should be not enough
const extraMarkdownBodyHeight = 20;

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
                <Body color="bluegreyDark">
                  {I18n.t("bonus.bonusVacanze.advice")}
                </Body>
                <LabelLink
                  weight={"SemiBold"}
                  numberOfLines={1}
                  onPress={() => handleModalPress(bT)}
                >
                  {I18n.t("bonus.tos.title")}
                </LabelLink>
              </>
            ),
            // if tos and regulation url is defined
            // return a markdown footer including both links reference (BPD)
            rU => (
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
            )
          )
        )
    )
  );

/**
 * A screen to explain how the bonus activation works and how it will be assigned
 */
const BonusInformationComponent = (props: Props) => {
  const [isMarkdownLoaded, setMarkdownLoaded] = React.useState(false);
  const isScreenReaderEnabled = useScreenReaderEnabled();
  const { showModal, hideModal } = React.useContext(LightModalContext);
  const bonusType = props.bonus;
  const bonusTypeLocalizedContent: BonusAvailableContent =
    bonusType[getRemoteLocale()];

  const { bottom } = useSafeAreaInsets();

  const cancelButtonProps: ButtonSolidProps = {
    label: I18n.t("global.buttons.cancel"),
    fullWidth: true,
    accessibilityLabel: I18n.t("global.buttons.cancel"),
    onPress: props.onCancel ?? constNull
  };
  const requestButtonProps: ButtonSolidProps = {
    label: props.primaryCtaText,
    testID: "activate-bonus-button",
    fullWidth: true,
    accessibilityLabel: props.primaryCtaText,
    onPress: props.onConfirm ?? constNull
  };

  const onMarkdownLoaded = () => {
    setMarkdownLoaded(true);
  };

  const handleModalPress = (tos: string) =>
    showModal(<TosBonusComponent tos_url={tos} onClose={hideModal} />);

  // bonus rules url should be the first one in the urls list
  const maybeRegulationUrl = pipe(
    bonusTypeLocalizedContent.urls,
    O.fromNullable,
    O.chain(urls => AR.lookup(0, [...urls]))
  );

  const maybeBonusTos = maybeNotNullyString(bonusTypeLocalizedContent.tos_url);
  const maybeHeroImage = maybeNotNullyString(bonusType.hero_image);

  const footerComponent = (
    <View style={[IOStyles.footer, { paddingBottom: bottom }]}>
      {props.onConfirm ? (
        <ButtonSolid {...requestButtonProps} />
      ) : (
        <ButtonOutline {...cancelButtonProps} />
      )}
    </View>
  );

  return (
    <RNavScreenWithLargeHeader
      title={{
        label: bonusTypeLocalizedContent.title,
        heroImage: O.isSome(maybeHeroImage)
          ? { uri: maybeHeroImage.value }
          : undefined
      }}
      headerActionsProp={{ showHelp: true }}
      fixedBottomSlot={
        !isScreenReaderEnabled && isMarkdownLoaded && footerComponent
      }
    >
      <ContentWrapper>
        {isMarkdownLoaded && (
          <Body color="bluegreyDark">{bonusTypeLocalizedContent.subtitle}</Body>
        )}

        <Markdown
          cssStyle={CSS_STYLE}
          extraBodyHeight={extraMarkdownBodyHeight}
          onLoadEnd={onMarkdownLoaded}
        >
          {bonusTypeLocalizedContent.content}
        </Markdown>
        <VSpacer size={40} />
        {getTosFooter(
          maybeBonusTos,
          maybeRegulationUrl,
          handleModalPress,
          props.primaryCtaText
        )}
      </ContentWrapper>
    </RNavScreenWithLargeHeader>
  );
};

export default BonusInformationComponent;
