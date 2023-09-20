import React, { useCallback } from "react";
import {
  Button,
  InputAccessoryView,
  Platform,
  SafeAreaView,
  ScrollView,
  View
} from "react-native";
import { IOColors, ContentWrapper } from "@pagopa/io-app-design-system";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import CiePinpad from "../../../../components/CiePinpad";
import CieLoginConfigScreenContent from "./CieLoginConfigScreenContent";

type PinViewProps = {
  pin: string;
  setPin: (pin: string) => void;
  onSubmit: (pin: string) => void;
};
const PinView = (props: PinViewProps) => (
  <>
    <CiePinpad
      pin={props.pin}
      pinLength={6}
      onPinChanged={props.setPin}
      InputAccessoryViewID="pinInputId"
      onSubmit={props.onSubmit}
    />
    {Platform.OS === "ios" && (
      <InputAccessoryView
        backgroundColor={IOColors.greyUltraLight}
        nativeID={"pinInputId"}
      >
        <View
          style={[
            IOStyles.flex,
            IOStyles.horizontalContentPadding,
            { justifyContent: "flex-end", flexDirection: "row" }
          ]}
        >
          <Button
            onPress={() => props.onSubmit(props.pin)}
            title="Sblocca"
            accessibilityLabel="Premi qui per sbloccare"
          />
        </View>
      </InputAccessoryView>
    )}
  </>
);

const CieLoginConfigScreen = () => {
  const [locked, setLocked] = React.useState(true);
  const [pin, setPin] = React.useState("");

  const onSubmit = useCallback((pin: string) => {
    // constant day containig the current day in the format YYMMDD
    const day = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    if (pin === day) {
      setLocked(false);
    } else {
      setPin("");
    }
  }, []);

  return (
    <BaseScreenComponent goBack={true} headerTitle={"CIE Login Settings"}>
      <SafeAreaView style={IOStyles.flex}>
        <ContentWrapper>
          {locked ? (
            <PinView pin={pin} setPin={setPin} onSubmit={onSubmit} />
          ) : (
            <ScrollView>
              <CieLoginConfigScreenContent />
            </ScrollView>
          )}
        </ContentWrapper>
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default CieLoginConfigScreen;
