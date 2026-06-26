import { ComponentProps, JSX, ReactNode, useCallback, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { BiometricsValidType, Optional } from "../../utils/types";
import { IconButton } from "../buttons";
import { IOIconSizeScale, IOIcons } from "../icons";
import { ContentWrapper, VStack } from "../layout";
import { NumberButton, numberButtonStyles } from "./NumberButton";

type BiometricAuthProps =
  | {
      /**
       * Type of device biometric.
       */
      biometricType: BiometricsValidType;
      /**
       * Function to be executed when the biometric button is pressed.
       * @returns void
       */
      onBiometricPress: () => void;
      /**
       * This label will be read from ScreenReaders and give informations about biometric button.
       */
      biometricAccessibilityLabel: string;
    }
  | {
      biometricType?: never;
      onBiometricPress?: never;
      biometricAccessibilityLabel?: never;
    };

type NumberPadProps = {
  /**
   * Used to choose the component color variant between `dark` and `light`.
   *
   * The default value is `dark`.
   */
  variant?: ComponentProps<typeof NumberButton>["variant"];
  /**
   * This label will be read  from ScreenReaders and give informations about delete button.
   */
  deleteAccessibilityLabel: string;
  /**
   * This function is passed to all numeric buttons to handle their press action.
   * @param value
   * @returns void
   */
  onNumberPress: (value: number) => void;
  /**
   * This function is passed to the delete button to handle the action to trigger when it's pressed.
   *
   * @returns void
   */
  onDeletePress: () => void;
} & BiometricAuthProps;

const mapIconSpecByBiometric: Record<
  BiometricsValidType,
  { icon: IOIcons; size: IOIconSizeScale }
> = {
  FACE_ID: { icon: "biomFaceID", size: 32 },
  TOUCH_ID: { icon: "fingerprint", size: 24 },
  BIOMETRICS: { icon: "fingerprint", size: 24 }
};

/**
 * This component displays a custom numeric keyboard.
 *
 * It accepts an optional `biometricType` prop which enables an extra keyboard button that accepts a `onBiometricPress` prop used to handle the action to be executed when it's pressed.
 * @returns {JSX.Element} The rendered numeric keyboard component.
 */
export const NumberPad = ({
  variant = "primary",
  biometricType,
  biometricAccessibilityLabel,
  deleteAccessibilityLabel,
  onNumberPress,
  onBiometricPress,
  onDeletePress
}: NumberPadProps): JSX.Element => {
  /**
   * Renders the buttons row from a given array.
   */
  // eslint-disable-next-line arrow-body-style
  const renderButtonsRow = useCallback(
    (row: Array<Optional<number | string>>) =>
      row.map(item => {
        if (typeof item === "number") {
          return (
            <NumberButton
              key={item}
              number={item}
              onPress={onNumberPress}
              variant={variant}
            />
          );
        }

        if (item === "delete") {
          return (
            <ButtonWrapper key={item}>
              <IconButton
                icon="cancel"
                color={variant === "primary" ? "contrast" : "primary"}
                onPress={onDeletePress}
                accessibilityLabel={deleteAccessibilityLabel}
              />
            </ButtonWrapper>
          );
        }
        if (biometricType && mapIconSpecByBiometric[biometricType]) {
          return (
            <ButtonWrapper key={item}>
              <IconButton
                icon={mapIconSpecByBiometric[biometricType].icon}
                iconSize={mapIconSpecByBiometric[biometricType].size}
                color={variant === "primary" ? "contrast" : "primary"}
                onPress={onBiometricPress}
                accessibilityLabel={biometricAccessibilityLabel}
              />
            </ButtonWrapper>
          );
        }

        return <View key={"emptyElem"} style={numberButtonStyles.buttonSize} />;
      }),
    [
      biometricAccessibilityLabel,
      biometricType,
      deleteAccessibilityLabel,
      onBiometricPress,
      onDeletePress,
      onNumberPress,
      variant
    ]
  );

  // eslint-disable-next-line arrow-body-style
  const numberPad = useMemo(
    () => (
      <VStack space={16}>
        {[
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 9],
          [biometricType, 0, "delete"]
        ].map((row, i) => (
          <View key={i} style={styles.numberPad}>
            {renderButtonsRow(row)}
          </View>
        ))}
      </VStack>
    ),
    [biometricType, renderButtonsRow]
  );

  return <ContentWrapper>{numberPad}</ContentWrapper>;
};

const ButtonWrapper = ({ children }: { children: ReactNode }) => (
  <View
    style={[
      numberButtonStyles.buttonSize,
      { alignItems: "center", justifyContent: "center" }
    ]}
  >
    {children}
  </View>
);

const styles = StyleSheet.create({
  numberPad: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexGrow: 1
  }
});
