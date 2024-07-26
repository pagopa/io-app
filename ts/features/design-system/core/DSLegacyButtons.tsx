import {
  BlockButtons,
  VSpacer,
  useIOTheme
} from "@pagopa/io-app-design-system";
import * as React from "react";

import { Alert } from "react-native";
import { DesignSystemScreen } from "../components/DesignSystemScreen";
import { H2 } from "../../../components/core/typography/H2";
import { DSComponentViewerBox } from "../components/DSComponentViewerBox";
import CopyButtonComponent from "../../../components/CopyButtonComponent";

const onButtonPress = () => {
  Alert.alert("Alert", "Action triggered");
};

export const DSLegacyButtons = () => {
  const theme = useIOTheme();

  return (
    <DesignSystemScreen title={"Legacy Buttons"}>
      <H2
        color={theme["textHeading-default"]}
        weight={"Semibold"}
        style={{ marginBottom: 16 }}
      >
        Block Buttons (not NativeBase)
      </H2>
      {renderBlockButtons()}

      <VSpacer size={48} />

      <H2
        color={theme["textHeading-default"]}
        weight={"Semibold"}
        style={{ marginBottom: 16 }}
      >
        Specific buttons
      </H2>
      {renderSpecificButtons()}
    </DesignSystemScreen>
  );
};

const renderBlockButtons = () => (
  <>
    <BlockButtons
      type="SingleButton"
      primary={{
        type: "Solid",
        buttonProps: {
          color: "primary",
          accessibilityLabel: "primary button",
          onPress: onButtonPress,
          label: "Primary button"
        }
      }}
    />
    <VSpacer size={16} />
    <BlockButtons
      type="TwoButtonsInlineThird"
      primary={{
        type: "Outline",
        buttonProps: {
          color: "primary",
          accessibilityLabel: "Left button",
          onPress: onButtonPress,
          label: "Left button"
        }
      }}
      secondary={{
        type: "Solid",
        buttonProps: {
          color: "primary",
          accessibilityLabel: "Right button",
          onPress: onButtonPress,
          label: "Right button"
        }
      }}
    />
    <VSpacer size={16} />
    <BlockButtons
      type="TwoButtonsInlineHalf"
      primary={{
        type: "Outline",
        buttonProps: {
          color: "primary",
          accessibilityLabel: "Left button",
          onPress: onButtonPress,
          label: "Left button"
        }
      }}
      secondary={{
        type: "Solid",
        buttonProps: {
          color: "primary",
          accessibilityLabel: "Right button",
          onPress: onButtonPress,
          label: "Right button"
        }
      }}
    />
    <VSpacer size={16} />
    <BlockButtons
      type="TwoButtonsInlineThirdInverted"
      primary={{
        type: "Outline",
        buttonProps: {
          color: "primary",
          accessibilityLabel: "Left button",
          onPress: onButtonPress,
          label: "Left button"
        }
      }}
      secondary={{
        type: "Solid",
        buttonProps: {
          color: "primary",
          accessibilityLabel: "Right button",
          onPress: onButtonPress,
          label: "Right button"
        }
      }}
    />
  </>
);

const renderSpecificButtons = () => (
  <>
    <DSComponentViewerBox name="CopyButtonComponent">
      <CopyButtonComponent textToCopy={"Copied text by CopyButton"} />
    </DSComponentViewerBox>
  </>
);
