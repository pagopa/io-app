import {
  H2,
  H3,
  H4,
  hexToRgba,
  HStack,
  IconButton,
  IconButtonSolid,
  IOButton,
  IOButtonColor,
  IOButtonVariant,
  IOColors,
  IOIcons,
  ListItemSwitch,
  useIOTheme,
  VSpacer,
  VStack
} from "@io-app/design-system";
import { Fragment, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";

import { DesignSystemScreen } from "../components/DesignSystemScreen";
import { DSComponentViewerBox } from "../components/DSComponentViewerBox";

const styles = StyleSheet.create({
  primaryBlock: {
    backgroundColor: IOColors["blueIO-500"],
    padding: 16,
    borderRadius: 16
  },
  neutralBlock: {
    borderWidth: 1,
    borderColor: hexToRgba(IOColors.black, 0.1),
    backgroundColor: IOColors.white,
    padding: 16,
    borderRadius: 16
  }
});

const onButtonPress = () => {
  Alert.alert("Alert", "Action triggered");
};

const buttonColors: Array<IOButtonColor> = ["primary", "danger", "contrast"];

const buttonVariants: Array<Extract<IOButtonVariant, "outline" | "solid">> = [
  "solid",
  "outline"
];

const colorsIconMap: Record<IOButtonColor, IOIcons> = {
  primary: "qrCode",
  danger: "trashcan",
  contrast: "add"
};

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

const sectionTitleMargin = 16;
const sectionMargin = 48;
const buttonBlockMargin = 24;
const buttonBlockMarginLoose = 40;
const buttonBlockInnerSpacing = 12;

export const DSButtons = () => {
  const theme = useIOTheme();

  return (
    <DesignSystemScreen title={"Buttons"}>
      <VStack space={sectionMargin}>
        <VStack space={sectionTitleMargin}>
          <H2 color={theme["textHeading-default"]}>IOButton</H2>
          {renderSolidOutlineButton()}
          <VSpacer size={buttonBlockMargin} />
          {renderLinkButton()}
        </VStack>

        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>IconButton</H4>
          {renderIconButton()}
        </VStack>

        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>IconButtonSolid</H4>
          {renderIconButtonSolid()}
        </VStack>
      </VStack>
    </DesignSystemScreen>
  );
};

const renderSolidOutlineButton = () => (
  <VStack space={sectionMargin}>
    {buttonVariants.map(variant => (
      <View key={`${variant}-variant`}>
        <H3 style={{ marginBottom: 16 }}>{capitalize(variant)} variant</H3>

        <VStack space={buttonBlockMarginLoose}>
          {buttonColors.map((color, index) => {
            const isContrast = color === "contrast";

            const buttonLabel = `${capitalize(variant)} button`;
            const titleComponentViewerBox = `IOButton · ${capitalize(
              variant
            )} variant, ${color} color`;

            return (
              <Fragment key={`${color}-solid-variant-${index}`}>
                <View style={isContrast ? styles.primaryBlock : {}}>
                  <VStack space={buttonBlockMargin}>
                    <DSComponentViewerBox
                      colorMode={isContrast ? "dark" : undefined}
                      name={titleComponentViewerBox}
                    >
                      <VStack
                        space={buttonBlockInnerSpacing}
                        style={{ alignItems: "flex-start" }}
                      >
                        <IOButton
                          accessibilityHint="Tap to trigger test alert"
                          color={color}
                          label={buttonLabel}
                          onPress={onButtonPress}
                          variant={variant}
                        />
                        <IOButton
                          accessibilityHint="Tap to trigger test alert"
                          color={color}
                          icon={colorsIconMap[color]}
                          label={buttonLabel}
                          onPress={onButtonPress}
                          variant={variant}
                        />
                        <IOButton
                          accessibilityHint="Tap to trigger test alert"
                          color={color}
                          icon={colorsIconMap[color]}
                          iconPosition="end"
                          label={buttonLabel}
                          onPress={onButtonPress}
                          variant={variant}
                        />
                        <View style={{ alignSelf: "center" }}>
                          <IOButton
                            accessibilityHint="Tap to trigger test alert"
                            color={color}
                            label={`${buttonLabel} (centered)`}
                            onPress={onButtonPress}
                            variant={variant}
                          />
                        </View>
                      </VStack>
                    </DSComponentViewerBox>
                    <DSComponentViewerBox
                      colorMode={isContrast ? "dark" : undefined}
                      name={`${titleComponentViewerBox}, full width`}
                    >
                      {/* Let's force `alignItems: "flex-start"` to
                      test if `fullWidth`is managed correctly */}
                      <IOButton
                        accessibilityHint="Tap to trigger test alert"
                        color={color}
                        fullWidth
                        label={`${buttonLabel} (full width)`}
                        onPress={onButtonPress}
                        variant={variant}
                      />
                    </DSComponentViewerBox>
                    <DSComponentViewerBox
                      colorMode={isContrast ? "dark" : undefined}
                      name={`${titleComponentViewerBox}, loading state`}
                    >
                      {isContrast ? (
                        <IOButton
                          accessibilityHint="Tap to trigger test alert"
                          color="contrast"
                          fullWidth
                          label={`${buttonLabel} (loading state)`}
                          loading
                          onPress={onButtonPress}
                          variant={variant}
                        />
                      ) : (
                        <LoadingButtonExample color={color} variant={variant} />
                      )}
                    </DSComponentViewerBox>
                    <DSComponentViewerBox
                      colorMode={isContrast ? "dark" : undefined}
                      name={`${titleComponentViewerBox}, disabled`}
                    >
                      <VStack
                        space={buttonBlockInnerSpacing}
                        style={{ alignItems: "flex-start" }}
                      >
                        <IOButton
                          accessibilityHint="Tap to trigger test alert"
                          color={color}
                          disabled
                          label={`${buttonLabel} (disabled)`}
                          onPress={onButtonPress}
                          variant={variant}
                        />
                        <IOButton
                          accessibilityHint="Tap to trigger test alert"
                          color={color}
                          disabled
                          icon={colorsIconMap[color]}
                          label={`${buttonLabel} (disabled)`}
                          onPress={onButtonPress}
                          variant={variant}
                        />
                      </VStack>
                    </DSComponentViewerBox>
                  </VStack>
                </View>
              </Fragment>
            );
          })}
        </VStack>
      </View>
    ))}
  </VStack>
);

const LoadingButtonExample = ({
  variant,
  color
}: {
  color: IOButtonColor;
  variant: Extract<IOButtonVariant, "outline" | "solid">;
}) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  return (
    <>
      <IOButton
        accessibilityHint="Tap to trigger test alert"
        color={color}
        fullWidth
        label={`${capitalize(variant)} button, loading state`}
        loading={isEnabled}
        onPress={() => setIsEnabled(true)}
        variant={variant}
      />
      <ListItemSwitch
        label="Abilita lo stato di caricamento"
        onSwitchValueChange={toggleSwitch}
        value={isEnabled}
      />
    </>
  );
};

