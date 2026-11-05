import { Image, ImageSourcePropType, StyleSheet } from "react-native";

import { useIOColors, useIOThemeContext } from "../../context";
import { IODimensions } from "../../core";
import { addCacheTimestampToUri } from "../../utils/image";
import { VStack } from "../layout";
import { IOSkeleton } from "../skeleton";
import { IOText } from "../typography";
import { ModuleStatic } from "./ModuleStatic";
import {
  PressableModuleBase,
  PressableModuleBaseProps
} from "./PressableModuleBase";

type IDPLogoColorMode = {
  dark?: ImageSourcePropType;
  light: ImageSourcePropType;
};

type ModuleIDPContentProps = PressableModuleBaseProps & {
  accessibilityLabel?: string;
  isLoading?: false;
  logo: IDPLogoColorMode;
  name: string;
};

type ModuleIDPLoadingProps = {
  isLoading: true;
  loadingAccessibilityLabel?: string;
};

type ModuleIDPProps = ModuleIDPContentProps | ModuleIDPLoadingProps;

const styles = StyleSheet.create({
  idpLogo: {
    marginStart: IODimensions.gap.module.trailing,
    width: 120,
    height: 28,
    resizeMode: "contain"
  }
});

const useIDPLogo = (logo: IDPLogoColorMode): ImageSourcePropType => {
  const { themeType } = useIOThemeContext();

  const logoIDPLightMode = addCacheTimestampToUri(logo.light);

  if (logo.dark == null) {
    return logoIDPLightMode;
  }

  const logoIDPDarkMode = addCacheTimestampToUri(logo.dark);

  return themeType === "dark" ? logoIDPDarkMode : logoIDPLightMode;
};

export const ModuleIDP = (props: ModuleIDPProps) => {
  if (props.isLoading) {
    return (
      <ModuleIDPSkeleton
        loadingAccessibilityLabel={props.loadingAccessibilityLabel}
      />
    );
  }
  return <ModuleIDPContent {...props} />;
};

const ModuleIDPContent = ({
  logo,
  name,
  onPress,
  testID,
  accessibilityLabel
}: ModuleIDPContentProps) => {
  const moduleColors = useIOColors().component.module;
  const IDPLogoSource = useIDPLogo(logo);

  return (
    <PressableModuleBase onPress={onPress} testID={testID}>
      <IOText
        accessibilityLabel={accessibilityLabel ?? name}
        color={moduleColors.foreground.description}
        lineHeight={16}
        size={12}
        textStyle={{
          alignSelf: "center",
          textTransform: "uppercase",
          letterSpacing: 0.5,
          flexShrink: 1
        }}
        weight={"Semibold"}
      >
        {name}
      </IOText>
      <Image
        accessibilityIgnoresInvertColors
        source={IDPLogoSource}
        style={styles.idpLogo}
      />
    </PressableModuleBase>
  );
};

const ModuleIDPSkeleton = ({
  loadingAccessibilityLabel
}: Pick<ModuleIDPLoadingProps, "loadingAccessibilityLabel">) => (
  <ModuleStatic
    accessibilityLabel={loadingAccessibilityLabel}
    accessibilityState={{ busy: true }}
    accessible={true}
    endBlock={
      <IOSkeleton
        radius={IODimensions.radius.default}
        shape="square"
        size={24}
      />
    }
    startBlock={
      <VStack space={4}>
        <IOSkeleton
          height={10}
          radius={IODimensions.radius.default}
          shape="rectangle"
          width={100}
        />
      </VStack>
    }
  />
);
