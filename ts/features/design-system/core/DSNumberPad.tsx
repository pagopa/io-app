import * as React from "react";
import {
  CodeInput,
  H2,
  IOColors,
  ListItemSwitch,
  NumberPad,
  VSpacer,
  hexToRgba,
  LabelSmallAlt,
  IOVisualCostants,
  LabelLink,
  Pictogram,
  Body
} from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import { Alert, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PIN_LENGTH = 6;

export const DSNumberPad = () => {
  const [value, setValue] = React.useState("");
  const [darkBackground, setDarkBackground] = React.useState(false);

  const insets = useSafeAreaInsets();

  const navigation = useNavigation();

  const onValueChange = (v: string) => {
    if (v.length <= PIN_LENGTH) {
      setValue(v);
    }
  };

  React.useEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: darkBackground
          ? IOColors["blueIO-500"]
          : IOColors.white
      }
    });
  }, [darkBackground, navigation]);
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
          backgroundColor: darkBackground
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
          value={darkBackground}
          onSwitchValueChange={() => setDarkBackground(v => !v)}
        />
      </View>
      <View style={{ alignItems: "center" }}>
        <VSpacer size={16} />
        <Pictogram name="key" size={64} />
        <VSpacer size={8} />
        <H2 color={darkBackground ? "white" : "black"}>Ciao {`{name}`},</H2>
        <VSpacer size={8} />
        <Body color={darkBackground ? "white" : "black"}>
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
          <LabelSmallAlt color={darkBackground ? "white" : "black"}>
            {value}
          </LabelSmallAlt>
        </View>
        <CodeInput
          value={value}
          length={PIN_LENGTH}
          variant={darkBackground ? "light" : "dark"}
          onValueChange={onValueChange}
          onValidate={v => v === "123456"}
        />
      </View>
      <VSpacer size={48} />
      <View>
        <NumberPad
          value={value}
          deleteAccessibilityLabel="Delete"
          onValueChange={onValueChange}
          variant={darkBackground ? "dark" : "light"}
          biometricType="FACE_ID"
          biometricAccessibilityLabel="Face ID"
          onBiometricPress={() => Alert.alert("biometric")}
        />
        <VSpacer size={32} />
        <View style={{ alignItems: "center" }}>
          <LabelLink
            color={darkBackground ? "white" : "grey-700"}
            onPress={() => Alert.alert("Forgot unlock code")}
            accessibilityLabel=""
          >
            Hai dimenticato il codice di sblocco?
          </LabelLink>
        </View>
      </View>
    </View>
  );
};
