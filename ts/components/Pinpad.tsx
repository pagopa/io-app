import color from "color";
import * as React from "react";
import CodeInput from "react-native-confirmation-code-input";

import variables from "../theme/variables";
import { PinString } from "../types/PinString";
import { PIN_LENGTH } from "../utils/constants";

type OwnProps = Readonly<{
  autofocus: boolean;
  compareWithCode?: string;
  inactiveColor: string;
  activeColor: string;
  codeInputRef?: React.Ref<CodeInput>;
  onFulfill:
    | ((code: PinString) => void)
    | ((isValid: boolean, code: PinString) => void);
}>;

type Props = OwnProps;

/**
 * A customized CodeInput component.
 */
const Pinpad: React.SFC<Props> = props => {
  const {
    autofocus,
    compareWithCode,
    onFulfill,
    inactiveColor,
    activeColor,
    codeInputRef
  } = props;
  return (
    <CodeInput
      secureTextEntry={true}
      keyboardType="numeric"
      autoFocus={autofocus}
      className="border-b"
      codeLength={PIN_LENGTH}
      compareWithCode={compareWithCode || ""}
      cellBorderWidth={2}
      inactiveColor={color(inactiveColor)
        .rgb()
        .string()}
      activeColor={color(activeColor)
        .rgb()
        .string()}
      onFulfill={onFulfill}
      codeInputStyle={{ fontSize: variables.fontSize5, height: 56 }}
      ref={codeInputRef}
    />
  );
};

export default Pinpad;
