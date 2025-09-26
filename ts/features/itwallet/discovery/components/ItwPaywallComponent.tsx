import {
  Badge,
  Body,
  ContentWrapper,
  Divider,
  FeatureInfo,
  H4,
  H6,
  IOColors,
  IOIcons,
  Icon,
  VSpacer,
  VStack,
  useIOTheme
} from "@pagopa/io-app-design-system";
import {
  Canvas,
  LinearGradient,
  RoundedRect,
  vec
} from "@shopify/react-native-skia";
import { TxtLinkNode, TxtParagraphNode } from "@textlint/ast-node-types";
import { useCallback, useRef, useState } from "react";
import { FlatList, ListRenderItemInfo, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedRef,
  useDerivedValue,
  useScrollViewOffset,
  useSharedValue
} from "react-native-reanimated";
import I18n from "i18next";
import ItwHero from "../../../../../img/features/itWallet/l3/itw_hero.svg";
import IOMarkdown from "../../../../components/IOMarkdown";
import {
  getTxtNodeKey,
  handleOpenLink
} from "../../../../components/IOMarkdown/renderRules";
import { Renderer } from "../../../../components/IOMarkdown/types";
import FocusAwareStatusBar from "../../../../components/ui/FocusAwareStatusBar";
import { IOScrollViewWithReveal } from "../../../../components/ui/IOScrollViewWithReveal";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { useIOSelector } from "../../../../store/hooks";
import { setAccessibilityFocus } from "../../../../utils/accessibility";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { itwGradientColors } from "../../common/utils/constants.ts";
import { tosConfigSelector } from "../../../tos/store/selectors";
import { selectIsLoading } from "../../machine/eid/selectors";
import { ItwEidIssuanceMachineContext } from "../../machine/eid/provider";
import { trackItwDiscoveryPlus, trackItwIntroBack } from "../../analytics";
import { useItwDismissalDialog } from "../../common/hooks/useItwDismissalDialog";
import { ITW_SCREENVIEW_EVENTS } from "../../analytics/enum";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender.ts";
import { itwLifecycleIsValidSelector } from "../../lifecycle/store/selectors/index.ts";

const markdownRules = {
  Paragraph(paragraph: TxtParagraphNode, render: Renderer) {
    return (
      <Body color="white" key={getTxtNodeKey(paragraph)}>
        {paragraph.children.map(render)}
      </Body>
    );
  },
  Link(link: TxtLinkNode, render: Renderer) {
    return (
      <Body
        asLink
        avoidPressable
        color="white"
        weight="Semibold"
        key={getTxtNodeKey(link)}
        onPress={() => handleOpenLink(link.url)}
      >
        {link.children.map(render)}
      </Body>
    );
  }
};

export type ItwPaywallComponentProps = {
  onContinuePress: () => void;
};

// Offset to avoid to scroll to the block without margins
const scrollOffset: number = 12;
// Percentage of the visible block after which the anchor link is hidden
const intersectionRatio: number = 0.3;

export const ItwPaywallComponent = ({
  onContinuePress
}: ItwPaywallComponentProps) => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const theme = useIOTheme();

  const { tos_url } = useIOSelector(tosConfigSelector);
  const isWalletValid = useIOSelector(itwLifecycleIsValidSelector);
  const isLoading = ItwEidIssuanceMachineContext.useSelector(selectIsLoading);

  const backgroundColor = IOColors[theme["appBackground-accent"]];

  useOnFirstRender(() => {
    machineRef.send({
      type: "start",
      isL3: true,
      mode: isWalletValid ? "upgrade" : "issuance"
    });
  });

  useHeaderSecondLevel({
    backgroundColor,
    contextualHelp: emptyContextualHelp,
    supportRequest: true,
    title: "",
    variant: "contrast",
    goBack: () => {
      trackItwIntroBack("L3");
      dismissalDialog.show();
    }
  });

  const dismissalDialog = useItwDismissalDialog({
    customLabels: {
      title: I18n.t(
        "features.itWallet.discovery.paywall.dismissalDialog.title"
      ),
      body: I18n.t("features.itWallet.discovery.paywall.dismissalDialog.body"),
      confirmLabel: I18n.t(
        "features.itWallet.discovery.paywall.dismissalDialog.confirm"
      ),
      cancelLabel: I18n.t(
        "features.itWallet.discovery.paywall.dismissalDialog.cancel"
      )
    },
    dismissalContext: {
      screen_name: ITW_SCREENVIEW_EVENTS.ITW_INTRO,
      itw_flow: "L3"
    }
  });

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
        anchor: {
          label: I18n.t("features.itWallet.discovery.paywall.anchorAction"),
          onPress: handleScrollToHighlights
        },
        primary: {
          loading: isLoading,
          label: I18n.t("features.itWallet.discovery.paywall.primaryAction"),
          onPress: onContinuePress
        }
      }}
    >
      <FocusAwareStatusBar
        animated
        backgroundColor={backgroundColor}
        barStyle="light-content"
      />
      <ContentWrapper
        style={{
          backgroundColor,
          paddingVertical: "100%",
          marginVertical: "-100%"
        }}
      >
        <VStack space={24}>
          <View style={styles.cardContainer}>
            <BackgroundGradient />
            <View style={{ paddingBottom: 24 }}>
              <View style={styles.logoContainer}>
                <ItwHero width="100%" height="100%" />
              </View>
              <VStack space={16} style={{ alignItems: "center" }}>
                <Badge
                  variant="highlight"
                  text={I18n.t("features.itWallet.discovery.paywall.badge")}
                />
                <H4 color="white" style={{ textAlign: "center" }}>
                  {I18n.t("features.itWallet.discovery.paywall.description")}
                </H4>
              </VStack>
              <VSpacer size={32} />
              <FeatureHighlights />
              <VSpacer size={24} />

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
                <ProductHighlights />
              </View>
            </View>
          </View>
          <IOMarkdown
            content={I18n.t("features.itWallet.discovery.paywall.tos", {
              tos_url
            })}
            rules={markdownRules}
          />
        </VStack>
      </ContentWrapper>
    </IOScrollViewWithReveal>
  );
};

