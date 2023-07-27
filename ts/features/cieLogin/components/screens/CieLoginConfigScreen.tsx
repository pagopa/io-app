import React, { useCallback } from "react";
import {
  Button,
  InputAccessoryView,
  Platform,
  SafeAreaView,
  ScrollView,
  View
} from "react-native";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { ContentWrapper } from "../../../../components/core/ContentWrapper";
import CiePinpad from "../../../../components/CiePinpad";
import { IOColors } from "../../../../components/core/variables/IOColors";
import CieLoginConfigScreenContent from "./CieLoginConfigScreenContent";

const CieLoginConfigScreen = () => {
  const [locked, setLockec] = React.useState(true);
  const [pin, setPin] = React.useState("");

  const onSubmit = useCallback((pin: string) => {
    // constant day containig the current day in the format YYMMDD
    const day = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    if (pin === day) {
      setLockec(false);
    } else {
      setPin("");
    }
  }, []);

  return (
    <BaseScreenComponent goBack={true} headerTitle={"CIE Login Settings"}>
      <SafeAreaView style={IOStyles.flex}>
        <ContentWrapper>
          {locked ? (
            <>
              <CiePinpad
                pin={pin}
                pinLength={6}
                onPinChanged={setPin}
                InputAccessoryViewID="pinInputId"
                onSubmit={onSubmit}
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
                      onPress={() => onSubmit(pin)}
                      title="Sblocca"
                      accessibilityLabel="Premi qui per sbloccare"
                    />
                  </View>
                </InputAccessoryView>
              )}
            </>
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
