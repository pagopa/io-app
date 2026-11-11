import { Image, ImageSourcePropType, StyleSheet } from "react-native";

import { useIOTheme, useIOThemeContext } from "../../context";
import { IODimensions, IOTypography } from "../../core";
import { addCacheTimestampToUri } from "../../utils/image";
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

const IDP_LOGO_SIZE = { width: 120, height: 28 };

const styles = StyleSheet.create({
  idpLogo: {
    ...IDP_LOGO_SIZE,
    marginStart: IODimensions.gap.module.trailing,
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
  const theme = useIOTheme();
  const IDPLogoSource = useIDPLogo(logo);

  return (
    <PressableModuleBase onPress={onPress} testID={testID}>
      <IOText
        accessibilityLabel={accessibilityLabel ?? name}
        color={theme["textBody-tertiary"]}
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
        height={IDP_LOGO_SIZE.height}
        radius={IODimensions.radius.skeleton.graphic}
        shape="rectangle"
        width={IDP_LOGO_SIZE.width}
      />
    }
    startBlock={
      <IOSkeleton
        height={IOTypography.caption.size}
        radius={IODimensions.radius.skeleton.text}
        shape="rectangle"
        width="50%"
      />
    }
  />
);
