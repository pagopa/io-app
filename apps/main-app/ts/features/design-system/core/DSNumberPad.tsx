import {
  Body,
  BodySmall,
  CodeInput,
  H2,
  hexToRgba,
  IOButton,
  IOColors,
  IOVisualCostants,
  ListItemSwitch,
  NumberPad,
  Pictogram,
  VSpacer
} from "@io-app/design-system";
import { useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { Alert, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PIN_LENGTH = 6;

export const DSNumberPad = () => {
  const [value, setValue] = useState("");
  const [primaryBackground, setPrimaryBackground] = useState(false);

  const insets = useSafeAreaInsets();

  const navigation = useNavigation();

  const onValueChange = useCallback((v: number) => {
    setValue(prev => (prev.length < PIN_LENGTH ? `${prev}${v}` : prev));
  }, []);

  const onDeletePress = useCallback(() => {
    setValue((prev: string) => prev.slice(0, -1));
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: primaryBackground
          ? IOColors["blueIO-500"]
          : IOColors.white
      }
    });
  }, [primaryBackground, navigation]);
  return (
    <View
      style={[
        {
          flexGrow: 1,
          justifyContent: "flex-end",
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingHorizontal: IOVisualCostants.appMarginDefault
        },
        {
          backgroundColor: primaryBackground
            ? IOColors["blueIO-500"]
            : IOColors.white
        }
      ]}
    >
      <View
        style={{
          backgroundColor: IOColors.white,
          borderRadius: 16,
          paddingHorizontal: 16,
          borderColor: hexToRgba(IOColors.black, 0.2),
          borderWidth: 1
        }}
      >
        <ListItemSwitch
          label="Attiva sfondo blu"
          onSwitchValueChange={() => setPrimaryBackground(v => !v)}
          value={primaryBackground}
        />
      </View>
      <View style={{ alignItems: "center" }}>
        <VSpacer size={16} />
        <Pictogram name="key" size={64} />
        <VSpacer size={8} />
        <H2 color={primaryBackground ? "white" : "black"}>Ciao {`{name}`},</H2>
        <VSpacer size={8} />
        <Body color={primaryBackground ? "white" : "black"}>
          {"per accedere usa il volto o il codice di sblocco"}
        </Body>
      </View>
      <VSpacer size={32} />
      <View style={{ alignItems: "center" }}>
        <View
          style={{
            position: "absolute",
            alignItems: "center",
            opacity: 0.5,
            bottom: -32
          }}
        >
          <BodySmall
            color={primaryBackground ? "white" : "black"}
            weight="Semibold"
          >
            {value}
          </BodySmall>
        </View>
        <CodeInput
          length={PIN_LENGTH}
          onValidate={v => v === "123456"}
          onValueChange={setValue}
          value={value}
          variant={primaryBackground ? "primary" : "neutral"}
        />
      </View>
      <VSpacer size={48} />
      <View>
        <NumberPad
          biometricAccessibilityLabel="Face ID"
          biometricType="FACE_ID"
          deleteAccessibilityLabel="Delete"
          onBiometricPress={() => Alert.alert("biometric")}
          onDeletePress={onDeletePress}
          onNumberPress={onValueChange}
          variant={primaryBackground ? "primary" : "neutral"}
        />
        <VSpacer size={32} />
        <View style={{ alignSelf: "center" }}>
          <IOButton
            color={primaryBackground ? "contrast" : "primary"}
            label="Hai dimenticato il codice di sblocco?"
            onPress={() => Alert.alert("Forgot unlock code")}
            variant="link"
          />
        </View>
      </View>
    </View>
  );
};
