import {
  BodySmall,
  ContentWrapper,
  Divider,
  H3,
  H4,
  HStack,
  Icon,
  IOColors,
  IOIcons,
  useIOToast,
  VSpacer,
  VStack
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useCallback, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedRef,
  useDerivedValue,
  useScrollViewOffset,
  useSharedValue
} from "react-native-reanimated";
import Feature1Image from "../../../../../img/features/itWallet/discovery/feature_1.svg";
import Feature2Image from "../../../../../img/features/itWallet/discovery/feature_2.svg";
import Feature3Image from "../../../../../img/features/itWallet/discovery/feature_3.svg";
import Feature4Image from "../../../../../img/features/itWallet/discovery/feature_4.svg";
import Feature5Image from "../../../../../img/features/itWallet/discovery/feature_5.svg";
import { AnimatedImage } from "../../../../components/AnimatedImage.tsx";
import IOMarkdown from "../../../../components/IOMarkdown/index.tsx";
import { IOScrollViewWithReveal } from "../../../../components/ui/IOScrollViewWithReveal.tsx";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel.tsx";
import { useIOSelector } from "../../../../store/hooks.ts";
import { setAccessibilityFocus } from "../../../../utils/accessibility.ts";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp.tsx";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender.ts";
import { tosConfigSelector } from "../../../tos/store/selectors/index.ts";
import { ITW_SCREENVIEW_EVENTS } from "../../analytics/enum.ts";
import {
  trackItWalletActivationStart,
  trackItwDiscoveryPlus,
  trackItwIntroBack,
  trackOpenItwTos
} from "../../analytics/index.ts";
import { useItwDismissalDialog } from "../../common/hooks/useItwDismissalDialog.tsx";
import { itwIsActivationDisabledSelector } from "../../common/store/selectors/remoteConfig.ts";
import { generateItwIOMarkdownRules } from "../../common/utils/markdown.tsx";
import { ItwEidIssuanceMachineContext } from "../../machine/eid/provider.tsx";
import { selectIsLoading } from "../../machine/eid/selectors.ts";

// Offset to avoid to scroll to the block without margins
const scrollOffset: number = 12;
// Percentage of the visible block after which the anchor link is hidden
const intersectionRatio: number = 0.3;

/**
 * This is the component that shows the information about the activation of
 * IT-Wallet. Must be used only for L3 activations.
 */
