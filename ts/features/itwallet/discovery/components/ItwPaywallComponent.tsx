import {
  Avatar,
  Badge,
  Body,
  BodySmall,
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
import { TxtLinkNode, TxtParagraphNode } from "@textlint/ast-node-types";
import { useCallback, useState } from "react";
import { FlatList, ListRenderItemInfo, StyleSheet, View } from "react-native";
import {
  Canvas,
  LinearGradient,
  RoundedRect,
  vec
} from "@shopify/react-native-skia";
import ItwHero from "../../../../../img/features/itWallet/l3/itw_hero.svg";
import IOMarkdown from "../../../../components/IOMarkdown";
import {
  getTxtNodeKey,
  handleOpenLink
} from "../../../../components/IOMarkdown/renderRules";
import { Renderer } from "../../../../components/IOMarkdown/types";
import I18n from "../../../../i18n";
import { useIOSelector } from "../../../../store/hooks";
import { tosConfigSelector } from "../../../tos/store/selectors";
import { ServiceId } from "../../../../../definitions/services/ServiceId";
import { getLogoForInstitution } from "../../../services/common/utils";
import { IOScrollView } from "../../../../components/ui/IOScrollView";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";

const institutionList = [
  "06363391001",
  "80050050154",
  "01165400589",
  "80078750587"
] as Array<ServiceId>;

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

export const ItwPaywallComponent = (_: ItwPaywallComponentProps) => {
  const theme = useIOTheme();

  const backgroundColor = IOColors[theme["appBackground-accent"]];

  useHeaderSecondLevel({
    backgroundColor,
    contextualHelp: emptyContextualHelp,
    supportRequest: true,
    title: "",
    variant: "contrast"
  });

  return (
    <IOScrollView
      includeContentMargins={false}
      contentContainerStyle={{
        flexGrow: 1
      }}
    >
      <ContentWrapper
        style={{
          backgroundColor,
          paddingVertical: "100%",
          marginVertical: "-100%"
        }}
      >
        <InnerComponent />
      </ContentWrapper>
    </IOScrollView>
  );
};

const InnerComponent = () => {
  const { tos_url } = useIOSelector(tosConfigSelector);

  return (
    <VStack space={24}>
      <View style={styles.cardContainer}>
        <BackgroundGradient />
        <View style={{ paddingBottom: 24 }}>
          <View style={{ alignItems: "center" }}>
            <ItwHero width={286} height={192} />
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
          <ProductHighlights />
        </View>
      </View>
      <IOMarkdown
        content={I18n.t("features.itWallet.discovery.paywall.tos", {
          tos_url
        })}
        rules={markdownRules}
      />
    </VStack>
  );
};

const BackgroundGradient = () => {
  const [{ width, height }, setDimensions] = useState({ width: 0, height: 0 });

  return (
    <Canvas
      style={styles.gradient}
      onLayout={event => {
        setDimensions({
          width: event.nativeEvent.layout.width,
          height: event.nativeEvent.layout.height
        });
      }}
    >
      <RoundedRect x={0} y={0} width={width} height={height} r={16}>
        <LinearGradient
          start={vec(0, height / 2)}
          end={vec(width, 0)}
          mode="repeat"
          colors={[
            "#0B3EE3",
            "#234FFF",
            "#436FFF",
            "#2F5EFF",
            "#1E53FF",
            "#1848F0",
            "#0B3EE3",
            "#1F4DFF",
            "#2A5CFF",
            "#1943E8",
            "#0B3EE3"
          ]}
        />
      </RoundedRect>
    </Canvas>
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
      body={
        <VStack space={8}>
          <BodySmall color="white">
            {I18n.t("features.itWallet.discovery.paywall.featureHighlights.5")}
          </BodySmall>
          <View style={{ flexDirection: "row" }}>
            {institutionList.map((institutionId, index) => (
              <View
                key={institutionId}
                style={{
                  marginLeft: index === 0 ? 0 : -8
                }}
              >
                <Avatar
                  size="small"
                  logoUri={getLogoForInstitution(institutionId)}
                />
              </View>
            ))}
          </View>
        </VStack>
      }
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
