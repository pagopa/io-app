import * as AR from "fp-ts/lib/Array";
import { constNull, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { ComponentProps } from "react";
import { Image } from "react-native";
import {
  Body,
  ButtonSolidProps,
  ContentWrapper,
  GradientBottomActions,
  H2,
  IOSpacer,
  IOSpacingScale,
  IOVisualCostants,
  LabelLink,
  VSpacer,
  buttonSolidHeight
} from "@pagopa/io-app-design-system";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  Easing,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";
import { BonusAvailable } from "../../../../../definitions/content/BonusAvailable";
import { BonusAvailableContent } from "../../../../../definitions/content/BonusAvailableContent";
import { LightModalContext } from "../../../../components/ui/LightModal";
import I18n from "../../../../i18n";
import customVariables from "../../../../theme/variables";
import { getRemoteLocale } from "../../../messages/utils/messages";
import { maybeNotNullyString } from "../../../../utils/strings";
import { Markdown } from "../../../../components/ui/Markdown/Markdown";
import { RNavScreenWithLargeHeader } from "../../../../components/ui/RNavScreenWithLargeHeader";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
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

// value is defined the height of the image
const imageHeight: number = 270;

const gradientSafeArea: IOSpacingScale = 80;
const contentEndMargin: IOSpacingScale = 32;
const spaceBetweenActions: IOSpacer = 24;

/**
 * A screen to explain how the bonus activation works and how it will be assigned
 */
const BonusInformationComponent = (props: Props) => {
  const [isMarkdownLoaded, setMarkdownLoaded] = React.useState(false);
  const { showModal, hideModal } = React.useContext(LightModalContext);
  const bonusType = props.bonus;
  const bonusTypeLocalizedContent: BonusAvailableContent =
    bonusType[getRemoteLocale()];
  const safeAreaInsets = useSafeAreaInsets();

  const gradientOpacity = useSharedValue(1);
  const scrollTranslationY = useSharedValue(0);

  const bottomMargin: number = React.useMemo(
    () =>
      safeAreaInsets.bottom === 0
        ? IOVisualCostants.appMarginDefault
        : safeAreaInsets.bottom,
    [safeAreaInsets]
  );

  const safeBottomAreaHeight: number = React.useMemo(
    () => bottomMargin + buttonSolidHeight + contentEndMargin,
    [bottomMargin]
  );

  const gradientAreaHeight: number = React.useMemo(
    () => bottomMargin + buttonSolidHeight + gradientSafeArea,
    [bottomMargin]
  );

  useHeaderSecondLevel({
    title: bonusTypeLocalizedContent.title || "",
    scrollValues: {
      triggerOffset: imageHeight,
      contentOffsetY: scrollTranslationY
    },
    supportRequest: true
  });

  const footerGradientOpacityTransition = useAnimatedStyle(() => ({
    opacity: withTiming(gradientOpacity.value, {
      duration: 200,
      easing: Easing.ease
    })
  }));

  const cancelButtonProps: ButtonSolidProps = {
    label: I18n.t("global.buttons.cancel"),
    fullWidth: true,
    color: "danger",
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

  const scrollHandler = useAnimatedScrollHandler(
    ({ contentOffset, layoutMeasurement, contentSize }) => {
      // eslint-disable-next-line functional/immutable-data
      scrollTranslationY.value = contentOffset.y;

      const isEndReached =
        Math.floor(layoutMeasurement.height + contentOffset.y) >=
        Math.floor(contentSize.height);

      // eslint-disable-next-line functional/immutable-data
      gradientOpacity.value = isEndReached ? 0 : 1;
    }
  );

  return (
    <>
      <Animated.ScrollView
        contentContainerStyle={{
          paddingBottom: safeBottomAreaHeight,
          flexGrow: 1
        }}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        snapToOffsets={[0, imageHeight]}
        snapToEnd={false}
        decelerationRate="normal"
      >
        {O.isSome(maybeHeroImage) && (
          <>
            <Image
              source={{ uri: maybeHeroImage.value }}
              style={{
                width: "100%",
                height: imageHeight,
                resizeMode: "stretch"
              }}
            />
            <VSpacer size={24} />
          </>
        )}
        <ContentWrapper>
          <H2 accessibilityRole="header">{bonusTypeLocalizedContent.title}</H2>
          <VSpacer size={16} />
          {isMarkdownLoaded && (
            <Body color="bluegreyDark">
              {bonusTypeLocalizedContent.subtitle}
            </Body>
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
      </Animated.ScrollView>
      <GradientBottomActions
        primaryActionProps={
          props.onConfirm ? { ...requestButtonProps } : { ...cancelButtonProps }
        }
        transitionAnimStyle={footerGradientOpacityTransition}
        dimensions={{
          bottomMargin,
          extraBottomMargin: 0,
          gradientAreaHeight,
          spaceBetweenActions,
          safeBackgroundHeight: bottomMargin
        }}
      />
    </>
  );
};

export default BonusInformationComponent;
