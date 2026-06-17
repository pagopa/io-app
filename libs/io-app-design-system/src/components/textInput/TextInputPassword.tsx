import { ComponentProps, useCallback, useState } from "react";
import { IconButton } from "../buttons";
import { TextInputBase } from "./TextInputBase";

type TextInputPasswordProps = Omit<
  ComponentProps<typeof TextInputBase>,
  "isPassword"
>;

export const TextInputPassword = (props: TextInputPasswordProps) => {
  const { onBlur, disabled } = props;
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const rightElement = (
    <IconButton
      icon={showPassword ? "eyeShow" : "eyeHide"}
      disabled={disabled}
      onPress={() => setShowPassword(v => !v)}
      accessibilityLabel="Toggle secret input"
    />
  );

  const onBlurHandler = useCallback(() => {
    setShowPassword(false);
    onBlur?.();
  }, [onBlur]);

  return (
    <TextInputBase
      {...props}
      onBlur={onBlurHandler}
      rightElement={rightElement}
      isPassword={!showPassword}
    />
  );
};
