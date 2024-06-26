import {
  H3,
  H4,
  TextInput,
  TextInputPassword,
  TextInputValidation,
  VSpacer,
  useIOTheme
} from "@pagopa/io-app-design-system";
import React from "react";
import { DSComponentViewerBox } from "../components/DSComponentViewerBox";
import { DesignSystemScreen } from "../components/DesignSystemScreen";

export const DSTextFields = () => {
  const theme = useIOTheme();

  return (
    <DesignSystemScreen title={"Text Fields"}>
      <H3 color={theme["textHeading-default"]}>Text Fields</H3>

      <VSpacer />
      <H4 color={theme["textHeading-default"]}>Base input</H4>
      <VSpacer />

      <DSComponentViewerBox name="Base input">
        <InputComponentWrapper placeholder={"Base input"} />
      </DSComponentViewerBox>

      <DSComponentViewerBox name="Base input with value formatted">
        <InputComponentWrapper
          placeholder={"Base input"}
          inputType={"credit-card"}
          bottomMessage="Handles credit card input type"
        />
      </DSComponentViewerBox>

      <DSComponentViewerBox name="Base input with validation">
        <InputValidationComponentWrapper
          placeholder={"Base input"}
          onValidate={value => value.length > 2}
          bottomMessage="Inserisci almeno 3 caratteri"
        />
      </DSComponentViewerBox>

      <DSComponentViewerBox name="Base input with validation and error">
        <InputValidationComponentWrapper
          placeholder={"Base input"}
          onValidate={value => value.length > 2}
          bottomMessage="Inserisci almeno 3 caratteri"
          errorMessage="Troppo corto"
        />
      </DSComponentViewerBox>

      <DSComponentViewerBox name="Base input with icon">
        <InputComponentWrapper icon="amount" placeholder={"Base input"} />
      </DSComponentViewerBox>

      <VSpacer />
      <H4 color={theme["textHeading-default"]}>Secret input</H4>
      <VSpacer />
      <DSComponentViewerBox name="Secret input">
        <InputPasswordComponentWrapper placeholder={"Password"} />
      </DSComponentViewerBox>

      <VSpacer />
      <H4 color={theme["textHeading-default"]}>Disabled states</H4>
      <VSpacer />
      <DSComponentViewerBox name="">
        <InputComponentWrapper disabled placeholder={"Base input (Disabled)"} />
        <VSpacer />
        <InputComponentWrapper
          disabled
          placeholder={"Base input (Disabled with value)"}
          value={"Some value"}
        />
        <VSpacer />
        <InputPasswordComponentWrapper
          disabled
          placeholder={"Password input (Disabled)"}
        />
        <VSpacer />
        <InputValidationComponentWrapper
          disabled
          placeholder={"Validation input (Disabled)"}
          onValidate={value => value.length > 2}
        />
      </DSComponentViewerBox>
      <VSpacer />
    </DesignSystemScreen>
  );
};

const InputComponentWrapper = (
  props: Omit<
    React.ComponentProps<typeof TextInput>,
    "value" | "onChangeText"
  > & { value?: string }
) => {
  const [inputValue, setInputValue] = React.useState(props.value ?? "");

  return (
    <TextInput {...props} value={inputValue} onChangeText={setInputValue} />
  );
};

const InputValidationComponentWrapper = (
  props: Omit<
    React.ComponentProps<typeof TextInputValidation>,
    "value" | "onChangeText"
  > & { value?: string }
) => {
  const [inputValue, setInputValue] = React.useState(props.value ?? "");

  return (
    <TextInputValidation
      {...props}
      value={inputValue}
      onChangeText={setInputValue}
    />
  );
};

const InputPasswordComponentWrapper = (
  props: Omit<
    React.ComponentProps<typeof TextInputPassword>,
    "value" | "onChangeText"
  > & { value?: string }
) => {
  const [inputValue, setInputValue] = React.useState(props.value ?? "");

  return (
    <TextInputPassword
      {...props}
      value={inputValue}
      onChangeText={setInputValue}
    />
  );
};
