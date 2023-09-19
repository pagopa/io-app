import { Toast as NBToast } from "native-base";
import * as React from "react";
import { ButtonOutline, VSpacer } from "@pagopa/io-app-design-system";
import { H2 } from "../../../components/core/typography/H2";
import { H3 } from "../../../components/core/typography/H3";
import { showToast } from "../../../utils/showToast";
import { DesignSystemScreen } from "../components/DesignSystemScreen";
import { IOToast, ToastNotification } from "../../../components/Toast";

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

    <H2 color={"bluegrey"} weight={"SemiBold"} style={{ marginBottom: 16 }}>
      Legacy toasts
    </H2>

    <H3 color={"bluegrey"} weight={"SemiBold"} style={{ marginBottom: 16 }}>
      Type
    </H3>

    <ButtonOutline
      fullWidth={true}
      label="Default behavior"
      accessibilityLabel="Default behavior"
      onPress={() =>
        NBToast.show({
          text: "Here's the default behavior"
        })
      }
    />

    <VSpacer size={16} />

    <ButtonOutline
      fullWidth={true}
      label="Danger"
      accessibilityLabel="Danger"
      onPress={() => showToast("Example of a danger message")}
    />

    <VSpacer size={16} />

    <ButtonOutline
      fullWidth={true}
      label="Success"
      accessibilityLabel="Success"
      onPress={() => showToast("Example of a success message", "success")}
    />

    <VSpacer size={16} />

    <ButtonOutline
      fullWidth={true}
      label="Warning"
      accessibilityLabel="Warning"
      onPress={() => showToast("Example of a warning message", "warning")}
    />

    <H3
      color={"bluegrey"}
      weight={"SemiBold"}
      style={{ marginTop: 24, marginBottom: 16 }}
    >
      Position
    </H3>

    <ButtonOutline
      fullWidth={true}
      label="Default · Top"
      accessibilityLabel="Default · Top"
      onPress={() =>
        showToast("Here's the notification at the top", "danger", "top")
      }
    />

    <VSpacer size={16} />

    <ButtonOutline
      fullWidth={true}
      label="Default · Center"
      accessibilityLabel="Default · Center"
      onPress={() =>
        showToast("Here's the notification at the top", "danger", "top")
      }
    />

    <VSpacer size={16} />

    <ButtonOutline
      fullWidth={true}
      label="Default · Bottom"
      accessibilityLabel="Default · Bottom"
      onPress={() =>
        showToast("Here's the notification at the bottom", "danger", "bottom")
      }
    />

    <H3
      color={"bluegrey"}
      weight={"SemiBold"}
      style={{ marginTop: 24, marginBottom: 16 }}
    >
      Misc
    </H3>

    <ButtonOutline
      fullWidth={true}
      label="Multi-line text"
      accessibilityLabel="Multi-line text"
      onPress={() =>
        NBToast.show({
          text: "Here's the default behavior with multi-line loooong loooooong text"
        })
      }
    />

    <VSpacer size={40} />
  </DesignSystemScreen>
);
