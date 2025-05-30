import {
  IOButton,
  H4,
  IOToast,
  ToastNotification,
  VStack,
  useIOTheme
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
              fullWidth
              variant="outline"
              label="Neutral"
              accessibilityLabel="Neutral"
              onPress={() => IOToast.show("Hello!")}
            />
            <IOButton
              fullWidth
              variant="outline"
              label="Error"
              accessibilityLabel="Error"
              onPress={() => IOToast.error("Error")}
            />
            <IOButton
              fullWidth
              variant="outline"
              label="Info"
              accessibilityLabel="Info"
              onPress={() => IOToast.info("Info")}
            />
            <IOButton
              fullWidth
              variant="outline"
              label="Success"
              accessibilityLabel="Success"
              onPress={() => IOToast.success("Success")}
            />
            <IOButton
              fullWidth
              variant="outline"
              label="Warning"
              accessibilityLabel="Warning"
              onPress={() => IOToast.warning("Warning")}
            />
            <IOButton
              fullWidth
              variant="outline"
              label="Hide all"
              accessibilityLabel="Hide all"
              onPress={() => IOToast.hideAll()}
            />
          </VStack>
        </VStack>

        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>Component</H4>
          <VStack space={componentMargin}>
            <ToastNotification message="Neutral" icon="checkTickBig" />
            <ToastNotification
              message="Error"
              icon="errorFilled"
              variant="error"
            />
            <ToastNotification
              message="Info"
              icon="infoFilled"
              variant="info"
            />
            <ToastNotification
              message="Success"
              icon="success"
              variant="success"
            />
            <ToastNotification
              message="Warning"
              icon="warningFilled"
              variant="warning"
            />
          </VStack>
        </VStack>
      </VStack>
    </DesignSystemScreen>
  );
};
