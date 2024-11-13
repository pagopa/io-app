import {
  H3,
  H6,
  IOColorGradients,
  IOColors,
  IOColorsExtra,
  IOColorsLegacy,
  IOColorsNeutral,
  IOColorsStatus,
  IOColorsTints,
  IOThemeDark,
  IOThemeLight,
  LabelSmall,
  VStack,
  hexToRgba,
  themeStatusColorsDarkMode,
  themeStatusColorsLightMode,
  useIOTheme
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { ColorValue, Dimensions, StyleSheet, Text, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import themeVariables from "../../../theme/variables";
import { DesignSystemScreen } from "../components/DesignSystemScreen";

const macroSectionMargin = 48;
const gradientItemGutter = 16;
const sectionTitleMargin = 16;
const colorItemGutter = 32;
const colorItemPadding = 8;
const colorItemMargin = 16;
const colorItemBorderLightMode = hexToRgba(IOColors.black, 0.1);
const colorItemBorderDarkMode = hexToRgba(IOColors.white, 0.25);

const colorPillBg = hexToRgba(IOColors.black, 0.2);

const styles = StyleSheet.create({
  gradientItemsWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginLeft: (gradientItemGutter / 2) * -1,
    marginRight: (gradientItemGutter / 2) * -1
  },
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
    color: IOColors.bluegrey
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
    marginRight: themeVariables.contentPadding * -1,
    marginLeft: themeVariables.contentPadding * -1,
    backgroundColor: IOColors.black,
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24
  },
  lightModeWrapper: {
    left: 0,
    marginRight: themeVariables.contentPadding * -1,
    marginLeft: themeVariables.contentPadding * -1,
    backgroundColor: IOColors.white,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24
  },
  gradientWrapper: {
    width: "50%",
    justifyContent: "flex-start",
    paddingHorizontal: gradientItemGutter / 2,
    marginBottom: 16
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
  gradientItem: {
    aspectRatio: 2 / 1,
    borderRadius: 8,
    padding: 12,
    alignItems: "flex-end",
    justifyContent: "space-between",
    borderColor: colorItemBorderLightMode,
    borderWidth: 1
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
  name: string;
  colorObjectLightMode: Record<string, string>;
  colorObjectDarkMode: Record<string, string>;
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
      <View style={IOStyles.row}>
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
                            themeVariables.contentPadding -
                            colorItemGutter +
                            colorItemPadding
                        }
                      }
                    >
                      <ColorBox
                        isThemeColor
                        mode={"light"}
                        name={name}
                        color={colorValue}
                        themeVariable
                      />
                    </View>
                  );
                }
              )}
            </VStack>
          </View>
          <View style={styles.colorWrapperBothModes}>
            <SmallCapsTitle title="Dark mode" darkMode />
            <VStack space={colorBoxMargin}>
              {Object.entries(colorObjectDarkMode).map(
                ([name, colorValue], i) => {
                  const [, lightModeColorValue] = colorArrayLightMode[i];
                  const darkModeColorValue = colorValue;
                  const isSameColorValue =
                    lightModeColorValue === darkModeColorValue;

                  return (
                    <ColorBox
                      isThemeColor
                      mode="dark"
                      key={`${name}-darkMode`}
                      name={name}
                      color={colorValue}
                      ghostMode={isSameColorValue}
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
  name: string;
  colorObject: Record<string, ColorValue>;
};

const ColorGroup = ({ name, colorObject }: ColorGroupProps) => {
  const theme = useIOTheme();

  return (
    <VStack space={sectionTitleMargin}>
      {name && <H6 color={theme["textHeading-default"]}>{name}</H6>}

      <VStack space={colorItemMargin}>
        {Object.entries(colorObject).map(([name, colorValue]) => (
          <ColorBox key={name} name={name} color={colorValue} />
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
            <ColorGroup name="Neutrals" colorObject={IOColorsNeutral} />
            {/* Tints */}
            <ColorGroup name="Main tints" colorObject={IOColorsTints} />
            {/* Status */}
            <ColorGroup name="Status" colorObject={IOColorsStatus} />
            {/* Extra */}
            <ColorGroup name="Extra" colorObject={IOColorsExtra} />
          </VStack>
        </VStack>

        {/* THEME */}
        <VStack space={sectionTitleMargin}>
          <H3 color={theme["textHeading-default"]}>Theme</H3>

          <VStack space={40}>
            <ColorThemeGroup
              name="Main"
              colorObjectLightMode={IOThemeLight}
              colorObjectDarkMode={IOThemeDark}
            />
            <ColorThemeGroup
              name="Status"
              colorObjectLightMode={themeStatusColorsLightMode}
              colorObjectDarkMode={themeStatusColorsDarkMode}
            />
          </VStack>
        </VStack>

        {/* GRADIENTS */}
        <VStack space={sectionTitleMargin}>
          <H3 color={theme["textHeading-default"]}>Gradients</H3>

          <View style={styles.gradientItemsWrapper}>
            {Object.entries(IOColorGradients).map(([name, colorValues]) => (
              <GradientBox key={name} name={name} colors={colorValues} />
            ))}
          </View>
        </VStack>

        {/* LEGACY */}
        <VStack space={sectionTitleMargin}>
          <View>
            <H3 color={theme["textHeading-default"]}>Legacy palette (†2023)</H3>
            <LabelSmall weight={"Regular"} color={theme["textBody-tertiary"]}>
              Not moved to the &ldquo;Legacy&rdquo; category yet, because
              it&apos;s currently used everywhere
            </LabelSmall>
          </View>

          <VStack space={colorItemMargin}>
            {Object.entries(IOColorsLegacy).map(([name, colorValue]) => (
              <ColorBox key={name} name={name} color={colorValue} />
            ))}
          </VStack>
        </VStack>
      </VStack>
    </DesignSystemScreen>
  );
};

type ColorBoxProps = {
  name: string;
  color: ColorValue;
  isThemeColor?: boolean;
  mode?: "light" | "dark";
  ghostMode?: boolean;
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
          style={{
            marginTop: 4,
            fontSize: 10,
            color: isThemeColor
              ? mode === "dark"
                ? IOColors["grey-450"]
                : IOColors["grey-700"]
              : IOColors[theme["textBody-tertiary"]]
          }}
          numberOfLines={1}
        >
          {name}
        </Text>
      )}
    </View>
  );
};

type GradientBoxProps = {
  name: string;
  colors: Array<string>;
};

const GradientBox = ({ name, colors }: GradientBoxProps) => {
  const theme = useIOTheme();
  const [first, last] = colors;

  return (
    <View style={styles.gradientWrapper}>
      <LinearGradient
        colors={colors}
        useAngle={true}
        angle={180}
        style={styles.gradientItem}
      >
        {first && <Text style={styles.colorPill}>{first}</Text>}
        {last && <Text style={styles.colorPill}>{last}</Text>}
      </LinearGradient>
      {name && (
        <Text
          style={{
            marginTop: 4,
            fontSize: 10,
            color: IOColors[theme["textBody-tertiary"]]
          }}
        >
          {name}
        </Text>
      )}
    </View>
  );
};

type SmallCapsTitleProps = {
  title: string;
  darkMode?: boolean;
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
