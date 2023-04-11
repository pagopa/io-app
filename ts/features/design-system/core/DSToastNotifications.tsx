import * as React from "react";
import { Text as NBButtonText, Toast as NBToast } from "native-base";

import ButtonDefaultOpacity from "../../../components/ButtonDefaultOpacity";
import { DesignSystemScreen } from "../components/DesignSystemScreen";
import { showToast } from "../../../utils/showToast";
import { H2 } from "../../../components/core/typography/H2";
import { VSpacer } from "../../../components/core/spacer/Spacer";

export const DSToastNotifications = () => (
  <DesignSystemScreen title={"Toast Notifications (NativeBase)"}>
    <H2 color={"bluegrey"} weight={"SemiBold"} style={{ marginBottom: 16 }}>
      Type
    </H2>

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

    <H2
      color={"bluegrey"}
      weight={"SemiBold"}
      style={{ marginTop: 24, marginBottom: 16 }}
    >
      Position
    </H2>
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

    <H2
      color={"bluegrey"}
      weight={"SemiBold"}
      style={{ marginTop: 24, marginBottom: 16 }}
    >
      Misc
    </H2>

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
