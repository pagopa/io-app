import {
  ButtonLink,
  ButtonOutline,
  ButtonSolid,
  H4,
  HStack,
  IOColors,
  IconButton,
  IconButtonContained,
  IconButtonSolid,
  ListItemSwitch,
  VStack,
  useIOExperimentalDesign,
  useIOTheme
} from "@pagopa/io-app-design-system";
import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { DSComponentViewerBox } from "../components/DSComponentViewerBox";
import { DesignSystemScreen } from "../components/DesignSystemScreen";

const styles = StyleSheet.create({
  primaryBlockLegacy: {
    backgroundColor: IOColors["blue-500"],
    padding: 16,
    borderRadius: 8
  },
  primaryBlock: {
    backgroundColor: IOColors["blueIO-500"],
    padding: 16,
    borderRadius: 16
  }
});

const onButtonPress = () => {
  Alert.alert("Alert", "Action triggered");
};

const sectionTitleMargin = 16;
const sectionMargin = 48;
const buttonBlockMargin = 24;
const buttonBlockInnerSpacing = 8;
const buttonBlockInnerSpacingLoose = 16;

export const DSButtons = () => {
  const { isExperimental } = useIOExperimentalDesign();
  const theme = useIOTheme();

  return (
    <DesignSystemScreen title={"Buttons"}>
      <VStack space={sectionMargin}>
        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>ButtonSolid</H4>
          {renderButtonSolid(isExperimental)}
        </VStack>

        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>ButtonOutline</H4>
          {renderButtonOutline(isExperimental)}
        </VStack>

        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>ButtonLink</H4>
          {renderButtonLink(isExperimental)}
        </VStack>

        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>IconButton</H4>
          {renderIconButton(isExperimental)}
        </VStack>

        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>IconButtonSolid</H4>
          {renderIconButtonSolid(isExperimental)}
        </VStack>

        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>
            IconButtonContained (Icebox)
          </H4>
          {renderIconButtonContained(isExperimental)}
        </VStack>
      </VStack>
    </DesignSystemScreen>
  );
};