export const ItwDiscoveryInfoComponent = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const isLoading = ItwEidIssuanceMachineContext.useSelector(selectIsLoading);
  const itwActivationDisabled = useIOSelector(itwIsActivationDisabledSelector);
  const { tos_url } = useIOSelector(tosConfigSelector);
  const toast = useIOToast();

  useOnFirstRender(
    useCallback(() => {
      machineRef.send({
        type: "start",
        isL3: true
      });
    }, [machineRef])
  );

  const dismissalDialog = useItwDismissalDialog({
    customLabels: {
      title: I18n.t(
        "features.itWallet.discovery.screen.itw.dismissalDialog.title"
      ),
      body: I18n.t(
        "features.itWallet.discovery.screen.itw.dismissalDialog.body"
      ),
      confirmLabel: I18n.t(
        "features.itWallet.discovery.screen.itw.dismissalDialog.confirm"
      ),
      cancelLabel: I18n.t(
        "features.itWallet.discovery.screen.itw.dismissalDialog.cancel"
      )
    },
    dismissalContext: {
      screen_name: ITW_SCREENVIEW_EVENTS.ITW_INTRO,
      itw_flow: "L3"
    }
  });

  useHeaderSecondLevel({
    contextualHelp: emptyContextualHelp,
    supportRequest: true,
    title: "",
    goBack: () => {
      trackItwIntroBack("L3");
      dismissalDialog.show();
    },
    onStartSupportRequest: () => {
      toast.info(I18n.t("features.itWallet.generic.featureUnavailable.title"));
      return false;
    }
  });

  const handleContinuePress = useCallback(() => {
    trackItWalletActivationStart("L3");
    machineRef.send({ type: "accept-tos" });
  }, [machineRef]);

  const [productHighlightsLayout, setProductHighlightsLayout] = useState({
    y: 0,
    height: 0
  });

  const productHighlightsRef = useRef<View>(null);
  const animatedRef = useAnimatedRef<Animated.ScrollView>();
  const scrollPosition = useScrollViewOffset(animatedRef);
  const hideAnchorLink = useSharedValue(false);

  useDerivedValue(() => {
    const threshold: number =
      productHighlightsLayout.height * (1 - intersectionRatio);

    if (productHighlightsLayout.y > 0) {
      // eslint-disable-next-line functional/immutable-data
      hideAnchorLink.value =
        scrollPosition.value >= productHighlightsLayout.y - threshold;
    }
  });

  const handleScrollToHighlights = useCallback(() => {
    animatedRef.current?.scrollTo({
      y: productHighlightsLayout.y - scrollOffset,
      animated: true
    });
    setAccessibilityFocus(productHighlightsRef);
    trackItwDiscoveryPlus();
  }, [animatedRef, productHighlightsLayout]);

  return (
    <IOScrollViewWithReveal
      animatedRef={animatedRef}
      hideAnchorAction={hideAnchorLink}
      actions={{
        primary: {
          loading: isLoading,
          disabled: itwActivationDisabled,
          label: I18n.t(
            "features.itWallet.discovery.screen.itw.actions.primary"
          ),
          onPress: handleContinuePress
        },
        anchor: {
          label: I18n.t(
            "features.itWallet.discovery.screen.itw.actions.anchor"
          ),
          onPress: handleScrollToHighlights
        }
      }}
    >
      <AnimatedImage
        source={require("../../../../../img/features/itWallet/discovery/itw_hero.png")}
        style={styles.hero}
      />
      <VSpacer size={24} />
      <ContentWrapper>
        <H3>{I18n.t("features.itWallet.discovery.screen.itw.title")}</H3>
        <VSpacer size={24} />
        <VStack space={16}>
          <FeatureBlock
            image={<Feature1Image width={48} height={48} />}
            content={I18n.t(
              "features.itWallet.discovery.screen.itw.features.1"
            )}
          />
          <FeatureBlock
            image={<Feature2Image width={48} height={48} />}
            content={I18n.t(
              "features.itWallet.discovery.screen.itw.features.2"
            )}
          />
          <FeatureBlock
            image={<Feature3Image width={48} height={48} />}
            content={I18n.t(
              "features.itWallet.discovery.screen.itw.features.3"
            )}
          />
          <FeatureBlock
            image={<Feature4Image width={48} height={48} />}
            content={I18n.t(
              "features.itWallet.discovery.screen.itw.features.4"
            )}
          />
          <FeatureBlock
            image={<Feature5Image width={48} height={48} />}
            content={I18n.t(
              "features.itWallet.discovery.screen.itw.features.5"
            )}
          />
        </VStack>
        <VSpacer size={32} />
        <Divider />
        <View
          ref={productHighlightsRef}
          onLayout={event => {
            setProductHighlightsLayout({
              y: event.nativeEvent.layout.y,
              height: event.nativeEvent.layout.height
            });
          }}
        >
          <DetailBlock
            title={I18n.t(
              "features.itWallet.discovery.screen.itw.details.1.title"
            )}
            content={I18n.t(
              "features.itWallet.discovery.screen.itw.details.1.content"
            )}
            icon="security"
          />
          <Divider />
          <DetailBlock
            title={I18n.t(
              "features.itWallet.discovery.screen.itw.details.2.title"
            )}
            content={I18n.t(
              "features.itWallet.discovery.screen.itw.details.2.content"
            )}
            icon="fiscalCodeIndividual"
          />
          <Divider />
          <DetailBlock
            title={I18n.t(
              "features.itWallet.discovery.screen.itw.details.3.title"
            )}
            content={I18n.t(
              "features.itWallet.discovery.screen.itw.details.3.content"
            )}
            icon="navQrWallet"
          />
          <Divider />
          <DetailBlock
            title={I18n.t(
              "features.itWallet.discovery.screen.itw.details.4.title"
            )}
            content={I18n.t(
              "features.itWallet.discovery.screen.itw.details.4.content"
            )}
            icon="euStars"
          />
        </View>

        <VSpacer size={24} />
        <IOMarkdown
          content={I18n.t("features.itWallet.discovery.screen.itw.tos", {
            tos_url
          })}
          rules={generateItwIOMarkdownRules({
            linkCallback: trackOpenItwTos,
            paragraphSize: "small"
          })}
        />
      </ContentWrapper>
    </IOScrollViewWithReveal>
  );
};

const FeatureBlock = (props: {
  content: string;
  image: React.ReactElement;
}) => (
  <HStack space={16} style={styles.feature}>
    {props.image}
    <BodySmall style={{ flex: 1, flexWrap: "wrap" }}>{props.content}</BodySmall>
  </HStack>
);

const DetailBlock = (props: {
  title: string;
  content: string;
  icon: IOIcons;
}) => (
  <VStack space={8} style={styles.detail}>
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      <H4>{props.title}</H4>
      <Icon name={props.icon} size={24} color="blueIO-500" />
    </View>
    <IOMarkdown content={props.content} />
  </VStack>
);

const styles = StyleSheet.create({
  hero: {
    width: "100%",
    height: "auto",
    resizeMode: "cover",
    aspectRatio: 4 / 3
  },
  feature: {
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: IOColors["grey-50"],
    borderRadius: 8
  },
  detail: {
    paddingVertical: 16
  }
});
