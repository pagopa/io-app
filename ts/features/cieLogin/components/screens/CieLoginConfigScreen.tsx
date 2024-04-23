import React, { useEffect } from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { ContentWrapper, OTPInput } from "@pagopa/io-app-design-system";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import CieLoginConfigScreenContent from "./CieLoginConfigScreenContent";

type PinViewProps = {
  pin: string;
  setPin: (pin: string) => void;
};
const PinView = (props: PinViewProps) => (
  <>
    <OTPInput
      secret
      value={props.pin}
      length={6}
      onValueChange={props.setPin}
    />
  </>
);

const CieLoginConfigScreen = () => {
  const [locked, setLocked] = React.useState(true);
  const [pin, setPin] = React.useState("");

  // constant day containig the current day in the format YYMMDD
  useEffect(() => {
    const day = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    if (pin === day) {
      setLocked(false);
    } else {
      setPin("");
    }
  }, [pin]);

  return (
    <BaseScreenComponent goBack={true} headerTitle={"CIE Login Settings"}>
      <SafeAreaView style={IOStyles.flex}>
        <ContentWrapper>
          {locked ? (
            <PinView pin={pin} setPin={setPin} />
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
