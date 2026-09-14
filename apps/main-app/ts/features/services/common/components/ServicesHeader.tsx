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
} from "@io-app/design-system";
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
  subTitle: string;
  title: string;
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
        accessibilityElementsHidden={true}
        accessible={false}
        importantForAccessibility="no-hide-descendants"
        style={styles.itemAvatar}
      >
        <Avatar logoUri={logoUri} size="medium" />
      </View>
      <View style={{ flex: 1 }}>
        <H3 accessibilityRole="header" color={theme["textHeading-secondary"]}>
          {title}
        </H3>
        <BodySmall color={theme["textBody-tertiary"]} weight="Regular">
          {subTitle}
        </BodySmall>
      </View>
    </View>
  );
};

export const ServicesHeaderSkeleton = () => (
  <View
    accessibilityState={{ busy: true }}
    accessible={true}
    style={styles.container}
    testID="services-header-skeleton"
  >
    <View style={styles.itemAvatar}>
      <IOSkeleton
        color={IOColors["grey-200"]}
        radius={IOVisualCostants.avatarRadiusSizeMedium}
        shape="square"
        size={IOVisualCostants.avatarSizeMedium}
      />
    </View>
    <VStack space={8} style={{ flex: 1 }}>
      <IOSkeleton
        color={IOColors["grey-200"]}
        height={16}
        radius={8}
        shape="rectangle"
        width={"100%"}
      />
      <IOSkeleton
        color={IOColors["grey-200"]}
        height={16}
        radius={8}
        shape="rectangle"
        width={"80%"}
      />
      <IOSkeleton
        color={IOColors["grey-200"]}
        height={8}
        radius={8}
        shape="rectangle"
        width={"60%"}
      />
    </VStack>
  </View>
);
