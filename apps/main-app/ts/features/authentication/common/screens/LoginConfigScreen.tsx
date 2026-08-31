import { OTPInput } from "@io-app/design-system";
import { useIsFocused } from "@react-navigation/native";
import i18n from "i18next";
import { useState } from "react";

import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { LoginConfigScreenContent } from "../components/LoginConfigScreenContent";

const PIN_LENGTH = 6;

export const LoginConfigScreen = () => {
  const [locked, setLocked] = useState(true);
  const [pin, setPin] = useState("");

  const isFocused = useIsFocused();

  const handleChangePin = (newPin: string) => {
    setPin(newPin);
  };

  const handleValidatePin = (newPin: string): boolean => {
    const day = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    const isValid = newPin === day;

    if (isValid) {
      setLocked(false);
    }
    return isValid;
  };

  return (
    <IOScrollViewWithLargeHeader
      includeContentMargins
      // eslint-disable-next-line i18next/no-literal-string
      title={{ label: "Login Settings" }}
    >
      {locked ? (
        <OTPInput
          // eslint-disable-next-line i18next/no-literal-string
          accessibilityLabel="Campo di inserimento per pin"
          accessibilityValueText={({ valueLength, length }) =>
            i18n.t("global.accessibility.inputDigitCounter", {
              valueLength,
              length
            })
          }
          autoFocus={isFocused}
          errorMessage="Wrong pin"
          length={PIN_LENGTH}
          onValidate={handleValidatePin}
          onValueChange={handleChangePin}
          secret
          value={pin}
        />
      ) : (
        <LoginConfigScreenContent />
      )}
    </IOScrollViewWithLargeHeader>
  );
};
