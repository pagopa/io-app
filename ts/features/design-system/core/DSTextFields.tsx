import {
  H4,
  TextInput,
  TextInputPassword,
  TextInputValidation,
  useIOTheme,
  VStack
} from "@pagopa/io-app-design-system";
import { ComponentProps, useState } from "react";
import { View } from "react-native";

import { DesignSystemScreen } from "../components/DesignSystemScreen";
import { DSComponentViewerBox } from "../components/DSComponentViewerBox";

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
            <DSComponentViewerBox name="Base input" reverse>
              <InputComponentWrapper placeholder={"Base input"} />
            </DSComponentViewerBox>

            <DSComponentViewerBox
              name="Base input with value formatted"
              reverse
            >
              <InputComponentWrapper
                bottomMessage="Handles credit card input type"
                inputType={"credit-card"}
                placeholder={"Base input"}
              />
            </DSComponentViewerBox>

            <DSComponentViewerBox name="Base input with validation" reverse>
              <InputValidationComponentWrapper
                bottomMessage="Inserisci almeno 3 caratteri"
                onValidate={value => value.length > 2}
                placeholder={"Base input"}
              />
            </DSComponentViewerBox>

            <DSComponentViewerBox
              name="Base input with validation and error"
              reverse
            >
              <InputValidationComponentWrapper
                bottomMessage="Inserisci almeno 3 caratteri"
                errorMessage="Troppo corto"
                onValidate={value => value.length > 2}
                placeholder={"Base input"}
              />
            </DSComponentViewerBox>

            <DSComponentViewerBox name="Base input with icon" reverse>
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
                onValidate={value => value.length > 2}
                placeholder={"Validation input (Disabled)"}
              />
            </VStack>
          </View>
        </VStack>
      </VStack>
    </DesignSystemScreen>
  );
};

const InputComponentWrapper = (
  props: Omit<ComponentProps<typeof TextInput>, "onChangeText" | "value"> & {
    value?: string;
  }
) => {
  const [inputValue, setInputValue] = useState(props.value ?? "");

  return (
    <TextInput {...props} onChangeText={setInputValue} value={inputValue} />
  );
};

const InputValidationComponentWrapper = (
  props: Omit<
    ComponentProps<typeof TextInputValidation>,
    "errorMessage" | "onChangeText" | "value"
  > & { errorMessage?: string; value?: string; }
) => {
  const [inputValue, setInputValue] = useState(props.value ?? "");

  return (
    <TextInputValidation
      {...props}
      errorMessage={props.errorMessage ?? "error"}
      onChangeText={setInputValue}
      value={inputValue}
    />
  );
};

const InputPasswordComponentWrapper = (
  props: Omit<
    ComponentProps<typeof TextInputPassword>,
    "onChangeText" | "value"
  > & { value?: string }
) => {
  const [inputValue, setInputValue] = useState(props.value ?? "");

  return (
    <TextInputPassword
      {...props}
      onChangeText={setInputValue}
      value={inputValue}
    />
  );
};
