import {
  BiometricsValidType,
  CodeInput,
  IOStyles,
  IconButton,
  NumberPad,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { useCallback, useState } from "react";
import { View } from "react-native";
import I18n from "../../../i18n";
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
  numberPadVariant: "light" | "dark";
  biometricsConfig: BiometricConfigType;
};

export const IdentificationNumberPad = (
  props: IdentificationNumberPadProps
) => {
  const [value, setValue] = useState("");

  const { pin, pinValidation, numberPadVariant, biometricsConfig } = props;

  const onValueChange = useCallback((v: string) => {
    if (v.length <= PIN_LENGTH) {
      setValue(v);
    }
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
      <View style={IOStyles.alignCenter}>
        <CodeInput
          value={value}
          length={PIN_LENGTH}
          variant={"light"}
          onValueChange={onCodeInputValueChange}
          onValidate={onPinValidated}
        />
      </View>
      {isDevEnv && (
        <View
          accessible={false}
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden
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
            accessibilityLabel={"Insert valid pin button (dev only)"}
          />
        </View>
      )}
      <VSpacer size={48} />
      <View>
        <NumberPad
          value={value}
          deleteAccessibilityLabel={I18n.t("global.buttons.delete")}
          onValueChange={onValueChange}
          variant={numberPadVariant}
          {...biometricsConfig}
        />
      </View>
    </>
  );
};
