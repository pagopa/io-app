import { ContentWrapper, OTPInput } from "@pagopa/io-app-design-system";
import { useEffect, useState } from "react";
import { SafeAreaView, ScrollView } from "react-native";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import CieLoginConfigScreenContent from "../components/CieLoginConfigScreenContent";

const PIN_LENGTH = 6;

type PinViewProps = {
  pin: string;
  setPin: (pin: string) => void;
};
const PinView = (props: PinViewProps) => (
  <>
    <OTPInput
      secret
      value={props.pin}
      length={PIN_LENGTH}
      onValueChange={props.setPin}
    />
  </>
);

const CieLoginConfigScreen = () => {
  const [locked, setLocked] = useState(true);
  const [pin, setPin] = useState("");

  // constant day containig the current day in the format YYMMDD
  useEffect(() => {
    const day = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    if (pin === day) {
      setLocked(false);
    } else if (pin.length === PIN_LENGTH) {
      setPin("");
    }
  }, [pin]);

  return (
    <BaseScreenComponent goBack={true} headerTitle={"CIE Login Settings"}>
      <SafeAreaView style={{ flex: 1 }}>
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