const renderButtonSolid = (isExperimental: boolean) => (
  <VStack space={buttonBlockMargin}>
    <DSComponentViewerBox name="ButtonSolid · Primary variant">
      <VStack space={buttonBlockInnerSpacing}>
        <ButtonSolid
          accessibilityLabel="Tap to trigger test alert"
          label={"Primary button"}
          onPress={onButtonPress}
        />
        <ButtonSolid
          accessibilityLabel="Tap to trigger test alert"
          label={"Primary button"}
          icon="qrCode"
          onPress={onButtonPress}
        />
        <ButtonSolid
          accessibilityLabel="Tap to trigger test alert"
          label={"Primary button"}
          icon="qrCode"
          iconPosition="end"
          onPress={onButtonPress}
        />
        <View style={{ alignSelf: "center" }}>
          <ButtonSolid
            accessibilityLabel="Tap to trigger test alert"
            label={"Primary button (centered)"}
            onPress={onButtonPress}
          />
        </View>
      </VStack>
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ButtonSolid · Primary, full width">
      <ButtonSolid
        fullWidth
        accessibilityLabel="Tap to trigger test alert"
        label={"Primary button (full width)"}
        onPress={onButtonPress}
      />
    </DSComponentViewerBox>

    <DSComponentViewerBox name="ButtonSolid · Primary · Full width, loading state">
      <LoadingSolidButtonExample />
    </DSComponentViewerBox>

    <DSComponentViewerBox name="ButtonSolid · Primary, disabled">
      <VStack space={buttonBlockInnerSpacing}>
        <ButtonSolid
          disabled
          accessibilityLabel="Tap to trigger test alert"
          label={"Primary button (disabled)"}
          onPress={onButtonPress}
        />
        <ButtonSolid
          disabled
          accessibilityLabel="Tap to trigger test alert"
          label={"Primary button (disabled)"}
          icon="qrCode"
          onPress={onButtonPress}
        />
      </VStack>
    </DSComponentViewerBox>

    <DSComponentViewerBox name="ButtonSolid · Danger variant">
      <VStack space={buttonBlockInnerSpacing}>
        <ButtonSolid
          color="danger"
          label={"Danger button"}
          onPress={onButtonPress}
          accessibilityLabel="Tap to trigger test alert"
        />

        <ButtonSolid
          color="danger"
          accessibilityLabel="Tap to trigger test alert"
          label={"Danger button"}
          icon="trashcan"
          onPress={onButtonPress}
        />

        <ButtonSolid
          color="danger"
          accessibilityLabel="Tap to trigger test alert"
          label={"Danger button"}
          icon="trashcan"
          iconPosition="end"
          onPress={onButtonPress}
        />
      </VStack>
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ButtonSolid · Danger, full width">
      <ButtonSolid
        fullWidth
        color="danger"
        accessibilityLabel="Tap to trigger test alert"
        label={"Danger button (full width)"}
        onPress={onButtonPress}
      />
    </DSComponentViewerBox>

    <DSComponentViewerBox name="ButtonSolid · Danger, disabled">
      <VStack space={buttonBlockInnerSpacing}>
        <ButtonSolid
          color="danger"
          disabled
          accessibilityLabel="Tap to trigger test alert"
          label={"Danger button (disabled)"}
          onPress={onButtonPress}
        />

        <ButtonSolid
          color="danger"
          disabled
          accessibilityLabel="Tap to trigger test alert"
          label={"Danger button (disabled)"}
          icon="trashcan"
          onPress={onButtonPress}
        />

        <ButtonSolid
          color="danger"
          disabled
          fullWidth
          accessibilityLabel="Tap to trigger test alert"
          label={"Danger Button (full width, disabled)"}
          onPress={onButtonPress}
        />
      </VStack>
    </DSComponentViewerBox>

    <View
      style={isExperimental ? styles.primaryBlock : styles.primaryBlockLegacy}
    >
      <VStack space={buttonBlockMargin}>
        <DSComponentViewerBox
          name="ButtonSolid · Contrast variant"
          colorMode="dark"
        >
          <VStack space={buttonBlockInnerSpacing}>
            <ButtonSolid
              color="contrast"
              label={"Contrast button"}
              onPress={onButtonPress}
              accessibilityLabel="Tap to trigger test alert"
            />

            <ButtonSolid
              color="contrast"
              label={"Contrast button"}
              icon="add"
              onPress={onButtonPress}
              accessibilityLabel="Tap to trigger test alert"
            />

            <ButtonSolid
              color="contrast"
              label={"Contrast button"}
              icon="add"
              iconPosition="end"
              onPress={onButtonPress}
              accessibilityLabel="Tap to trigger test alert"
            />
          </VStack>
        </DSComponentViewerBox>

        <DSComponentViewerBox
          name="ButtonSolid · Contrast, full width"
          colorMode="dark"
        >
          <ButtonSolid
            fullWidth
            color="contrast"
            label={"Contrast button"}
            onPress={onButtonPress}
            accessibilityLabel="Tap to trigger test alert"
          />
        </DSComponentViewerBox>

        <DSComponentViewerBox
          name="ButtonSolid · Contrast, full width, loading state"
          colorMode="dark"
        >
          <ButtonSolid
            fullWidth
            loading
            color="contrast"
            label={"Contrast button"}
            onPress={onButtonPress}
            accessibilityLabel="Tap to trigger test alert"
          />
        </DSComponentViewerBox>

        <DSComponentViewerBox
          name="ButtonSolid · Contrast, disabled"
          colorMode="dark"
        >
          <VStack space={buttonBlockInnerSpacing}>
            <ButtonSolid
              disabled
              color="contrast"
              label={"Contrast button (disabled)"}
              onPress={onButtonPress}
              accessibilityLabel="Tap to trigger test alert"
            />
            <ButtonSolid
              disabled
              color="contrast"
              label={"Contrast button (disabled)"}
              icon="add"
              onPress={onButtonPress}
              accessibilityLabel="Tap to trigger test alert"
            />
            <ButtonSolid
              fullWidth
              disabled
              color="contrast"
              accessibilityLabel="Tap to trigger test alert"
              label={"Contrast button (full width, disabled)"}
              onPress={onButtonPress}
            />
          </VStack>
        </DSComponentViewerBox>
      </VStack>
    </View>
  </VStack>
);

