import {
  Avatar,
  Body,
  BodySmall,
  ContentWrapper,
  H3,
  HStack,
  IOColors,
  IOVisualCostants,
  RadioGroup,
  VStack,
  hexToRgba,
  useIOTheme
} from "@pagopa/io-app-design-system";
import {
  Blur,
  Canvas,
  Group,
  Image,
  Mask,
  Rect,
  LinearGradient as SkiaLinearGradient,
  useImage,
  vec
} from "@shopify/react-native-skia";
import { useCallback, useMemo, useState } from "react";
import { Dimensions, Platform, ScrollView, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FocusAwareStatusBar from "../../../components/ui/FocusAwareStatusBar";

const cdnPath = "https://assets.cdn.io.italia.it/logos/organizations/";

const organizationsURIs = [
  {
    imageSource: `${cdnPath}1199250158.png`,
    name: "Comune di Milano"
  },
  {
    imageSource: `${cdnPath}82003830161.png`,
    name: "Comune di Sotto il Monte Giovanni XXIII"
  },
  {
    imageSource: `${cdnPath}82001760675.png`,
    name: "Comune di Controguerra"
  },
  {
    imageSource: `${cdnPath}80078750587.png`,
    name: "INPS"
  },
  {
    imageSource: `${cdnPath}5779711000.png`,
    name: "e-distribuzione"
  },
  {
    imageSource: `${cdnPath}97254170588.png`,
    name: "Agenzia della Difesa"
  },
  {
    imageSource: `${cdnPath}80215430580.png`,
    name: "Ministero dell'Interno"
  }
];

/**
 * This Screen is used to test components in isolation while developing.
 * @returns a screen with a flexed view where you can test components
 */
export const DSDynamicBackground = () => {
  const insets = useSafeAreaInsets();
  const theme = useIOTheme();

  const screenSize = Dimensions.get("screen").width;
  const heroHeight: number = 350 + insets.top;
  const scrollGradientHeight: number = 32;
  const headerHeight: number = 60;
  // const heroOffset: number = 50;

  const renderedOrganizationsURIs: Array<{
    value: string;
    id: string;
  }> = organizationsURIs.map(item => ({
    value: item.name,
    id: item.name
  }));

  const [selectedItem, setSelectedItem] = useState(organizationsURIs[0].name);

  const onEntitySelected = useCallback(
    (item: any) => setSelectedItem(item),
    [setSelectedItem]
  );

  const entityData = useMemo(
    () => organizationsURIs.find(item => item.name === selectedItem),
    [selectedItem]
  );

  return (
    <>
      <FocusAwareStatusBar translucent backgroundColor="transparent" />
      <Canvas
        style={{
          width: screenSize,
          minHeight: heroHeight,
          position: "absolute",
          top: 0
        }}
      >
        <Mask
          mask={
            <Rect x={0} y={0} width={screenSize} height={heroHeight}>
              <SkiaLinearGradient
                start={vec(0, 0)}
                end={vec(0, heroHeight)}
                colors={["black", "black", "transparent"]}
              />
            </Rect>
          }
        >
          <Group
            opacity={Platform.OS === "android" ? 0.6 : 0.7}
            origin={{
              x: screenSize,
              y: insets.top
            }}
            transform={[{ rotate: 45 }, { scale: 1.75 }]}
          >
            <Image
              image={useImage(entityData?.imageSource)}
              fit="cover"
              rect={{
                x: screenSize / 2,
                y: 0,
                width: screenSize,
                height: screenSize
              }}
            >
              <Blur blur={40} />
            </Image>
          </Group>
        </Mask>
      </Canvas>
      <View
        style={{
          zIndex: 10,
          marginTop: headerHeight + insets.top,
          marginHorizontal: IOVisualCostants.appMarginDefault
        }}
      >
        <VStack space={24}>
          <HStack space={16}>
            <Avatar
              key={entityData?.name}
              size="medium"
              logoUri={{ uri: entityData?.imageSource }}
            />
            <View style={{ alignSelf: "center", flexShrink: 1 }}>
              <H3 color={theme["textBody-secondary"]}>{entityData?.name}</H3>
              <BodySmall
                weight="Regular"
                color={theme["textBody-secondary"]}
                style={{ opacity: 0.8 }}
              >
                {entityData?.name}
              </BodySmall>
            </View>
          </HStack>

          <View
            style={{
              borderRadius: IOVisualCostants.avatarRadiusSizeMedium,
              borderCurve: "continuous",
              backgroundColor: IOColors[theme["appBackground-primary"]],
              borderWidth: 1,
              borderColor: hexToRgba(
                IOColors[theme["textBody-secondary"]],
                0.1
              ),
              padding: 24
            }}
          >
            <Body color={theme["textBody-secondary"]}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean
              interdum fringilla ex id viverra. In fringilla, orci sed placerat
              egestas, nibh ligula pellentesque ex, ac ultrices orci massa
              efficitur neque. Nunc congue sagittis felis ut fringilla. Integer
              lacinia vehicula lacus vitae aliquam. Pellentesque feugiat
              pellentesque laoreet. Nunc congue facilisis leo, eu condimentum
              est lobortis vel.
            </Body>
          </View>
        </VStack>

        <LinearGradient
          style={{
            height: scrollGradientHeight,
            position: "absolute",
            left: -IOVisualCostants.appMarginDefault,
            right: -IOVisualCostants.appMarginDefault,
            bottom: -scrollGradientHeight
          }}
          colors={[
            IOColors[theme["appBackground-primary"]],
            hexToRgba(IOColors[theme["appBackground-primary"]], 0)
          ]}
        />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingTop: scrollGradientHeight,
          paddingBottom: 32 + insets.bottom
        }}
      >
        <ContentWrapper>
          <RadioGroup<string>
            type="radioListItem"
            items={renderedOrganizationsURIs}
            selectedItem={selectedItem}
            onPress={onEntitySelected}
          />
        </ContentWrapper>
      </ScrollView>
    </>
  );
};
