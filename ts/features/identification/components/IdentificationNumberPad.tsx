import {
  BiometricsValidType,
  CodeInput,
  IconButton,
  NumberPad,
  VSpacer
} from "@pagopa/io-app-design-system";
import { ComponentProps, useCallback, useState } from "react";
import { View } from "react-native";
import I18n from "i18next";
import { isDevEnv } from "../../../utils/environment";

const PIN_LENGTH = 6;
const CODE_INPUT_ERROR_ANIMATION_DURATION = 500;
const CODE_INPUT_SUCCESS_CALLBACK_CALL_TIMEOUT = 250;

type BiometricConfigType =
  | {
      biometricType: BiometricsValidType;
      biometricAccessibilityLabel: string;
      onBiometricPress: () => Promise<void>;
    }
  | {
      biometricType?: undefined;
      biometricAccessibilityLabel?: undefined;
      onBiometricPress?: undefined;
    };
type IdentificationNumberPadProps = {
  pin: string;
  pinValidation: (success: boolean) => void;
  numberPadVariant: ComponentProps<typeof NumberPad>["variant"];
  biometricsConfig: BiometricConfigType;
};

export const IdentificationNumberPad = (
  props: IdentificationNumberPadProps
) => {
  const [value, setValue] = useState("");

  const { pin, pinValidation, numberPadVariant, biometricsConfig } = props;

  const onValueChange = useCallback((v: number) => {
    setValue(prev => (prev.length < PIN_LENGTH ? `${prev}${v}` : prev));
  }, []);

  const onDeletePress = useCallback(() => {
    setValue((prev: string) => prev.slice(0, -1));
  }, []);

  // Calling pinValidation after a timeout is neeed
  // to allow code input to refresh correctly,
  // and in case of error to see the shake animation.
  const onPinValidated = useCallback(
    (v: string) => {
      if (v === pin) {
        setTimeout(() => {
          pinValidation(true);
        }, CODE_INPUT_SUCCESS_CALLBACK_CALL_TIMEOUT);
        return true;
      } else {
        setTimeout(() => {
          pinValidation(false);
        }, CODE_INPUT_ERROR_ANIMATION_DURATION);
        return false;
      }
    },
    [pin, pinValidation]
  );

  // We don't need to handle the value change on code input,
  // only on number pad.
  const onCodeInputValueChange = useCallback(() => void 0, []);

  return (
    <>
      <View testID="code-input" style={{ alignItems: "center" }}>
        <CodeInput
          value={value}
          length={PIN_LENGTH}
          variant={numberPadVariant}
          onValueChange={onCodeInputValueChange}
          onValidate={onPinValidated}
        />
      </View>
      {isDevEnv && (
        <View
          style={{
            zIndex: 10,
            opacity: 0.75,
            alignSelf: "center",
            position: "absolute",
            /* Ugly magic number, but the position is nicer with this value */
            bottom: 38
          }}
        >
          <IconButton
            icon="unlocked"
            iconSize={16}
            color="contrast"
            onPress={() => {
              setValue(pin);
            }}
            accessibilityLabel={"Inserisci il PIN predefinito per sviluppatori"}
          />
        </View>
      )}
      <VSpacer size={48} />
      <View testID="number-pad">
        <NumberPad
          deleteAccessibilityLabel={I18n.t("global.buttons.delete")}
          onDeletePress={onDeletePress}
          onNumberPress={onValueChange}
          variant={numberPadVariant}
          {...biometricsConfig}
        />
      </View>
    </>
  );
};
