import { Alert, H4, VStack, useIOTheme } from "@pagopa/io-app-design-system";
import { DSFullWidthComponent } from "../components/DSFullWidthComponent";

/* Types */
import { DesignSystemScreen } from "../components/DesignSystemScreen";

const componentInnerMargin = 8;
const sectionTitleMargin = 16;
const blockMargin = 40;

export const DSAlert = () => {
  const theme = useIOTheme();

  return (
    <DesignSystemScreen title={"Alert"}>
      <VStack space={blockMargin}>
        {/* Content only */}
        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>Content only</H4>
          {renderContentOnly()}
        </VStack>

        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>Content + Action</H4>
          {renderContentPlusAction()}
        </VStack>

        {/* Full width */}
        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>Full width</H4>
          {renderFullWidth()}
        </VStack>
      </VStack>
    </DesignSystemScreen>
  );
};

const renderContentOnly = () => (
  <VStack space={componentInnerMargin}>
    <Alert
      variant="error"
      content="Ut enim ad minim veniam, quis ullamco laboris nisi ut aliquid"
    />
    <Alert
      variant="warning"
      content="Ut enim ad minim veniam, quis ullamco laboris nisi ut aliquid"
    />
    <Alert
      variant="info"
      content="Ut enim ad minim veniam, quis ullamco laboris nisi ut aliquid"
    />
    <Alert
      variant="success"
      content="Ut enim ad minim veniam, quis ullamco laboris nisi ut aliquid"
    />
  </VStack>
);

const renderContentPlusAction = () => (
  <VStack space={componentInnerMargin}>
    <Alert
      variant="error"
      action="Alert action"
      onPress={() => {
        alert("Action triggered");
      }}
      content="Ut enim ad minim veniam, quis ullamco laboris nisi ut aliquid"
    />
    <Alert
      variant="warning"
      action="Alert action"
      onPress={() => {
        alert("Action triggered");
      }}
      content="Ut enim ad minim veniam, quis ullamco laboris nisi ut aliquid"
    />
    <Alert
      variant="info"
      action="Alert action"
      onPress={() => {
        alert("Action triggered");
      }}
      content="Ut enim ad minim veniam, quis ullamco laboris nisi ut aliquid"
    />
    <Alert
      variant="success"
      action="Alert action"
      onPress={() => {
        alert("Action triggered");
      }}
      content="Ut enim ad minim veniam, quis ullamco laboris nisi ut aliquid"
    />
  </VStack>
);

const renderFullWidth = () => (
  <DSFullWidthComponent>
    <VStack space={componentInnerMargin}>
      <Alert
        fullWidth
        variant="error"
        content="Ut enim ad minim veniam, quis ullamco labo nisi ut aliquid ad minim veniam"
      />
      <Alert
        fullWidth
        variant="warning"
        content="Ut enim ad minim veniam, quis ullamco labo nisi ut aliquid ad minim veniam"
      />
      <Alert
        fullWidth
        variant="info"
        content="Ut enim ad minim veniam, quis ullamco labo nisi ut aliquid ad minim veniam"
      />
      <Alert
        fullWidth
        variant="success"
        content="Ut enim ad minim veniam, quis ullamco labo nisi ut aliquid ad minim veniam"
      />
      <Alert
        fullWidth
        variant="info"
        action="Alert action"
        onPress={() => {
          alert("Action triggered");
        }}
        content="Ut enim ad minim veniam, quis ullamco labo nisi ut aliquid ad minim veniam"
      />
    </VStack>
  </DSFullWidthComponent>
);
