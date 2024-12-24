import {
  ButtonOutline,
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
            <ButtonOutline
              fullWidth={true}
              label="Neutral"
              accessibilityLabel="Neutral"
              onPress={() => IOToast.show("Hello!")}
            />
            <ButtonOutline
              fullWidth={true}
              label="Error"
              accessibilityLabel="Error"
              onPress={() => IOToast.error("Error")}
            />
            <ButtonOutline
              fullWidth={true}
              label="Info"
              accessibilityLabel="Info"
              onPress={() => IOToast.info("Info")}
            />
            <ButtonOutline
              fullWidth={true}
              label="Success"
              accessibilityLabel="Success"
              onPress={() => IOToast.success("Success")}
            />
            <ButtonOutline
              fullWidth={true}
              label="Warning"
              accessibilityLabel="Warning"
              onPress={() => IOToast.warning("Warning")}
            />
            <ButtonOutline
              fullWidth={true}
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
