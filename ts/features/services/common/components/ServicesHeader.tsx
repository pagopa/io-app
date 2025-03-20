import {
  Avatar,
  H3,
  IOColors,
  IOSpacingScale,
  IOStyles,
  IOVisualCostants,
  BodySmall,
  useIOTheme,
  VSpacer
} from "@pagopa/io-app-design-system";
import { ImageURISource, StyleSheet, View } from "react-native";
import Placeholder from "rn-placeholder";

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
  logoUri: ReadonlyArray<ImageURISource>;
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
      <View style={IOStyles.flex}>
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
      <Placeholder.Box
        width={IOVisualCostants.avatarSizeMedium}
        height={IOVisualCostants.avatarSizeMedium}
        animate="fade"
        radius={IOVisualCostants.avatarRadiusSizeMedium}
        color={IOColors["grey-200"]}
      />
    </View>
    <View style={IOStyles.flex}>
      <Placeholder.Box
        animate="fade"
        color={IOColors["grey-200"]}
        height={16}
        width={"100%"}
        radius={8}
      />
      <VSpacer size={8} />
      <Placeholder.Box
        animate="fade"
        color={IOColors["grey-200"]}
        height={16}
        width={"80%"}
        radius={8}
      />
      <VSpacer size={8} />
      <Placeholder.Box
        animate="fade"
        color={IOColors["grey-200"]}
        height={8}
        width={"60%"}
        radius={8}
      />
    </View>
  </View>
);