const renderButtonOutline = (isExperimental: boolean) => (
  <VStack space={buttonBlockMargin}>
    <DSComponentViewerBox name="ButtonOutline · Primary variant">
      <VStack space={buttonBlockInnerSpacing}>
        <ButtonOutline
          accessibilityLabel="Tap to trigger test alert"
          label={"Primary button"}
          onPress={onButtonPress}
        />

        <ButtonOutline
          accessibilityLabel="Tap to trigger test alert"
          label={"Primary button"}
          icon="arrowLeft"
          onPress={onButtonPress}
        />

        <ButtonOutline
          accessibilityLabel="Tap to trigger test alert"
          label={"Primary button"}
          icon="arrowRight"
          iconPosition="end"
          onPress={onButtonPress}
        />

        <View style={{ alignSelf: "center" }}>
          <ButtonOutline
            accessibilityLabel="Tap to trigger test alert"
            label={"Primary button (centered)"}
            onPress={onButtonPress}
          />
        </View>
      </VStack>
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ButtonOutline · Primary, full width">
      <ButtonOutline
        fullWidth
        accessibilityLabel="Tap to trigger test alert"
        label={"Primary button (full width)"}
        onPress={onButtonPress}
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ButtonOutline · Primary, disabled">
      <VStack space={buttonBlockInnerSpacing}>
        <ButtonOutline
          disabled
          accessibilityLabel="Tap to trigger test alert"
          label={"Primary button (disabled)"}
          onPress={onButtonPress}
        />

        <ButtonOutline
          disabled
          accessibilityLabel="Tap to trigger test alert"
          label={"Primary button (disabled)"}
          icon="arrowRight"
          iconPosition="end"
          onPress={onButtonPress}
        />
      </VStack>
    </DSComponentViewerBox>

    {!isExperimental && (
      <>
        <DSComponentViewerBox name="ButtonOutline · Danger variant">
          <VStack space={buttonBlockInnerSpacing}>
            <ButtonOutline
              color="danger"
              label={"Danger button"}
              onPress={onButtonPress}
              accessibilityLabel="Tap to trigger test alert"
            />

            <ButtonOutline
              color="danger"
              label={"Danger button"}
              icon="trashcan"
              accessibilityLabel="Tap to trigger test alert"
              onPress={onButtonPress}
            />

            <ButtonOutline
              color="danger"
              label={"Danger button"}
              icon="trashcan"
              iconPosition="end"
              accessibilityLabel="Tap to trigger test alert"
              onPress={onButtonPress}
            />
          </VStack>
        </DSComponentViewerBox>
        <DSComponentViewerBox name="ButtonOutline · Danger, full width">
          <ButtonOutline
            fullWidth
            color="danger"
            accessibilityLabel="Tap to trigger test alert"
            label={"Danger button (full width)"}
            onPress={() => {
              alert("Action triggered");
            }}
          />
        </DSComponentViewerBox>

        <DSComponentViewerBox name="ButtonOutline · Danger, disabled">
          <VStack space={buttonBlockInnerSpacing}>
            <ButtonOutline
              color="danger"
              disabled
              accessibilityLabel="Tap to trigger test alert"
              label={"Danger button (disabled)"}
              onPress={() => {
                alert("Action triggered");
              }}
            />
            <ButtonOutline
              color="danger"
              disabled
              fullWidth
              accessibilityLabel="Tap to trigger test alert"
              label={"Danger Button (full width, disabled)"}
              onPress={() => {
                alert("Action triggered");
              }}
            />
          </VStack>
        </DSComponentViewerBox>
      </>
    )}

    <View
      style={isExperimental ? styles.primaryBlock : styles.primaryBlockLegacy}
    >
      <VStack space={buttonBlockMargin}>
        <DSComponentViewerBox
          name="ButtonOutline · Contrast variant"
          colorMode="dark"
        >
          <VStack space={buttonBlockInnerSpacing}>
            <ButtonOutline
              color="contrast"
              label={"Contrast button"}
              onPress={onButtonPress}
              accessibilityLabel="Tap to trigger test alert"
            />

            <ButtonOutline
              color="contrast"
              label={"Contrast button"}
              icon="arrowLeft"
              onPress={onButtonPress}
              accessibilityLabel="Tap to trigger test alert"
            />

            <ButtonOutline
              color="contrast"
              label={"Contrast button"}
              icon="arrowRight"
              iconPosition="end"
              onPress={onButtonPress}
              accessibilityLabel="Tap to trigger test alert"
            />
          </VStack>
        </DSComponentViewerBox>

        <DSComponentViewerBox
          name="ButtonOutline · Contrast, full width"
          colorMode="dark"
        >
          <ButtonOutline
            fullWidth
            color="contrast"
            label={"Contrast button"}
            onPress={onButtonPress}
            accessibilityLabel="Tap to trigger test alert"
          />
        </DSComponentViewerBox>

        <DSComponentViewerBox
          name="ButtonOutline · Contrast, disabled"
          colorMode="dark"
        >
          <VStack space={buttonBlockInnerSpacing}>
            <ButtonOutline
              disabled
              color="contrast"
              label={"Contrast button (disabled)"}
              onPress={onButtonPress}
              accessibilityLabel="Tap to trigger test alert"
            />
            <ButtonOutline
              disabled
              color="contrast"
              label={"Contrast button (disabled)"}
              icon="arrowRight"
              iconPosition="end"
              onPress={onButtonPress}
              accessibilityLabel="Tap to trigger test alert"
            />
          </VStack>
        </DSComponentViewerBox>
      </VStack>
    </View>
  </VStack>
);

