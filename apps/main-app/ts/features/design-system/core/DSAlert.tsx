import { Alert, H4, useIOTheme, VStack } from "@io-app/design-system";
import { Alert as RNAlert } from "react-native";

/* Types */
import { DesignSystemScreen } from "../components/DesignSystemScreen";
import { DSFullWidthComponent } from "../components/DSFullWidthComponent";

const componentInnerMargin = 8;
const sectionTitleMargin = 16;
const blockMargin = 40;

const onPress = () => {
  RNAlert.alert("Action triggered");
};

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
      content="Ut enim ad minim veniam, quis ullamco laboris nisi ut aliquid"
      variant="error"
    />
    <Alert
      content="Ut enim ad minim veniam, quis ullamco laboris nisi ut aliquid"
      variant="warning"
    />
    <Alert
      content="Ut enim ad minim veniam, quis ullamco laboris nisi ut aliquid"
      variant="info"
    />
    <Alert
      content="Ut enim ad minim veniam, quis ullamco laboris nisi ut aliquid"
      variant="success"
    />
  </VStack>
);

const renderContentPlusAction = () => (
  <VStack space={componentInnerMargin}>
    <Alert
      action="Alert action"
      content="Ut enim ad minim veniam, quis ullamco laboris nisi ut aliquid"
      onPress={onPress}
      variant="error"
    />
    <Alert
      action="Alert action"
      content="Ut enim ad minim veniam, quis ullamco laboris nisi ut aliquid"
      onPress={onPress}
      variant="warning"
    />
    <Alert
      action="Alert action"
      content="Ut enim ad minim veniam, quis ullamco laboris nisi ut aliquid"
      onPress={onPress}
      variant="info"
    />
    <Alert
      action="Alert action"
      content="Ut enim ad minim veniam, quis ullamco laboris nisi ut aliquid"
      onPress={onPress}
      variant="success"
    />
  </VStack>
);

const renderFullWidth = () => (
  <DSFullWidthComponent>
    <VStack space={componentInnerMargin}>
      <Alert
        content="Ut enim ad minim veniam, quis ullamco labo nisi ut aliquid ad minim veniam"
        fullWidth
        variant="error"
      />
      <Alert
        content="Ut enim ad minim veniam, quis ullamco labo nisi ut aliquid ad minim veniam"
        fullWidth
        variant="warning"
      />
      <Alert
        content="Ut enim ad minim veniam, quis ullamco labo nisi ut aliquid ad minim veniam"
        fullWidth
        variant="info"
      />
      <Alert
        content="Ut enim ad minim veniam, quis ullamco labo nisi ut aliquid ad minim veniam"
        fullWidth
        variant="success"
      />
      <Alert
        action="Alert action"
        content="Ut enim ad minim veniam, quis ullamco labo nisi ut aliquid ad minim veniam"
        fullWidth
        onPress={() => {
          RNAlert.alert("Action triggered");
        }}
        variant="info"
      />
    </VStack>
  </DSFullWidthComponent>
);
