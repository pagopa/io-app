import {
  Avatar,
  BodySmall,
  H3,
  IOColors,
  IOSkeleton,
  IOSpacingScale,
  IOVisualCostants,
  useIOTheme,
  VStack
} from "@pagopa/io-app-design-system";
import { ImageSourcePropType, StyleSheet, View } from "react-native";

const ITEM_PADDING_VERTICAL: IOSpacingScale = 6;
const AVATAR_MARGIN_RIGHT: IOSpacingScale = 16;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: ITEM_PADDING_VERTICAL
  },
  itemAvatar: {
    marginRight: AVATAR_MARGIN_RIGHT
  }
});

export type ServicesHeaderProps = {
  logoUri: ImageSourcePropType;
  title: string;
  subTitle: string;
};

export const ServicesHeader = ({
  logoUri,
  title,
  subTitle
}: ServicesHeaderProps) => {
  const theme = useIOTheme();

  return (
    <View
      importantForAccessibility="no"
      style={styles.container}
      testID="services-header"
    >
      <View
        accessible={false}
        accessibilityElementsHidden={true}
        importantForAccessibility="no-hide-descendants"
        style={styles.itemAvatar}
      >
        <Avatar logoUri={logoUri} size="medium" />
      </View>
      <View style={{ flex: 1 }}>
        <H3 accessibilityRole="header" color={theme["textHeading-secondary"]}>
          {title}
        </H3>
        <BodySmall weight="Regular" color={theme["textBody-tertiary"]}>
          {subTitle}
        </BodySmall>
      </View>
    </View>
  );
};

export const ServicesHeaderSkeleton = () => (
  <View
    accessible={true}
    accessibilityState={{ busy: true }}
    style={styles.container}
    testID="services-header-skeleton"
  >
    <View style={styles.itemAvatar}>
      <IOSkeleton
        color={IOColors["grey-200"]}
        shape="square"
        size={IOVisualCostants.avatarSizeMedium}
        radius={IOVisualCostants.avatarRadiusSizeMedium}
      />
    </View>
    <VStack space={8} style={{ flex: 1 }}>
      <IOSkeleton
        color={IOColors["grey-200"]}
        shape="rectangle"
        width={"100%"}
        height={16}
        radius={8}
      />
      <IOSkeleton
        color={IOColors["grey-200"]}
        shape="rectangle"
        width={"80%"}
        height={16}
        radius={8}
      />
      <IOSkeleton
        color={IOColors["grey-200"]}
        shape="rectangle"
        width={"60%"}
        height={8}
        radius={8}
      />
    </VStack>
  </View>
);
