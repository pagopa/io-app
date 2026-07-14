import { ComponentProps, useCallback, useState } from "react";
import { IconButton } from "../buttons";
import { TextInputBase } from "./TextInputBase";

type TextInputPasswordProps = Omit<
  ComponentProps<typeof TextInputBase>,
  "isPassword"
> & {
  /**
   * Announced by screen readers for the button that shows/hides the password.
   * Required because this package has no i18n layer: the consumer owns the copy.
   */
  buttonAccessibilityLabel: string;
};

export const TextInputPassword = ({
  buttonAccessibilityLabel,
  ...props
}: TextInputPasswordProps) => {
  const { onBlur, disabled } = props;
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const rightElement = (
    <IconButton
      icon={showPassword ? "eyeShow" : "eyeHide"}
      disabled={disabled}
      onPress={() => setShowPassword(v => !v)}
      accessibilityLabel={buttonAccessibilityLabel}
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
