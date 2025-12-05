import { OTPInput } from "@pagopa/io-app-design-system";
import { useEffect, useState } from "react";
import { IOScrollViewWithLargeHeader } from "../../../../../components/ui/IOScrollViewWithLargeHeader";
import CieLoginConfigScreenContent from "../components/CieLoginConfigScreenContent";

const PIN_LENGTH = 6;

type PinViewProps = {
  pin: string;
  setPin: (pin: string) => void;
};
const PinView = (props: PinViewProps) => (
  <OTPInput
    secret
    value={props.pin}
    length={PIN_LENGTH}
    onValueChange={props.setPin}
  />
);

/**
 * @deprecated Use one of the `IOScrollView…` components instead.
 */
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
    <IOScrollViewWithLargeHeader
      title={{ label: "CIE Login Settings" }}
      testID="CieLoginConfigScreen"
      includeContentMargins
    >
      {locked ? (
        <PinView pin={pin} setPin={setPin} />
      ) : (
        <CieLoginConfigScreenContent />
      )}
    </IOScrollViewWithLargeHeader>
  );
};

export default CieLoginConfigScreen;
