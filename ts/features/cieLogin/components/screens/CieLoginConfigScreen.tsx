import React from "react";
import { SafeAreaView, ScrollView } from "react-native";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { ContentWrapper } from "../../../../components/core/ContentWrapper";
import CiePinpad from "../../../../components/CiePinpad";
import CieLoginConfigScreenContent from "./CieLoginConfigScreenContent";

const CieLoginConfigScreen = () => {
  const [locked, setLockec] = React.useState(true);
  const [pin, setPin] = React.useState("");
  return (
    <BaseScreenComponent goBack={true} headerTitle={"CIE Login Settings"}>
      <SafeAreaView style={IOStyles.flex}>
        <ScrollView>
          <ContentWrapper>
            {locked ? (
              <CiePinpad
                pin={pin}
                pinLength={6}
                onPinChanged={setPin}
                onSubmit={pin => {
                  // constant day containig the current day in the format YYMMDD
                  const day = new Date()
                    .toISOString()
                    .slice(2, 10)
                    .replace(/-/g, "");
                  if (pin === day) {
                    setLockec(false);
                  } else {
                    setPin("");
                  }
                }}
              />
            ) : (
              <CieLoginConfigScreenContent />
            )}
          </ContentWrapper>
        </ScrollView>
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default CieLoginConfigScreen;