const renderButtonLink = (isExperimental: boolean) => (
  <VStack space={buttonBlockMargin}>
    <DSComponentViewerBox name="ButtonLink · Primary variant">
      <VStack space={buttonBlockInnerSpacingLoose}>
        <ButtonLink
          accessibilityLabel="Tap to trigger test alert"
          label={"Primary button"}
          onPress={onButtonPress}
        />

        <ButtonLink
          accessibilityLabel="Tap to trigger test alert"
          label={"Primary button"}
          icon="starEmpty"
          onPress={onButtonPress}
        />

        <ButtonLink
          accessibilityLabel="Tap to trigger test alert"
          label={"Primary button"}
          icon="starEmpty"
          iconPosition="end"
          onPress={onButtonPress}
        />

        <View style={{ alignSelf: "center" }}>
          <ButtonLink
            accessibilityLabel="Tap to trigger test alert"
            label={"Primary button (centered)"}
            onPress={onButtonPress}
          />
        </View>
      </VStack>
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ButtonLink · Primary, disabled">
      <VStack space={buttonBlockInnerSpacingLoose}>
        <ButtonLink
          disabled
          accessibilityLabel="Tap to trigger test alert"
          label={"Primary button (disabled)"}
          onPress={onButtonPress}
        />

        <ButtonLink
          disabled
          accessibilityLabel="Tap to trigger test alert"
          label={"Primary button (disabled)"}
          icon="starEmpty"
          iconPosition="end"
          onPress={onButtonPress}
        />
      </VStack>
    </DSComponentViewerBox>

    <View
      style={isExperimental ? styles.primaryBlock : styles.primaryBlockLegacy}
    >
      <VStack space={buttonBlockMargin}>
        <DSComponentViewerBox
          name="ButtonLink · Contrast variant"
          colorMode="dark"
        >
          <VStack space={buttonBlockInnerSpacingLoose}>
            <ButtonLink
              color="contrast"
              accessibilityLabel="Tap to trigger test alert"
              label={"Primary button"}
              onPress={onButtonPress}
            />

            <ButtonLink
              color="contrast"
              accessibilityLabel="Tap to trigger test alert"
              label={"Primary button"}
              icon="starEmpty"
              onPress={onButtonPress}
            />

            <ButtonLink
              color="contrast"
              accessibilityLabel="Tap to trigger test alert"
              label={"Primary button"}
              icon="starEmpty"
              iconPosition="end"
              onPress={onButtonPress}
            />

            <View style={{ alignSelf: "center" }}>
              <ButtonLink
                color="contrast"
                accessibilityLabel="Tap to trigger test alert"
                label={"Primary button (centered)"}
                onPress={onButtonPress}
              />
            </View>
          </VStack>
        </DSComponentViewerBox>

        <DSComponentViewerBox
          name="ButtonLink · Contrast, disabled"
          colorMode="dark"
        >
          <VStack space={buttonBlockInnerSpacingLoose}>
            <ButtonLink
              disabled
              color="contrast"
              accessibilityLabel="Tap to trigger test alert"
              label={"Primary button (disabled)"}
              onPress={onButtonPress}
            />

            <ButtonLink
              disabled
              color="contrast"
              accessibilityLabel="Tap to trigger test alert"
              label={"Primary button (disabled)"}
              icon="starEmpty"
              iconPosition="end"
              onPress={onButtonPress}
            />
          </VStack>
        </DSComponentViewerBox>
      </VStack>
    </View>
  </VStack>
);

