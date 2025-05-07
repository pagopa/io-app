import {
  Body,
  ContentWrapper,
  H2,
  IOButtonBlockSpecificProps,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as AR from "fp-ts/lib/Array";
import { constNull, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { ComponentProps, useContext } from "react";
import { Image } from "react-native";
import Animated, {
  useAnimatedRef,
  useSharedValue
} from "react-native-reanimated";
import { BonusAvailable } from "../../../../../definitions/content/BonusAvailable";
import { BonusAvailableContent } from "../../../../../definitions/content/BonusAvailableContent";
import IOMarkdown from "../../../../components/IOMarkdown";
import { IOScrollView } from "../../../../components/ui/IOScrollView";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { LightModalContext } from "../../../../components/ui/LightModal";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import I18n from "../../../../i18n";
import { maybeNotNullyString } from "../../../../utils/strings";
import { getRemoteLocale } from "../../../messages/utils/ctas";
import TosBonusComponent from "./TosBonusComponent";

type OwnProps = {
  onBack?: () => void;
  bonus: BonusAvailable;
  onConfirm?: () => void;
  onCancel?: () => void;
  primaryCtaText: string;
  secondaryAction: SecondaryAction;
};

type SecondaryAction = { type: "back"; text: string };

type Props = OwnProps &
  Pick<
    ComponentProps<typeof IOScrollViewWithLargeHeader>,
    "contextualHelp" | "contextualHelpMarkdown" | "faqCategories"
  >;

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
                <Body color="grey-850">
                  {I18n.t("bonus.bonusVacanze.advice")}
                </Body>
                <Body
                  asLink
                  weight={"Semibold"}
                  numberOfLines={1}
                  onPress={() => handleModalPress(bT)}
                >
                  {I18n.t("bonus.tos.title")}
                </Body>
              </>
            ),
            // if tos and regulation url is defined
            // return a markdown footer including both links reference (BPD)
            rU => (
              <IOMarkdown
                content={I18n.t("bonus.termsAndConditionFooter", {
                  ctaText,
                  regulationLink: rU.url,
                  tosUrl: bT
                })}
              />
            )
          )
        )
    )
  );

// value is defined the height of the image
const imageHeight: number = 270;

/**
 * A screen to explain how the bonus activation works and how it will be assigned
 */
const BonusInformationComponent = (props: Props) => {
  const { showModal, hideModal } = useContext(LightModalContext);
  const bonusType = props.bonus;
  const bonusTypeLocalizedContent: BonusAvailableContent =
    bonusType[getRemoteLocale()];

  const scrollTranslationY = useSharedValue(0);

  const animatedScrollViewRef = useAnimatedRef<Animated.ScrollView>();

  useHeaderSecondLevel({
    title: bonusTypeLocalizedContent.title,
    scrollValues: {
      triggerOffset: imageHeight,
      contentOffsetY: scrollTranslationY
    },
    supportRequest: true,
    enableDiscreteTransition: true,
    animatedRef: animatedScrollViewRef
  });

  const cancelButtonProps: IOButtonBlockSpecificProps = {
    label: I18n.t("global.buttons.cancel"),
    fullWidth: true,
    color: "danger",
    onPress: props.onCancel ?? constNull
  };

  const requestButtonProps: IOButtonBlockSpecificProps = {
    label: props.primaryCtaText,
    fullWidth: true,
    onPress: props.onConfirm ?? constNull,
    testID: "activate-bonus-button"
  };

  const backButtonProps = {
    label: props.secondaryAction.text,
    fullWidth: true,
    onPress: props.onBack ?? constNull
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

  return (
    <IOScrollView
      animatedRef={animatedScrollViewRef}
      includeContentMargins={false}
      snapOffset={imageHeight}
      headerConfig={{
        type: "base",
        title: bonusTypeLocalizedContent.title
      }}
      actions={{
        type: "TwoButtons",
        primary: props.onConfirm ? requestButtonProps : cancelButtonProps,
        secondary: backButtonProps
      }}
    >
      {O.isSome(maybeHeroImage) && (
        <>
          <Image
            accessibilityIgnoresInvertColors
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
        <IOMarkdown
          content={
            bonusTypeLocalizedContent.subtitle +
            "\n" +
            bonusTypeLocalizedContent.content
          }
        />
        <VSpacer size={40} />
        {getTosFooter(
          maybeBonusTos,
          maybeRegulationUrl,
          handleModalPress,
          props.primaryCtaText
        )}
      </ContentWrapper>
    </IOScrollView>
  );
};

export default BonusInformationComponent;
