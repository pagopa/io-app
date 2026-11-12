import {
  H3,
  H6,
  IOColorMode,
  IOColorPalette,
  IOColors,
  IODimensions,
  IOOpacity,
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

type Token = { path: string; value: string };

/* `{ action: { primary: { default: "#…" } } }` → `action.primary.default` */
const flattenTokens = (tokens: object, parent = ""): Array<Token> =>
  Object.entries(tokens).flatMap(([key, value]) => {
    const path = parent ? `${parent}.${key}` : key;
    return typeof value === "string"
      ? [{ path, value }]
      : flattenTokens(value as object, path);
  });

/* As components draw them: disabled ones faded, `onAccent` and `action.inverse` ones on `background.accent` */
const tokenRendering = (path: string) => ({
  faded: path.endsWith(".disabled"),
  onAccent:
    path.split(".").includes("onAccent") || path.startsWith("action.inverse.")
});

/* Semantic groups of a mode, without the component tier */
const semanticGroups = (mode: IOColorMode) =>
  Object.entries(IOColors[mode]).filter(([group]) => group !== "component");

const paletteNames = new Map(
  Object.entries(IOColorPalette).flatMap(([hue, steps]) =>
    Object.entries(steps).map(([step, hex]) => [
      String(hex).toUpperCase(),
      `${hue} ${step}`
    ])
  )
);

const toHex = (channel: string) =>
  Number(channel).toString(16).padStart(2, "0").toUpperCase();

/* The palette color behind a token value: `blueIO 200`, or `blueIO 200 · 20%` with alpha */
const paletteReference = (value: string) => {
  const rgba = /^rgba\((\d+),(\d+),(\d+),([\d.]+)\)$/.exec(value);
  const hex = rgba
    ? `#${rgba.slice(1, 4).map(toHex).join("")}`
    : value.toUpperCase();
  const name = paletteNames.get(hex);
  if (name === undefined) {
    return value;
  }
  return rgba ? `${name} · ${Math.round(Number(rgba[4]) * 100)}%` : name;
};

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
  accentBackdrop: {
    padding: 4,
    borderRadius: 8,
    borderCurve: "continuous"
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
  name: string;
  tokensDarkMode: object;
  tokensLightMode: object;
};

const ColorThemeGroup = ({
  name,
  tokensLightMode,
  tokensDarkMode
}: ColorThemeGroupProps) => {
  const tokensLight = flattenTokens(tokensLightMode);
  /* `dark` defines every token of `light`: match them by path */
  const valuesDark = new Map(
    flattenTokens(tokensDarkMode).map(({ path, value }) => [path, value])
  );

  const colorBoxMargin = 16;

  return (
    <VStack space={sectionTitleMargin}>
      <H6>{name}</H6>
      {/* Show the two different columns
      with both light and dark modes */}
      <View style={{ flexDirection: "row" }}>
        <View style={[styles.colorModeWrapper, styles.darkModeWrapper]} />
        <View style={[styles.colorModeWrapper, styles.lightModeWrapper]} />
        <View style={styles.colorItemsWrapper}>
          <View style={styles.colorWrapperBothModes}>
            <SmallCapsTitle title="Light mode" />
            <VStack space={colorBoxMargin}>
              {tokensLight.map(({ path, value }) => {
                const isSameColorValue = value === valuesDark.get(path);
                return (
                  <View
                    key={`${path}-lightMode`}
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
                      color={value}
                      isThemeColor
                      label={paletteReference(value)}
                      mode="light"
                      name={path}
                      {...tokenRendering(path)}
                    />
                  </View>
                );
              })}
            </VStack>
          </View>
          <View style={styles.colorWrapperBothModes}>
            <SmallCapsTitle darkMode title="Dark mode" />
            <VStack space={colorBoxMargin}>
              {tokensLight.map(({ path, value }) => {
                const darkModeColorValue = valuesDark.get(path) ?? value;
                return (
                  <View key={`${path}-darkMode`}>
                    <ColorBox
                      color={darkModeColorValue}
                      ghostMode={darkModeColorValue === value}
                      isThemeColor
                      label={paletteReference(darkModeColorValue)}
                      mode="dark"
                      name={path}
                      {...tokenRendering(path)}
                    />
                  </View>
                );
              })}
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

/* `Object.entries` lists numeric keys first: `white` goes before the steps, `black` after */
const stepRank = (step: string) =>
  step === "white" ? -Infinity : step === "black" ? Infinity : Number(step);

const ColorGroup = ({ name, colorObject }: ColorGroupProps) => (
  <VStack space={sectionTitleMargin}>
    <H6>{name}</H6>

    <VStack space={colorItemMargin}>
      {Object.entries(colorObject)
        .sort(([a], [b]) => stepRank(a) - stepRank(b))
        .map(([colorName, colorValue]) => (
          <ColorBox color={colorValue} key={colorName} name={colorName} />
        ))}
    </VStack>
  </VStack>
);

export const DSColors = () => {
  const darkGroups = Object.fromEntries(semanticGroups("dark"));

  return (
    <DesignSystemScreen title={"Colors"}>
      <VStack space={macroSectionMargin}>
        {/* PALETTE */}
        <VStack space={sectionTitleMargin}>
          <H3>Palette</H3>

          <VStack space={32}>
            {Object.entries(IOColorPalette).map(([hue, steps]) => (
              <ColorGroup colorObject={steps} key={hue} name={hue} />
            ))}
          </VStack>
        </VStack>

        {/* SEMANTIC TOKENS */}
        <VStack space={sectionTitleMargin}>
          <H3>Semantic</H3>

          <VStack space={40}>
            {semanticGroups("light").map(([group, tokens]) => (
              <ColorThemeGroup
                key={group}
                name={group}
                tokensDarkMode={darkGroups[group]}
                tokensLightMode={tokens}
              />
            ))}
          </VStack>
        </VStack>
      </VStack>
    </DesignSystemScreen>
  );
};

type ColorBoxProps = {
  color: ColorValue;
  /* Drawn at the disabled opacity */
  faded?: boolean;
  ghostMode?: boolean;
  isThemeColor?: boolean;
  /* Text of the pill: the color value by default */
  label?: string;
  mode?: "dark" | "light";
  name: string;
  /* Drawn on `background.accent` */
  onAccent?: boolean;
};

const ColorBox = ({
  name,
  color,
  isThemeColor = false,
  label = String(color),
  mode = "light",
  ghostMode,
  faded = false,
  onAccent = false
}: ColorBoxProps) => {
  const colors = useIOColors();

  return (
    <View style={[styles.colorWrapper, ghostMode && { opacity: 0 }]}>
      <View
        style={
          onAccent && [
            styles.accentBackdrop,
            { backgroundColor: IOColors[mode].background.accent }
          ]
        }
      >
        <View
          style={[
            styles.colorItem,
            mode === "dark"
              ? styles.colorItemDarkMode
              : styles.colorItemLightMode,
            { backgroundColor: color },
            faded && { opacity: IOOpacity.disabled }
          ]}
        >
          <Text style={styles.colorPill}>{label}</Text>
        </View>
      </View>

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
