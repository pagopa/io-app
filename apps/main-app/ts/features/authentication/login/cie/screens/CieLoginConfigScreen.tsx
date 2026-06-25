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
    length={PIN_LENGTH}
    onValueChange={props.setPin}
    secret
    value={props.pin}
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
      includeContentMargins
      testID="CieLoginConfigScreen"
      // eslint-disable-next-line i18next/no-literal-string -- hidden developer-only screen, label not localized
      title={{ label: "CIE Login Settings" }}
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
