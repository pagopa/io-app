import { ButtonOutline, VSpacer } from "@pagopa/io-app-design-system";
import * as React from "react";
import { IOToast, ToastNotification } from "../../../components/Toast";
import { H3 } from "../../../components/core/typography/H3";
import { DesignSystemScreen } from "../components/DesignSystemScreen";

export const DSToastNotifications = () => (
  <DesignSystemScreen title={"Toast Notifications (NativeBase)"}>
    <H3 color={"bluegrey"} weight={"SemiBold"} style={{ marginBottom: 16 }}>
      Events
    </H3>

    <ButtonOutline
      fullWidth={true}
      label="Neutral"
      accessibilityLabel="Neutral"
      onPress={() => IOToast.show("Hello!")}
    />

    <VSpacer size={16} />

    <ButtonOutline
      fullWidth={true}
      label="Error"
      accessibilityLabel="Error"
      onPress={() => IOToast.error("Error")}
    />

    <VSpacer size={16} />

    <ButtonOutline
      fullWidth={true}
      label="Info"
      accessibilityLabel="Info"
      onPress={() => IOToast.info("Info")}
    />

    <VSpacer size={16} />

    <ButtonOutline
      fullWidth={true}
      label="Success"
      accessibilityLabel="Success"
      onPress={() => IOToast.success("Success")}
    />

    <VSpacer size={16} />

    <ButtonOutline
      fullWidth={true}
      label="Warning"
      accessibilityLabel="Warning"
      onPress={() => IOToast.warning("Warning")}
    />

    <VSpacer size={16} />

    <ButtonOutline
      fullWidth={true}
      label="Hide all"
      accessibilityLabel="Hide all"
      onPress={() => IOToast.hideAll()}
    />

    <H3
      color={"bluegrey"}
      weight={"SemiBold"}
      style={{ marginTop: 32, marginBottom: 16 }}
    >
      Component
    </H3>

    <ToastNotification message="Neutral" icon="checkTickBig" />
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
  </DesignSystemScreen>
);
