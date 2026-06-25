import {
  H4,
  IOButton,
  IOToast,
  ToastNotification,
  useIOTheme,
  VStack
} from "@pagopa/io-app-design-system";

import { DesignSystemScreen } from "../components/DesignSystemScreen";

const sectionTitleMargin = 16;
const sectionMargin = 40;
const componentMargin = 8;

export const DSToastNotifications = () => {
  const theme = useIOTheme();

  return (
    <DesignSystemScreen title={"Toast Notifications (NativeBase)"}>
      <VStack space={sectionMargin}>
        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>Events</H4>
          <VStack space={componentMargin}>
            <IOButton
              accessibilityLabel="Neutral"
              fullWidth
              label="Neutral"
              onPress={() => IOToast.show("Hello!")}
              variant="outline"
            />
            <IOButton
              accessibilityLabel="Error"
              fullWidth
              label="Error"
              onPress={() => IOToast.error("Error")}
              variant="outline"
            />
            <IOButton
              accessibilityLabel="Info"
              fullWidth
              label="Info"
              onPress={() => IOToast.info("Info")}
              variant="outline"
            />
            <IOButton
              accessibilityLabel="Success"
              fullWidth
              label="Success"
              onPress={() => IOToast.success("Success")}
              variant="outline"
            />
            <IOButton
              accessibilityLabel="Warning"
              fullWidth
              label="Warning"
              onPress={() => IOToast.warning("Warning")}
              variant="outline"
            />
            <IOButton
              accessibilityLabel="Hide all"
              fullWidth
              label="Hide all"
              onPress={() => IOToast.hideAll()}
              variant="outline"
            />
          </VStack>
        </VStack>

        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>Component</H4>
          <VStack space={componentMargin}>
            <ToastNotification icon="checkTickBig" message="Neutral" />
            <ToastNotification
              icon="errorFilled"
              message="Error"
              variant="error"
            />
            <ToastNotification
              icon="infoFilled"
              message="Info"
              variant="info"
            />
            <ToastNotification
              icon="success"
              message="Success"
              variant="success"
            />
            <ToastNotification
              icon="warningFilled"
              message="Warning"
              variant="warning"
            />
          </VStack>
        </VStack>
      </VStack>
    </DesignSystemScreen>
  );
};
