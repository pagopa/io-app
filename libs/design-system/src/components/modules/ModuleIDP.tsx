import { Image, ImageSourcePropType, StyleSheet } from "react-native";

import { useIOTheme, useIOThemeContext } from "../../context";
import { IOListItemLogoMargin } from "../../core";
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
    marginStart: IOListItemLogoMargin,
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
  withLooseSpacing,
  accessibilityLabel
}: ModuleIDPContentProps) => {
  const theme = useIOTheme();
  const IDPLogoSource = useIDPLogo(logo);

  return (
    <PressableModuleBase
      onPress={onPress}
      testID={testID}
      withLooseSpacing={withLooseSpacing}
    >
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
    endBlock={<IOSkeleton radius={8} shape="square" size={24} />}
    startBlock={
      <VStack space={4}>
        <IOSkeleton height={10} radius={8} shape="rectangle" width={100} />
      </VStack>
    }
  />
);
