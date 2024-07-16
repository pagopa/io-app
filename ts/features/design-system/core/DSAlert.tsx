import { Alert, VSpacer } from "@pagopa/io-app-design-system";
import * as React from "react";
import { DSFullWidthComponent } from "../components/DSFullWidthComponent";

/* Types */
import { H2 } from "../../../components/core/typography/H2";
import { DesignSystemScreen } from "../components/DesignSystemScreen";

export const DSAlert = () => (
  <DesignSystemScreen title={"Alert"}>
    {/* Content only */}
    <H2 color={"bluegrey"} weight={"Semibold"} style={{ marginBottom: 16 }}>
      Content only
    </H2>
    <Alert
      variant="error"
      content="Ut enim ad minim veniam, quis ullamco laboris nisi ut aliquid"
    />

    <VSpacer />

    <Alert
      variant="warning"
      content="Ut enim ad minim veniam, quis ullamco laboris nisi ut aliquid"
    />

    <VSpacer />

    <Alert
      variant="info"
      content="Ut enim ad minim veniam, quis ullamco laboris nisi ut aliquid"
    />

    <VSpacer />

    <Alert
      variant="success"
      content="Ut enim ad minim veniam, quis ullamco laboris nisi ut aliquid"
    />

    <VSpacer size={40} />

    <H2 color={"bluegrey"} weight={"Semibold"} style={{ marginBottom: 16 }}>
      Title + Content
    </H2>

    <Alert
      variant="error"
      title="Alert title"
      content="Ut enim ad minim veniam, quis ullamco laboris nisi ut aliquid"
    />

    <VSpacer />

    <Alert
      variant="warning"
      title="Alert title"
      content="Ut enim ad minim veniam, quis ullamco laboris nisi ut aliquid"
    />

    <VSpacer />

    <Alert
      variant="info"
      title="Alert title"
      content="Ut enim ad minim veniam, quis ullamco laboris nisi ut aliquid"
    />

    <VSpacer />

    <Alert
      variant="success"
      title="Alert title"
      content="Ut enim ad minim veniam, quis ullamco laboris nisi ut aliquid"
    />

    <VSpacer />

    <Alert
      variant="info"
      title="A very very very looooooooooong title"
      content="Ut enim ad minim veniam, quis ullamco laboris nisi ut aliquid"
    />

    <VSpacer size={40} />

    <H2 color={"bluegrey"} weight={"Semibold"} style={{ marginBottom: 16 }}>
      Content + Action
    </H2>

    <Alert
      variant="error"
      action="Alert action"
      onPress={() => {
        alert("Action triggered");
      }}
      content="Ut enim ad minim veniam, quis ullamco laboris nisi ut aliquid"
    />

    <VSpacer />

    <Alert
      variant="warning"
      action="Alert action"
      onPress={() => {
        alert("Action triggered");
      }}
      content="Ut enim ad minim veniam, quis ullamco laboris nisi ut aliquid"
    />

    <VSpacer />

    <Alert
      variant="info"
      action="Alert action"
      onPress={() => {
        alert("Action triggered");
      }}
      content="Ut enim ad minim veniam, quis ullamco laboris nisi ut aliquid"
    />

    <VSpacer />

    <Alert
      variant="success"
      action="Alert action"
      onPress={() => {
        alert("Action triggered");
      }}
      content="Ut enim ad minim veniam, quis ullamco laboris nisi ut aliquid"
    />

    <VSpacer size={40} />

    {/* Full width */}
    <H2 color={"bluegrey"} weight={"Semibold"} style={{ marginBottom: 16 }}>
      Full width
    </H2>
    <DSFullWidthComponent>
      <Alert
        fullWidth
        variant="error"
        content="Ut enim ad minim veniam, quis ullamco labo nisi ut aliquid ad minim veniam"
      />

      <VSpacer />

      <Alert
        fullWidth
        variant="warning"
        content="Ut enim ad minim veniam, quis ullamco labo nisi ut aliquid ad minim veniam"
      />

      <VSpacer />

      <Alert
        fullWidth
        variant="info"
        content="Ut enim ad minim veniam, quis ullamco labo nisi ut aliquid ad minim veniam"
      />

      <VSpacer />

      <Alert
        fullWidth
        variant="success"
        content="Ut enim ad minim veniam, quis ullamco labo nisi ut aliquid ad minim veniam"
      />

      <VSpacer />

      <Alert
        fullWidth
        variant="info"
        title="Alert title"
        content="Ut enim ad minim veniam, quis ullamco labo nisi ut aliquid ad minim veniam"
      />

      <VSpacer />

      <Alert
        fullWidth
        variant="info"
        action="Alert action"
        onPress={() => {
          alert("Action triggered");
        }}
        content="Ut enim ad minim veniam, quis ullamco labo nisi ut aliquid ad minim veniam"
      />
    </DSFullWidthComponent>
  </DesignSystemScreen>
);
