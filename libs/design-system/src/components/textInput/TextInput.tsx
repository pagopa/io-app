import { ComponentProps } from "react";

import { TextInputBase } from "./TextInputBase";

type TextInputProps = Omit<
  ComponentProps<typeof TextInputBase>,
  | "bottomMessageColor"
  | "errorMessage"
  | "isPassword"
  | "rightElement"
  | "status"
>;

export const TextInput = (props: TextInputProps) => (
  <TextInputBase {...props} />
);