const renderLinkButton = () => (
  <VStack space={sectionMargin}>
    <View>
      <H3 style={{ marginBottom: 16 }}>Link variant</H3>

      <VStack space={buttonBlockMarginLoose}>
        {buttonColors.map((color, index) => {
          const isContrast = color === "contrast";

          return (
            <Fragment key={`${color}-link-variant-${index}`}>
              <View style={isContrast ? styles.primaryBlock : {}}>
                <VStack space={buttonBlockMargin}>
                  <DSComponentViewerBox
                    colorMode={isContrast ? "dark" : undefined}
                    name={`IOButton · Link variant, ${color} color`}
                  >
                    <VStack space={buttonBlockInnerSpacing}>
                      <IOButton
                        accessibilityHint="Tap to trigger test alert"
                        color={color}
                        label={"Link button"}
                        onPress={onButtonPress}
                        variant="link"
                      />
                      <IOButton
                        accessibilityHint="Tap to trigger test alert"
                        color={color}
                        icon="starEmpty"
                        label={"Link button"}
                        onPress={onButtonPress}
                        variant="link"
                      />
                      <IOButton
                        accessibilityHint="Tap to trigger test alert"
                        color={color}
                        icon="starEmpty"
                        iconPosition="end"
                        label={"Link button"}
                        onPress={onButtonPress}
                        variant="link"
                      />
                      <View style={{ alignSelf: "center" }}>
                        <IOButton
                          accessibilityHint="Tap to trigger test alert"
                          color={color}
                          label={"Link button (centered)"}
                          onPress={onButtonPress}
                          variant="link"
                        />
                      </View>
                    </VStack>
                  </DSComponentViewerBox>
                  <DSComponentViewerBox
                    colorMode={isContrast ? "dark" : undefined}
                    name="IOButton · Link variant, stress test"
                  >
                    <View style={{ alignSelf: "center" }}>
                      <IOButton
                        accessibilityHint="Tap to trigger test alert"
                        color={color}
                        label={
                          "Link button (centered) with a very long loooooong text"
                        }
                        /* Don't set limits on maximum number of lines */
                        numberOfLines={0}
                        onPress={onButtonPress}
                        textAlign="center"
                        variant="link"
                      />
                    </View>
                  </DSComponentViewerBox>
                  <DSComponentViewerBox
                    colorMode={isContrast ? "dark" : undefined}
                    name={`IOButton · Link variant, ${color} color, disabled`}
                  >
                    <VStack space={buttonBlockInnerSpacing}>
                      <IOButton
                        accessibilityHint="Tap to trigger test alert"
                        color={color}
                        disabled
                        label={"Link button (disabled)"}
                        onPress={onButtonPress}
                        variant="link"
                      />
                      <IOButton
                        accessibilityHint="Tap to trigger test alert"
                        color={color}
                        disabled
                        icon="starEmpty"
                        iconPosition="end"
                        label={"Link button (disabled)"}
                        onPress={onButtonPress}
                        variant="link"
                      />
                    </VStack>
                  </DSComponentViewerBox>
                </VStack>
              </View>
            </Fragment>
          );
        })}
      </VStack>
    </View>
  </VStack>
);

