import {
  H2,
  H3,
  H4,
  HStack,
  IOButton,
  IOButtonColor,
  IOButtonVariant,
  IOColors,
  IOIcons,
  IconButton,
  IconButtonSolid,
  ListItemSwitch,
  VSpacer,
  VStack,
  hexToRgba,
  useIOTheme
} from "@pagopa/io-app-design-system";
import { Fragment, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { DSComponentViewerBox } from "../components/DSComponentViewerBox";
import { DesignSystemScreen } from "../components/DesignSystemScreen";

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

const buttonVariants: Array<Extract<IOButtonVariant, "solid" | "outline">> = [
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
                      name={titleComponentViewerBox}
                      colorMode={isContrast ? "dark" : undefined}
                    >
                      <VStack
                        space={buttonBlockInnerSpacing}
                        style={{ alignItems: "flex-start" }}
                      >
                        <IOButton
                          color={color}
                          variant={variant}
                          accessibilityHint="Tap to trigger test alert"
                          label={buttonLabel}
                          onPress={onButtonPress}
                        />
                        <IOButton
                          color={color}
                          variant={variant}
                          accessibilityHint="Tap to trigger test alert"
                          label={buttonLabel}
                          icon={colorsIconMap[color]}
                          onPress={onButtonPress}
                        />
                        <IOButton
                          color={color}
                          variant={variant}
                          accessibilityHint="Tap to trigger test alert"
                          label={buttonLabel}
                          icon={colorsIconMap[color]}
                          iconPosition="end"
                          onPress={onButtonPress}
                        />
                        <View style={{ alignSelf: "center" }}>
                          <IOButton
                            color={color}
                            variant={variant}
                            accessibilityHint="Tap to trigger test alert"
                            label={`${buttonLabel} (centered)`}
                            onPress={onButtonPress}
                          />
                        </View>
                      </VStack>
                    </DSComponentViewerBox>
                    <DSComponentViewerBox
                      name={`${titleComponentViewerBox}, full width`}
                      colorMode={isContrast ? "dark" : undefined}
                    >
                      {/* Let's force `alignItems: "flex-start"` to
                      test if `fullWidth`is managed correctly */}
                      <IOButton
                        color={color}
                        variant={variant}
                        fullWidth
                        accessibilityHint="Tap to trigger test alert"
                        label={`${buttonLabel} (full width)`}
                        onPress={onButtonPress}
                      />
                    </DSComponentViewerBox>
                    <DSComponentViewerBox
                      name={`${titleComponentViewerBox}, loading state`}
                      colorMode={isContrast ? "dark" : undefined}
                    >
                      {isContrast ? (
                        <IOButton
                          fullWidth
                          loading
                          variant={variant}
                          color="contrast"
                          label={`${buttonLabel} (loading state)`}
                          onPress={onButtonPress}
                          accessibilityHint="Tap to trigger test alert"
                        />
                      ) : (
                        <LoadingButtonExample variant={variant} color={color} />
                      )}
                    </DSComponentViewerBox>
                    <DSComponentViewerBox
                      name={`${titleComponentViewerBox}, disabled`}
                      colorMode={isContrast ? "dark" : undefined}
                    >
                      <VStack
                        space={buttonBlockInnerSpacing}
                        style={{ alignItems: "flex-start" }}
                      >
                        <IOButton
                          color={color}
                          variant={variant}
                          disabled
                          accessibilityHint="Tap to trigger test alert"
                          label={`${buttonLabel} (disabled)`}
                          onPress={onButtonPress}
                        />
                        <IOButton
                          color={color}
                          variant={variant}
                          disabled
                          accessibilityHint="Tap to trigger test alert"
                          label={`${buttonLabel} (disabled)`}
                          icon={colorsIconMap[color]}
                          onPress={onButtonPress}
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
  variant: Extract<IOButtonVariant, "solid" | "outline">;
  color: IOButtonColor;
}) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  return (
    <>
      <IOButton
        variant={variant}
        color={color}
        fullWidth
        loading={isEnabled}
        accessibilityHint="Tap to trigger test alert"
        label={`${capitalize(variant)} button, loading state`}
        onPress={() => setIsEnabled(true)}
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
                    name={`IOButton · Link variant, ${color} color`}
                    colorMode={isContrast ? "dark" : undefined}
                  >
                    <VStack space={buttonBlockInnerSpacing}>
                      <IOButton
                        color={color}
                        variant="link"
                        accessibilityHint="Tap to trigger test alert"
                        label={"Link button"}
                        onPress={onButtonPress}
                      />
                      <IOButton
                        color={color}
                        variant="link"
                        accessibilityHint="Tap to trigger test alert"
                        label={"Link button"}
                        icon="starEmpty"
                        onPress={onButtonPress}
                      />
                      <IOButton
                        color={color}
                        variant="link"
                        accessibilityHint="Tap to trigger test alert"
                        label={"Link button"}
                        icon="starEmpty"
                        iconPosition="end"
                        onPress={onButtonPress}
                      />
                      <View style={{ alignSelf: "center" }}>
                        <IOButton
                          color={color}
                          variant="link"
                          accessibilityHint="Tap to trigger test alert"
                          label={"Link button (centered)"}
                          onPress={onButtonPress}
                        />
                      </View>
                    </VStack>
                  </DSComponentViewerBox>
                  <DSComponentViewerBox
                    name="IOButton · Link variant, stress test"
                    colorMode={isContrast ? "dark" : undefined}
                  >
                    <View style={{ alignSelf: "center" }}>
                      <IOButton
                        color={color}
                        variant="link"
                        textAlign="center"
                        /* Don't set limits on maximum number of lines */
                        numberOfLines={0}
                        accessibilityHint="Tap to trigger test alert"
                        label={
                          "Link button (centered) with a very long loooooong text"
                        }
                        onPress={onButtonPress}
                      />
                    </View>
                  </DSComponentViewerBox>
                  <DSComponentViewerBox
                    name={`IOButton · Link variant, ${color} color, disabled`}
                    colorMode={isContrast ? "dark" : undefined}
                  >
                    <VStack space={buttonBlockInnerSpacing}>
                      <IOButton
                        color={color}
                        variant="link"
                        disabled
                        accessibilityHint="Tap to trigger test alert"
                        label={"Link button (disabled)"}
                        onPress={onButtonPress}
                      />
                      <IOButton
                        color={color}
                        variant="link"
                        disabled
                        accessibilityHint="Tap to trigger test alert"
                        label={"Link button (disabled)"}
                        icon="starEmpty"
                        iconPosition="end"
                        onPress={onButtonPress}
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
          icon="help"
          disabled
          onPress={onButtonPress}
        />
      </HStack>
    </DSComponentViewerBox>
    <DSComponentViewerBox name="IconButton · Neutral variant">
      <HStack space={buttonBlockInnerSpacing}>
        <IconButton
          color="neutral"
          accessibilityLabel="Tap to trigger test alert"
          icon="search"
          onPress={onButtonPress}
        />

        <IconButton
          color="neutral"
          accessibilityLabel="Tap to trigger test alert"
          icon="help"
          onPress={onButtonPress}
        />

        <IconButton
          color="neutral"
          accessibilityLabel="Tap to trigger test alert"
          icon="help"
          disabled
          onPress={onButtonPress}
        />
      </HStack>
    </DSComponentViewerBox>
    <View style={styles.primaryBlock}>
      <DSComponentViewerBox
        name="IconButton · Contrast variant"
        colorMode="dark"
      >
        <HStack space={buttonBlockInnerSpacing}>
          <IconButton
            color="contrast"
            accessibilityLabel="Tap to trigger test alert"
            icon="search"
            onPress={onButtonPress}
          />

          <IconButton
            color="contrast"
            accessibilityLabel="Tap to trigger test alert"
            icon="help"
            onPress={onButtonPress}
          />

          <IconButton
            color="contrast"
            accessibilityLabel="Tap to trigger test alert"
            icon="help"
            disabled
            onPress={onButtonPress}
          />
        </HStack>
      </DSComponentViewerBox>
    </View>

    <DSComponentViewerBox name="IconButton · Neutral variant, persistent color mode">
      <View style={styles.neutralBlock}>
        <HStack space={buttonBlockInnerSpacing}>
          <IconButton
            persistentColorMode
            color="neutral"
            accessibilityLabel="Search"
            accessibilityHint="Tap to trigger test alert"
            icon="search"
            onPress={onButtonPress}
          />

          <IconButton
            persistentColorMode
            color="neutral"
            accessibilityLabel="Help"
            accessibilityHint="Tap to trigger test alert"
            icon="help"
            onPress={onButtonPress}
          />

          <IconButton
            persistentColorMode
            color="neutral"
            accessibilityLabel="Help"
            accessibilityHint="Tap to trigger test alert"
            icon="help"
            disabled
            onPress={onButtonPress}
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
          color="primary"
          accessibilityLabel="Tap to trigger test alert"
          icon="arrowBottom"
          onPress={onButtonPress}
        />

        <IconButtonSolid
          color="primary"
          accessibilityLabel="Tap to trigger test alert"
          icon="arrowBottom"
          disabled
          onPress={onButtonPress}
        />
      </HStack>
    </DSComponentViewerBox>
    <View style={styles.primaryBlock}>
      <DSComponentViewerBox
        name="IconButtonSolid · Contrast variant, large"
        colorMode="dark"
      >
        <HStack space={buttonBlockInnerSpacing}>
          <IconButtonSolid
            color="contrast"
            accessibilityLabel="Tap to trigger test alert"
            icon="arrowBottom"
            onPress={onButtonPress}
          />

          <IconButtonSolid
            color="contrast"
            accessibilityLabel="Tap to trigger test alert"
            icon="arrowBottom"
            disabled
            onPress={onButtonPress}
          />
        </HStack>
      </DSComponentViewerBox>
    </View>
  </VStack>
);
