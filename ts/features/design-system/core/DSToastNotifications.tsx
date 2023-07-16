import { Text as NBButtonText, Toast as NBToast } from "native-base";
import * as React from "react";
import ButtonDefaultOpacity from "../../../components/ButtonDefaultOpacity";
import { VSpacer } from "../../../components/core/spacer/Spacer";
import { H2 } from "../../../components/core/typography/H2";
import { H3 } from "../../../components/core/typography/H3";
import {
  IOToast,
  ToastNotification
} from "../../../components/ui/ToastNotification";
import { showToast } from "../../../utils/showToast";
import { DesignSystemScreen } from "../components/DesignSystemScreen";

export const DSToastNotifications = () => (
  <DesignSystemScreen title={"Toast Notifications (NativeBase)"}>
    <H3 color={"bluegrey"} weight={"SemiBold"} style={{ marginBottom: 16 }}>
      Events
    </H3>

    <ButtonDefaultOpacity
      bordered={true}
      block={true}
      onPress={() => {
        IOToast.show("Hello!", "neutral", "checkTic");
      }}
    >
      <NBButtonText>Neutral</NBButtonText>
    </ButtonDefaultOpacity>

    <VSpacer size={16} />

    <ButtonDefaultOpacity
      bordered={true}
      block={true}
      onPress={() => {
        IOToast.error("Error");
      }}
    >
      <NBButtonText>Error</NBButtonText>
    </ButtonDefaultOpacity>

    <VSpacer size={16} />

    <ButtonDefaultOpacity
      bordered={true}
      block={true}
      onPress={() => {
        IOToast.info("Info");
      }}
    >
      <NBButtonText>Info</NBButtonText>
    </ButtonDefaultOpacity>

    <VSpacer size={16} />

    <ButtonDefaultOpacity
      bordered={true}
      block={true}
      onPress={() => {
        IOToast.success("Success");
      }}
    >
      <NBButtonText>Success</NBButtonText>
    </ButtonDefaultOpacity>

    <VSpacer size={16} />

    <ButtonDefaultOpacity
      bordered={true}
      block={true}
      onPress={() => {
        IOToast.warning("Warning");
      }}
    >
      <NBButtonText>Warning</NBButtonText>
    </ButtonDefaultOpacity>

    <H3
      color={"bluegrey"}
      weight={"SemiBold"}
      style={{ marginTop: 32, marginBottom: 16 }}
    >
      Component
    </H3>

    <ToastNotification message="Neutral" icon="checkTic" />
    <VSpacer size={8} />
    <ToastNotification message="Error" icon="errorFilled" variant="error" />
    <VSpacer size={8} />
    <ToastNotification message="Info" icon="infoFilled" variant="info" />
    <VSpacer size={8} />
    <ToastNotification message="Success" icon="success" variant="success" />
    <VSpacer size={8} />
    <ToastNotification
      message="Warning"
      icon="warningFilled"
      variant="warning"
    />

    <VSpacer size={40} />

    <H2 color={"bluegrey"} weight={"SemiBold"} style={{ marginBottom: 16 }}>
      Legacy toasts
    </H2>

    <H3 color={"bluegrey"} weight={"SemiBold"} style={{ marginBottom: 16 }}>
      Type
    </H3>

    <ButtonDefaultOpacity
      bordered={true}
      block={true}
      onPress={() => {
        NBToast.show({
          text: "Here's the default behavior"
        });
      }}
    >
      <NBButtonText>Default behavior</NBButtonText>
    </ButtonDefaultOpacity>

    <VSpacer size={16} />

    <ButtonDefaultOpacity
      bordered={true}
      block={true}
      onPress={() => {
        showToast("Example of a danger message");
      }}
    >
      <NBButtonText>Danger</NBButtonText>
    </ButtonDefaultOpacity>

    <VSpacer size={16} />

    <ButtonDefaultOpacity
      bordered={true}
      block={true}
      onPress={() => {
        showToast("Example of a success message", "success");
      }}
    >
      <NBButtonText>Success</NBButtonText>
    </ButtonDefaultOpacity>

    <VSpacer size={16} />

    <ButtonDefaultOpacity
      bordered={true}
      block={true}
      onPress={() => {
        showToast("Example of a warning message", "warning");
      }}
    >
      <NBButtonText>Warning</NBButtonText>
    </ButtonDefaultOpacity>

    <H3
      color={"bluegrey"}
      weight={"SemiBold"}
      style={{ marginTop: 24, marginBottom: 16 }}
    >
      Position
    </H3>
    <ButtonDefaultOpacity
      bordered={true}
      block={true}
      onPress={() => {
        showToast("Here's the notification at the top", "danger", "top");
      }}
    >
      <NBButtonText>Default · Top</NBButtonText>
    </ButtonDefaultOpacity>

    <VSpacer size={16} />

    <ButtonDefaultOpacity
      bordered={true}
      block={true}
      onPress={() => {
        showToast("Here's the notification at the center", "danger", "center");
      }}
    >
      <NBButtonText>Default · Center</NBButtonText>
    </ButtonDefaultOpacity>

    <VSpacer size={16} />

    <ButtonDefaultOpacity
      bordered={true}
      block={true}
      onPress={() => {
        showToast("Here's the notification at the bottom", "danger", "bottom");
      }}
    >
      <NBButtonText>Default · Bottom</NBButtonText>
    </ButtonDefaultOpacity>

    <H3
      color={"bluegrey"}
      weight={"SemiBold"}
      style={{ marginTop: 24, marginBottom: 16 }}
    >
      Misc
    </H3>

    <ButtonDefaultOpacity
      bordered={true}
      block={true}
      onPress={() => {
        NBToast.show({
          text: "Here's the default behavior with multi-line loooong loooooong text"
        });
      }}
    >
      <NBButtonText>Multi-line text</NBButtonText>
    </ButtonDefaultOpacity>

    <VSpacer size={40} />
  </DesignSystemScreen>
);
