import {
  BlockButtons,
  H4,
  VStack,
  useIOTheme
} from "@pagopa/io-app-design-system";
import * as React from "react";

import { Alert } from "react-native";
import { OrganizationFiscalCode } from "../../../../definitions/backend/OrganizationFiscalCode";
import { PaymentNoticeNumber } from "../../../../definitions/backend/PaymentNoticeNumber";
import CopyButtonComponent from "../../../components/CopyButtonComponent";
import PaymentButton from "../../messages/components/MessageDetail/PaymentButton";
import { DSComponentViewerBox } from "../components/DSComponentViewerBox";
import { DesignSystemScreen } from "../components/DesignSystemScreen";

const onButtonPress = () => {
  Alert.alert("Alert", "Action triggered");
};

const componentInnerMargin = 16;
const componentMargin = 24;
const sectionTitleMargin = 16;
const blockMargin = 40;

export const DSLegacyButtons = () => {
  const theme = useIOTheme();

  return (
    <DesignSystemScreen title={"Legacy Buttons"}>
      <VStack space={blockMargin}>
        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>Block Buttons</H4>
          {renderBlockButtons()}
        </VStack>

        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>Specific buttons</H4>
          {renderSpecificButtons()}
        </VStack>
      </VStack>
    </DesignSystemScreen>
  );
};

const renderBlockButtons = () => (
  <VStack space={componentInnerMargin}>
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
  </VStack>
);

const renderSpecificButtons = () => (
  <VStack space={componentMargin}>
    <DSComponentViewerBox name="PaymentButton">
      <PaymentButton
        amount={9999999999}
        noticeNumber={"123112312312321321" as PaymentNoticeNumber}
        organizationFiscalCode={"46545" as OrganizationFiscalCode}
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="CopyButtonComponent">
      <CopyButtonComponent textToCopy={"Copied text by CopyButton"} />
    </DSComponentViewerBox>
  </VStack>
);
