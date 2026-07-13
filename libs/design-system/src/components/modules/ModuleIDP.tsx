import { Image, ImageSourcePropType, StyleSheet } from "react-native";
import { useIOThemeContext, useIOTheme } from "../../context";
import { IOListItemLogoMargin } from "../../core";
import { addCacheTimestampToUri } from "../../utils/image";
import { IOText } from "../typography";
import {
  PressableModuleBase,
  PressableModuleBaseProps
} from "./PressableModuleBase";

type IDPLogoColorMode = {
  light: ImageSourcePropType;
  dark?: ImageSourcePropType;
};
interface ModuleIDP extends PressableModuleBaseProps {
  name: string;
  logo: IDPLogoColorMode;
  accessibilityLabel?: string;
}

const styles = StyleSheet.create({
  idpLogo: {
    marginStart: IOListItemLogoMargin,
    width: 120,
    height: 30,
    resizeMode: "contain"
  }
});

const useIDPLogo = (logo: IDPLogoColorMode): ImageSourcePropType => {
  const { themeType } = useIOThemeContext();

  const logoIDPLightMode = addCacheTimestampToUri(logo.light);

  if (!logo.dark) {
    return logoIDPLightMode;
  }

  const logoIDPDarkMode = addCacheTimestampToUri(logo.dark);

  return themeType === "dark" ? logoIDPDarkMode : logoIDPLightMode;
};

export const ModuleIDP = ({
  name,
  logo,
  withLooseSpacing = false,
  onPress,
  testID,
  accessibilityLabel
}: ModuleIDP) => {
  const theme = useIOTheme();
  const IDPLogoSource = useIDPLogo(logo);

  return (
    <PressableModuleBase
      onPress={onPress}
      testID={testID}
      withLooseSpacing={withLooseSpacing}
    >
      <IOText
        weight={"Semibold"}
        size={12}
        lineHeight={16}
        color={theme["textBody-tertiary"]}
        textStyle={{
          alignSelf: "center",
          textTransform: "uppercase",
          letterSpacing: 0.5,
          flexShrink: 1
        }}
        accessibilityLabel={accessibilityLabel ?? name}
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
