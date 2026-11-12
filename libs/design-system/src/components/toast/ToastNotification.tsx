import { StyleSheet, View } from "react-native";

import { useIOColors } from "../../context";
import { IODimensions } from "../../core";
import { Icon } from "../icons";
import { HSpacer } from "../layout";
import { ButtonText } from "../typography";
import { Toast } from "./types";

type Props = Pick<Toast, "icon" | "message" | "variant">;

const ToastNotification = ({ message, variant, icon }: Props) => {
  const toastColors = useIOColors().component.toast[variant];

  return (
    <View
      accessibilityLabel={message}
      accessibilityRole={"alert"}
      accessible={true}
      style={[
        styles.toast,
        {
          backgroundColor: toastColors.background,
          borderColor: toastColors.border
        }
      ]}
    >
      <ButtonText color={toastColors.foreground} style={styles.content}>
        {message}
      </ButtonText>
      {icon && (
        <>
          <HSpacer size={IODimensions.gap.toast.trailing} />
          <Icon
            color={toastColors.foreground}
            name={icon}
            size={IODimensions.size.icon.toast}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  toast: {
    borderRadius: IODimensions.radius.toast,
    borderCurve: "continuous",
    borderWidth: IODimensions.stroke.default,
    padding: IODimensions.padding.toast,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  content: {
    flexShrink: 1
  }
});

export { ToastNotification };