const renderIconButton = (isExperimental: boolean) => (
  <VStack space={buttonBlockMargin}>
    <DSComponentViewerBox name="IconButton · Primary variant">
      <HStack space={buttonBlockInnerSpacingLoose}>
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
      <HStack space={buttonBlockInnerSpacingLoose}>
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
    <View
      style={isExperimental ? styles.primaryBlock : styles.primaryBlockLegacy}
    >
      <DSComponentViewerBox
        name="IconButton · Contrast variant"
        colorMode="dark"
      >
        <HStack space={buttonBlockInnerSpacingLoose}>
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
  </VStack>
);

const renderIconButtonSolid = (isExperimental: boolean) => (
  <VStack space={buttonBlockMargin}>
    <DSComponentViewerBox name="IconButtonSolid · Primary variant, large">
      <HStack space={buttonBlockInnerSpacingLoose}>
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
    <View
      style={isExperimental ? styles.primaryBlock : styles.primaryBlockLegacy}
    >
      <DSComponentViewerBox
        name="IconButtonSolid · Contrast variant, large"
        colorMode="dark"
      >
        <HStack space={buttonBlockInnerSpacingLoose}>
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

const renderIconButtonContained = (isExperimental: boolean) => (
  <VStack space={buttonBlockMargin}>
    <DSComponentViewerBox name="IconButtonContained · Primary variant">
      <HStack space={buttonBlockInnerSpacing}>
        <IconButtonContained
          accessibilityLabel="Tap to trigger test alert"
          icon="help"
          onPress={onButtonPress}
        />

        <IconButtonContained
          accessibilityLabel="Tap to trigger test alert"
          icon="help"
          disabled
          onPress={onButtonPress}
        />
      </HStack>
    </DSComponentViewerBox>
    <DSComponentViewerBox name="IconButtonContained · Neutral variant">
      <HStack space={buttonBlockInnerSpacing}>
        <IconButtonContained
          color="neutral"
          accessibilityLabel="Tap to trigger test alert"
          icon="help"
          onPress={onButtonPress}
        />

        <IconButtonContained
          color="neutral"
          accessibilityLabel="Tap to trigger test alert"
          icon="help"
          disabled
          onPress={onButtonPress}
        />
      </HStack>
    </DSComponentViewerBox>
    <View
      style={isExperimental ? styles.primaryBlock : styles.primaryBlockLegacy}
    >
      <DSComponentViewerBox
        name="IconButtonContained · Contrast variant"
        colorMode="dark"
      >
        <HStack space={buttonBlockInnerSpacing}>
          <IconButtonContained
            color="contrast"
            accessibilityLabel="Tap to trigger test alert"
            icon="help"
            onPress={onButtonPress}
          />

          <IconButtonContained
            color="contrast"
            accessibilityLabel="Tap to trigger test alert"
            icon="help"
            disabled
            onPress={onButtonPress}
          />
        </HStack>
      </DSComponentViewerBox>
    </View>
  </VStack>
);

const LoadingSolidButtonExample = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  return (
    <View>
      <ButtonSolid
        fullWidth
        loading={isEnabled}
        accessibilityLabel="Tap to trigger test alert"
        label={"Primary button"}
        onPress={() => setIsEnabled(true)}
      />
      <ListItemSwitch
        label="Enable loading state"
        onSwitchValueChange={toggleSwitch}
        value={isEnabled}
      />
    </View>
  );
};
