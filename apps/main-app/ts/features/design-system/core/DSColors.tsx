import {
  H3,
  H6,
  IOColorPalette,
  IOColorsExtra,
  IOColorsLegacy,
  IOColorsNeutral,
  IOColorsStatus,
  IOColorsTints,
  IODimensions,
  IOThemeDark,
  IOThemeLight,
  themeStatusColorsDarkMode,
  themeStatusColorsLightMode,
  useIOColors,
  VStack,
  withAlpha
} from "@io-app/design-system";
import { ColorValue, Dimensions, StyleSheet, Text, View } from "react-native";

import { DesignSystemScreen } from "../components/DesignSystemScreen";

const macroSectionMargin = 48;
const sectionTitleMargin = 16;
const colorItemGutter = 32;
const colorItemPadding = 8;
const colorItemMargin = 16;
const colorItemBorderLightMode = withAlpha(IOColorPalette.greyscale.black, 0.1);
const colorItemBorderDarkMode = withAlpha(IOColorPalette.greyscale.white, 0.25);

const colorPillBg = withAlpha(IOColorPalette.greyscale.black, 0.2);

const styles = StyleSheet.create({
  colorItemsWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginLeft: (colorItemGutter / 2) * -1,
    marginRight: (colorItemGutter / 2) * -1
  },
  colorWrapperBothModes: {
    width: "50%",
    paddingHorizontal: colorItemGutter / 2,
    paddingTop: 16,
    paddingBottom: 12
  },
  colorWrapper: {
    justifyContent: "flex-start"
  },
  smallCapsTitle: {
    fontSize: 10,
    textAlign: "right",
    textTransform: "uppercase",
    marginBottom: 12
  },
  smallCapsLightMode: {
    color: IOColorPalette.greyscale[700]
  },
  smallCapsDarkMode: {
    color: IOColorPalette.greyscale[450]
  },
  colorModeWrapper: {
    position: "absolute",
    height: "100%",
    width: Dimensions.get("window").width / 2,
    borderCurve: "continuous"
  },
  darkModeWrapper: {
    right: 0,
    marginRight: IODimensions.padding.screen.default * -1,
    marginLeft: IODimensions.padding.screen.default * -1,
    backgroundColor: IOColorPalette.greyscale.black,
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24
  },
  lightModeWrapper: {
    left: 0,
    marginRight: IODimensions.padding.screen.default * -1,
    marginLeft: IODimensions.padding.screen.default * -1,
    backgroundColor: IOColorPalette.greyscale.white,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24
  },
  colorItem: {
    width: "100%",
    padding: colorItemPadding,
    borderRadius: 4,
    alignItems: "flex-end",
    borderWidth: 1
  },
  colorItemLightMode: {
    borderColor: colorItemBorderLightMode
  },
  colorItemDarkMode: {
    borderColor: colorItemBorderDarkMode
  },
  colorPill: {
    overflow: "hidden",
    color: IOColorPalette.greyscale.white,
    fontSize: 9,
    backgroundColor: colorPillBg,
    padding: 4,
    borderRadius: 4
  }
});

type ColorThemeGroupProps = {
  colorObjectDarkMode: Record<string, string>;
  colorObjectLightMode: Record<string, string>;
  name: string;
};

const ColorThemeGroup = ({
  name,
  colorObjectLightMode,
  colorObjectDarkMode
}: ColorThemeGroupProps) => {
  const colorArrayLightMode = Object.entries(colorObjectLightMode);
  const colorArrayDarkMode = Object.entries(colorObjectDarkMode);

  const colorBoxMargin = 16;

  return (
    <VStack space={sectionTitleMargin}>
      {name && <H6>{name}</H6>}
      {/* Show the two different columns
      with both light and dark modes */}
      <View style={{ flexDirection: "row" }}>
        <View style={[styles.colorModeWrapper, styles.darkModeWrapper]} />
        <View style={[styles.colorModeWrapper, styles.lightModeWrapper]} />
        <View style={styles.colorItemsWrapper}>
          <View style={styles.colorWrapperBothModes}>
            <SmallCapsTitle title="Light mode" />
            <VStack space={colorBoxMargin}>
              {Object.entries(colorObjectLightMode).map(
                ([colorName, colorValue], i) => {
                  const [, darkModeColorValue] = colorArrayDarkMode[i];
                  const lightModeColorValue = colorValue;
                  const isSameColorValue =
                    lightModeColorValue === darkModeColorValue;
                  return (
                    <View
                      key={`${colorName}-lightMode`}
                      style={
                        isSameColorValue && {
                          width:
                            Dimensions.get("window").width -
                            IODimensions.padding.screen.default -
                            colorItemGutter +
                            colorItemPadding
                        }
                      }
                    >
                      <ColorBox
                        color={colorValue}
                        isThemeColor
                        mode={"light"}
                        name={colorName}
                        themeVariable
                      />
                    </View>
                  );
                }
              )}
            </VStack>
          </View>
          <View style={styles.colorWrapperBothModes}>
            <SmallCapsTitle darkMode title="Dark mode" />
            <VStack space={colorBoxMargin}>
              {Object.entries(colorObjectDarkMode).map(
                ([colorName, colorValue], i) => {
                  const [, lightModeColorValue] = colorArrayLightMode[i];
                  const darkModeColorValue = colorValue;
                  const isSameColorValue =
                    lightModeColorValue === darkModeColorValue;

                  return (
                    <ColorBox
                      color={colorValue}
                      ghostMode={isSameColorValue}
                      isThemeColor
                      key={`${colorName}-darkMode`}
                      mode="dark"
                      name={colorName}
                      themeVariable
                    />
                  );
                }
              )}
            </VStack>
          </View>
        </View>
      </View>
    </VStack>
  );
};

