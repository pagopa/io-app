import {
  H3,
  H6,
  hexToRgba,
  IOColors,
  IOColorsExtra,
  IOColorsNeutral,
  IOColorsStatus,
  IOColorsTints,
  IOThemeDark,
  IOThemeLight,
  IOVisualCostants,
  themeStatusColorsDarkMode,
  themeStatusColorsLightMode,
  useIOTheme,
  VStack
} from "@io-app/design-system";
import { ColorValue, Dimensions, StyleSheet, Text, View } from "react-native";

import { DesignSystemScreen } from "../components/DesignSystemScreen";

const macroSectionMargin = 48;
const sectionTitleMargin = 16;
const colorItemGutter = 32;
const colorItemPadding = 8;
const colorItemMargin = 16;
const colorItemBorderLightMode = hexToRgba(IOColors.black, 0.1);
const colorItemBorderDarkMode = hexToRgba(IOColors.white, 0.25);

const colorPillBg = hexToRgba(IOColors.black, 0.2);

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
    color: IOColors["grey-700"]
  },
  smallCapsDarkMode: {
    color: IOColors["grey-450"]
  },
  colorModeWrapper: {
    position: "absolute",
    height: "100%",
    width: Dimensions.get("window").width / 2,
    borderCurve: "continuous"
  },
  darkModeWrapper: {
    right: 0,
    marginRight: IOVisualCostants.appMarginDefault * -1,
    marginLeft: IOVisualCostants.appMarginDefault * -1,
    backgroundColor: IOColors.black,
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24
  },
  lightModeWrapper: {
    left: 0,
    marginRight: IOVisualCostants.appMarginDefault * -1,
    marginLeft: IOVisualCostants.appMarginDefault * -1,
    backgroundColor: IOColors.white,
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
    color: IOColors.white,
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
  const theme = useIOTheme();

  const colorArrayLightMode = Object.entries(colorObjectLightMode);
  const colorArrayDarkMode = Object.entries(colorObjectDarkMode);

  const colorBoxMargin = 16;

  return (
    <VStack space={sectionTitleMargin}>
      {name && <H6 color={theme["textHeading-default"]}>{name}</H6>}
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
                ([name, colorValue], i) => {
                  const [, darkModeColorValue] = colorArrayDarkMode[i];
                  const lightModeColorValue = colorValue;
                  const isSameColorValue =
                    lightModeColorValue === darkModeColorValue;
                  return (
                    <View
                      key={`${name}-lightMode`}
                      style={
                        isSameColorValue && {
                          width:
                            Dimensions.get("window").width -
                            IOVisualCostants.appMarginDefault -
                            colorItemGutter +
                            colorItemPadding
                        }
                      }
                    >
                      <ColorBox
                        color={colorValue}
                        isThemeColor
                        mode={"light"}
                        name={name}
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
                ([name, colorValue], i) => {
                  const [, lightModeColorValue] = colorArrayLightMode[i];
                  const darkModeColorValue = colorValue;
                  const isSameColorValue =
                    lightModeColorValue === darkModeColorValue;

                  return (
                    <ColorBox
                      color={colorValue}
                      ghostMode={isSameColorValue}
                      isThemeColor
                      key={`${name}-darkMode`}
                      mode="dark"
                      name={name}
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

const ColorGroup = ({ name, colorObject }: ColorGroupProps) => {
  const theme = useIOTheme();

  return (
    <VStack space={sectionTitleMargin}>
      {name && <H6 color={theme["textHeading-default"]}>{name}</H6>}

      <VStack space={colorItemMargin}>
        {Object.entries(colorObject).map(([name, colorValue]) => (
          <ColorBox color={colorValue} key={name} name={name} />
        ))}
      </VStack>
    </VStack>
  );
};

export const DSColors = () => {
  const theme = useIOTheme();

  return (
    <DesignSystemScreen title={"Colors"}>
      <VStack space={macroSectionMargin}>
        {/* COLOR SCALES */}
        <VStack space={sectionTitleMargin}>
          <H3 color={theme["textHeading-default"]}>Color scales</H3>

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
          <H3 color={theme["textHeading-default"]}>Theme</H3>

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
};

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
  const theme = useIOTheme();

  return (
    <View style={[styles.colorWrapper, ghostMode && { opacity: 0 }]}>
      <View
        style={[
          styles.colorItem,
          mode === "dark"
            ? styles.colorItemDarkMode
            : styles.colorItemLightMode,
          themeVariable
            ? { backgroundColor: IOColors[color as IOColors] }
            : { backgroundColor: color }
        ]}
      >
        {color && <Text style={styles.colorPill}>{color as string}</Text>}
      </View>

      {name && (
        <Text
          numberOfLines={1}
          style={{
            marginTop: 4,
            fontSize: 10,
            color: isThemeColor
              ? mode === "dark"
                ? IOColors["grey-450"]
                : IOColors["grey-700"]
              : IOColors[theme["textBody-tertiary"]]
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
