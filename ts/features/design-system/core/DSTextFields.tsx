import {
  H4,
  TextInput,
  TextInputPassword,
  TextInputValidation,
  VStack,
  useIOTheme
} from "@pagopa/io-app-design-system";

import { ComponentProps, useState } from "react";
import { View } from "react-native";
import { DSComponentViewerBox } from "../components/DSComponentViewerBox";
import { DesignSystemScreen } from "../components/DesignSystemScreen";

export const DSTextFields = () => {
  const theme = useIOTheme();

  const sectionTitleMargin = 16;
  const componentMargin = 24;
  const sectionMargin = 40;

  return (
    <DesignSystemScreen title={"Text Fields"}>
      <VStack space={sectionMargin}>
        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>Base input</H4>

          <VStack space={componentMargin}>
            <DSComponentViewerBox reverse name="Base input">
              <InputComponentWrapper placeholder={"Base input"} />
            </DSComponentViewerBox>

            <DSComponentViewerBox
              reverse
              name="Base input with value formatted"
            >
              <InputComponentWrapper
                placeholder={"Base input"}
                inputType={"credit-card"}
                bottomMessage="Handles credit card input type"
              />
            </DSComponentViewerBox>

            <DSComponentViewerBox reverse name="Base input with validation">
              <InputValidationComponentWrapper
                placeholder={"Base input"}
                onValidate={value => value.length > 2}
                bottomMessage="Inserisci almeno 3 caratteri"
              />
            </DSComponentViewerBox>

            <DSComponentViewerBox
              reverse
              name="Base input with validation and error"
            >
              <InputValidationComponentWrapper
                placeholder={"Base input"}
                onValidate={value => value.length > 2}
                bottomMessage="Inserisci almeno 3 caratteri"
                errorMessage="Troppo corto"
              />
            </DSComponentViewerBox>

            <DSComponentViewerBox reverse name="Base input with icon">
              <InputComponentWrapper icon="amount" placeholder={"Base input"} />
            </DSComponentViewerBox>
          </VStack>
        </VStack>

        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>Secret input</H4>
          <InputPasswordComponentWrapper placeholder={"Password"} />
        </VStack>

        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>Disabled states</H4>
          <View>
            <VStack space={16}>
              <InputComponentWrapper
                disabled
                placeholder={"Base input (Disabled)"}
              />
              <InputComponentWrapper
                disabled
                placeholder={"Base input (Disabled with value)"}
                value={"Some value"}
              />
              <InputPasswordComponentWrapper
                disabled
                placeholder={"Password input (Disabled)"}
              />
              <InputValidationComponentWrapper
                disabled
                placeholder={"Validation input (Disabled)"}
                onValidate={value => value.length > 2}
              />
            </VStack>
          </View>
        </VStack>
      </VStack>
    </DesignSystemScreen>
  );
};

const InputComponentWrapper = (
  props: Omit<ComponentProps<typeof TextInput>, "value" | "onChangeText"> & {
    value?: string;
  }
) => {
  const [inputValue, setInputValue] = useState(props.value ?? "");

  return (
    <TextInput {...props} value={inputValue} onChangeText={setInputValue} />
  );
};

const InputValidationComponentWrapper = (
  props: Omit<
    ComponentProps<typeof TextInputValidation>,
    "value" | "onChangeText" | "errorMessage"
  > & { value?: string; errorMessage?: string }
) => {
  const [inputValue, setInputValue] = useState(props.value ?? "");

  return (
    <TextInputValidation
      {...props}
      value={inputValue}
      errorMessage={props.errorMessage ?? "error"}
      onChangeText={setInputValue}
    />
  );
};

const InputPasswordComponentWrapper = (
  props: Omit<
    ComponentProps<typeof TextInputPassword>,
    "value" | "onChangeText"
  > & { value?: string }
) => {
  const [inputValue, setInputValue] = useState(props.value ?? "");

  return (
    <TextInputPassword
      {...props}
      value={inputValue}
      onChangeText={setInputValue}
    />
  );
};