type ColorGroupProps = {
  colorObject: Record<string, ColorValue>;
  name: string;
};

const ColorGroup = ({ name, colorObject }: ColorGroupProps) => (
  <VStack space={sectionTitleMargin}>
    {name && <H6>{name}</H6>}

    <VStack space={colorItemMargin}>
      {Object.entries(colorObject).map(([colorName, colorValue]) => (
        <ColorBox color={colorValue} key={colorName} name={colorName} />
      ))}
    </VStack>
  </VStack>
);

export const DSColors = () => (
  <DesignSystemScreen title={"Colors"}>
    <VStack space={macroSectionMargin}>
      {/* COLOR SCALES */}
      <VStack space={sectionTitleMargin}>
        <H3>Color scales</H3>

        <VStack space={32}>
          {/* Neutrals */}
          <ColorGroup colorObject={IOColorsNeutral} name="Neutrals" />
          {/* Tints */}
          <ColorGroup colorObject={IOColorsTints} name="Main tints" />
          {/* Status */}
          <ColorGroup colorObject={IOColorsStatus} name="Status" />
          {/* Extra */}
          <ColorGroup colorObject={IOColorsExtra} name="Extra" />
        </VStack>
      </VStack>

      {/* THEME */}
      <VStack space={sectionTitleMargin}>
        <H3>Theme</H3>

        <VStack space={40}>
          <ColorThemeGroup
            colorObjectDarkMode={IOThemeDark}
            colorObjectLightMode={IOThemeLight}
            name="Main"
          />
          <ColorThemeGroup
            colorObjectDarkMode={themeStatusColorsDarkMode}
            colorObjectLightMode={themeStatusColorsLightMode}
            name="Status"
          />
        </VStack>
      </VStack>
    </VStack>
  </DesignSystemScreen>
);

type ColorBoxProps = {
  color: ColorValue;
  ghostMode?: boolean;
  isThemeColor?: boolean;
  mode?: "dark" | "light";
  name: string;
  themeVariable?: boolean;
};

const ColorBox = ({
  name,
  color,
  isThemeColor = false,
  mode = "light",
  ghostMode,
  themeVariable
}: ColorBoxProps) => {
  const colors = useIOColors();

  return (
    <View style={[styles.colorWrapper, ghostMode && { opacity: 0 }]}>
      <View
        style={[
          styles.colorItem,
          mode === "dark"
            ? styles.colorItemDarkMode
            : styles.colorItemLightMode,
          themeVariable
            ? { backgroundColor: IOColorsLegacy[color as IOColorsLegacy] }
            : { backgroundColor: color }
        ]}
      >
        <Text style={styles.colorPill}>{color as string}</Text>
      </View>

      {name && (
        <Text
          numberOfLines={1}
          style={{
            marginTop: 4,
            fontSize: 10,
            color: isThemeColor
              ? mode === "dark"
                ? IOColorPalette.greyscale[450]
                : IOColorPalette.greyscale[700]
              : colors.text.content.tertiary
          }}
        >
          {name}
        </Text>
      )}
    </View>
  );
};

type SmallCapsTitleProps = {
  darkMode?: boolean;
  title: string;
};

const SmallCapsTitle = ({ title, darkMode }: SmallCapsTitleProps) => (
  <Text
    style={[
      styles.smallCapsTitle,
      darkMode ? styles.smallCapsDarkMode : styles.smallCapsLightMode
    ]}
  >
    {title}
  </Text>
);