const renderIconButton = () => (
  <VStack space={buttonBlockMargin}>
    <DSComponentViewerBox name="IconButton · Primary variant">
      <HStack space={buttonBlockInnerSpacing}>
        <IconButton
          accessibilityLabel="Tap to trigger test alert"
          icon="search"
          onPress={onButtonPress}
        />

        <IconButton
          accessibilityLabel="Tap to trigger test alert"
          icon="help"
          onPress={onButtonPress}
        />

        <IconButton
          accessibilityLabel="Tap to trigger test alert"
          disabled
          icon="help"
          onPress={onButtonPress}
        />
      </HStack>
    </DSComponentViewerBox>
    <DSComponentViewerBox name="IconButton · Neutral variant">
      <HStack space={buttonBlockInnerSpacing}>
        <IconButton
          accessibilityLabel="Tap to trigger test alert"
          color="neutral"
          icon="search"
          onPress={onButtonPress}
        />

        <IconButton
          accessibilityLabel="Tap to trigger test alert"
          color="neutral"
          icon="help"
          onPress={onButtonPress}
        />

        <IconButton
          accessibilityLabel="Tap to trigger test alert"
          color="neutral"
          disabled
          icon="help"
          onPress={onButtonPress}
        />
      </HStack>
    </DSComponentViewerBox>
    <View style={styles.primaryBlock}>
      <DSComponentViewerBox
        colorMode="dark"
        name="IconButton · Contrast variant"
      >
        <HStack space={buttonBlockInnerSpacing}>
          <IconButton
            accessibilityLabel="Tap to trigger test alert"
            color="contrast"
            icon="search"
            onPress={onButtonPress}
          />

          <IconButton
            accessibilityLabel="Tap to trigger test alert"
            color="contrast"
            icon="help"
            onPress={onButtonPress}
          />

          <IconButton
            accessibilityLabel="Tap to trigger test alert"
            color="contrast"
            disabled
            icon="help"
            onPress={onButtonPress}
          />
        </HStack>
      </DSComponentViewerBox>
    </View>

    <DSComponentViewerBox name="IconButton · Neutral variant, persistent color mode">
      <View style={styles.neutralBlock}>
        <HStack space={buttonBlockInnerSpacing}>
          <IconButton
            accessibilityHint="Tap to trigger test alert"
            accessibilityLabel="Search"
            color="neutral"
            icon="search"
            onPress={onButtonPress}
            persistentColorMode
          />

          <IconButton
            accessibilityHint="Tap to trigger test alert"
            accessibilityLabel="Help"
            color="neutral"
            icon="help"
            onPress={onButtonPress}
            persistentColorMode
          />

          <IconButton
            accessibilityHint="Tap to trigger test alert"
            accessibilityLabel="Help"
            color="neutral"
            disabled
            icon="help"
            onPress={onButtonPress}
            persistentColorMode
          />
        </HStack>
      </View>
    </DSComponentViewerBox>
  </VStack>
);

const renderIconButtonSolid = () => (
  <VStack space={buttonBlockMargin}>
    <DSComponentViewerBox name="IconButtonSolid · Primary variant, large">
      <HStack space={buttonBlockInnerSpacing}>
        <IconButtonSolid
          accessibilityLabel="Tap to trigger test alert"
          color="primary"
          icon="arrowBottom"
          onPress={onButtonPress}
        />

        <IconButtonSolid
          accessibilityLabel="Tap to trigger test alert"
          color="primary"
          disabled
          icon="arrowBottom"
          onPress={onButtonPress}
        />
      </HStack>
    </DSComponentViewerBox>
    <View style={styles.primaryBlock}>
      <DSComponentViewerBox
        colorMode="dark"
        name="IconButtonSolid · Contrast variant, large"
      >
        <HStack space={buttonBlockInnerSpacing}>
          <IconButtonSolid
            accessibilityLabel="Tap to trigger test alert"
            color="contrast"
            icon="arrowBottom"
            onPress={onButtonPress}
          />

          <IconButtonSolid
            accessibilityLabel="Tap to trigger test alert"
            color="contrast"
            disabled
            icon="arrowBottom"
            onPress={onButtonPress}
          />
        </HStack>
      </DSComponentViewerBox>
    </View>
  </VStack>
);