const BackgroundGradient = () => {
  const [{ width, height }, setDimensions] = useState({ width: 0, height: 0 });

  return (
    <View
      style={styles.gradient}
      onLayout={event => {
        setDimensions({
          width: event.nativeEvent.layout.width,
          height: event.nativeEvent.layout.height
        });
      }}
    >
      <Canvas style={StyleSheet.absoluteFill}>
        <RoundedRect x={0} y={0} width={width} height={height} r={16}>
          <LinearGradient
            start={vec(0, height / 2)}
            end={vec(width, 0)}
            mode="repeat"
            colors={itwGradientColors}
          />
        </RoundedRect>
      </Canvas>
    </View>
  );
};

const FeatureHighlights = () => (
  <VStack space={8}>
    <FeatureInfo
      body={I18n.t("features.itWallet.discovery.paywall.featureHighlights.1")}
      variant="contrast"
      pictogramProps={{
        name: "itWallet",
        pictogramStyle: "light-content"
      }}
    />
    <FeatureInfo
      body={I18n.t("features.itWallet.discovery.paywall.featureHighlights.2")}
      variant="contrast"
      pictogramProps={{
        name: "identity",
        pictogramStyle: "light-content"
      }}
    />
    <FeatureInfo
      body={I18n.t("features.itWallet.discovery.paywall.featureHighlights.3")}
      variant="contrast"
      pictogramProps={{
        name: "cie",
        pictogramStyle: "light-content"
      }}
    />
    <FeatureInfo
      body={I18n.t("features.itWallet.discovery.paywall.featureHighlights.4")}
      variant="contrast"
      pictogramProps={{
        name: "security",
        pictogramStyle: "light-content"
      }}
    />
    <FeatureInfo
      body={I18n.t("features.itWallet.discovery.paywall.featureHighlights.5")}
      variant="contrast"
      pictogramProps={{
        name: "updateOS",
        pictogramStyle: "light-content"
      }}
    />
  </VStack>
);

type ProductHighlightItem = {
  content: string;
  icon: IOIcons;
  title: string;
};

const ProductHighlights = () => {
  const productItems: Array<ProductHighlightItem> = [
    {
      content: I18n.t(
        "features.itWallet.discovery.paywall.productHighlights.1.content"
      ),
      icon: "security",
      title: I18n.t(
        "features.itWallet.discovery.paywall.productHighlights.1.title"
      )
    },
    {
      content: I18n.t(
        "features.itWallet.discovery.paywall.productHighlights.2.content"
      ),
      icon: "fiscalCodeIndividual",
      title: I18n.t(
        "features.itWallet.discovery.paywall.productHighlights.2.title"
      )
    },
    {
      content: I18n.t(
        "features.itWallet.discovery.paywall.productHighlights.3.content"
      ),
      icon: "website",
      title: I18n.t(
        "features.itWallet.discovery.paywall.productHighlights.3.title"
      )
    },
    {
      content: I18n.t(
        "features.itWallet.discovery.paywall.productHighlights.4.content"
      ),
      icon: "navQrWallet",
      title: I18n.t(
        "features.itWallet.discovery.paywall.productHighlights.4.title"
      )
    }
  ];

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ProductHighlightItem>) => (
      <View style={styles.productHighlightItem}>
        <View style={{ flexDirection: "row" }}>
          <View style={{ flex: 1 }}>
            <H6 color="white">{item.title}</H6>
          </View>
          <Icon allowFontScaling name={item.icon} color="white" />
        </View>
        <VSpacer size={8} />
        <IOMarkdown content={item.content} rules={markdownRules} />
      </View>
    ),
    []
  );

  return (
    <FlatList
      ItemSeparatorComponent={Divider}
      data={productItems}
      keyExtractor={item => item.title}
      renderItem={renderItem}
      scrollEnabled={false}
    />
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: IOColors["blueIO-500"],
    display: "flex",
    paddingHorizontal: 16,
    borderRadius: 16,
    overflow: "visible",
    shadowColor: IOColors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5
  },
  logoContainer: {
    alignItems: "center",
    aspectRatio: 286 / 192,
    marginHorizontal: -16
  },
  gradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  productHighlightItem: {
    paddingVertical: 16,
    justifyContent: "space-between"
  }
});
