import { ComponentProps } from "react";
import { TextInputProps } from "react-native";
import { TextInputBase } from "../../components/textInput/TextInputBase";
import { InputType } from "../types";

export type RNTextInputProps = Pick<
  TextInputProps,
  | "keyboardType"
  | "inputMode"
  | "textContentType"
  | "autoComplete"
  | "returnKeyType"
  | "autoCapitalize"
  | "autoCorrect"
  | "inputAccessoryViewID"
>;

type InputProps = Pick<
  ComponentProps<typeof TextInputBase>,
  "textInputProps"
> & {
  valueFormat?: (value: string) => string;
  textInputProps?: RNTextInputProps;
};

export const getInputPropsByType = (
  type: InputType
): InputProps | undefined => {
  switch (type) {
    case "credit-card":
      return {
        valueFormat: v => v.replace(/\D/g, "").replace(/\d{4}?(?=.)/g, "$& "),
        textInputProps: {
          autoComplete: "cc-number",
          keyboardType: "numeric",
          textContentType: "creditCardNumber",
          inputMode: "numeric",
          returnKeyType: "done"
        }
      };
    case "iban":
      return {
        valueFormat: v => v.replace(/\s/g, "").replace(/.{4}/g, "$& ").trim(),
        textInputProps: {
          autoComplete: "off",
          keyboardType: "default",
          textContentType: "none",
          inputMode: "text",
          returnKeyType: "done",
          autoCapitalize: "characters"
        }
      };
    default:
      return undefined;
  }
};
