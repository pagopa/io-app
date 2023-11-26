import React, { useState } from "react";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { View } from "react-native";
import {
  H3,
  H4,
  IOColors,
  TextInput,
  TextInputPassword,
  TextInputValidation,
  VSpacer,
  useIOTheme
} from "@pagopa/io-app-design-system";
import { LabelledItem } from "../../../components/LabelledItem";
import { LabelSmall } from "../../../components/core/typography/LabelSmall";
import { H2 } from "../../../components/core/typography/H2";
import { CreditCardDetector, SupportedBrand } from "../../../utils/creditCard";
import {
  CreditCardState,
  CreditCardStateKeys,
  INITIAL_CARD_FORM_STATE
} from "../../../utils/input";
import { DesignSystemScreen } from "../components/DesignSystemScreen";
import { DSComponentViewerBox } from "../components/DSComponentViewerBox";

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

      <H3 color={theme["textHeading-default"]} weight={"Bold"}>
        Legacy Text Fields
      </H3>
      <VSpacer />
      <LegacyTextFields />
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

const LegacyTextFields = () => {
  /*
  ALL THE FOLLOWING STATES are declared for
  demo purposes in the Design System's section
  */
  const [creditCard, setCreditCard] = useState<CreditCardState>(
    INITIAL_CARD_FORM_STATE
  );

  const detectedBrand: SupportedBrand = CreditCardDetector.validate(
    creditCard.pan
  );

  const updateState = (key: CreditCardStateKeys, value: string) => {
    setCreditCard({
      ...creditCard,
      [key]: O.fromPredicate((value: string) => value.length > 0)(value)
    });
  };

  return (
    <>
      <LabelledItem
        label={"Default text field"}
        isValid={undefined}
        accessibilityLabel={"Accessibility text of the TextField"}
        testID={"TextFieldDefault"}
        inputProps={{
          returnKeyType: "done",
          autoCapitalize: "none",
          keyboardType: "default"
        }}
      />

      <VSpacer size={24} />

      <LabelledItem
        label={"Default text field with placeholder"}
        isValid={undefined}
        accessibilityLabel={"Accessibility text of the TextField"}
        testID={"TextFieldDefault"}
        inputProps={{
          returnKeyType: "done",
          autoCapitalize: "none",
          placeholder: "Placeholder value",
          keyboardType: "default"
        }}
      />

      <VSpacer size={24} />

      <LabelledItem
        label={"Text field with description"}
        description="Description under the text field"
        isValid={undefined}
        accessibilityLabel={"Accessibility text of the TextField"}
        testID={"TextFieldDefault"}
        inputProps={{
          returnKeyType: "done",
          autoCapitalize: "none",
          keyboardType: "default"
        }}
      />

      <VSpacer size={24} />

      <LabelledItem
        label={"Text field disabled"}
        isValid={undefined}
        accessibilityLabel={"Accessibility text of the TextField"}
        testID={"TextFieldDefault"}
        inputProps={{
          returnKeyType: "done",
          autoCapitalize: "none",
          disabled: true,
          keyboardType: "default"
        }}
      />

      <VSpacer size={24} />

      <LabelledItem
        isValid={true}
        label={"Text field valid"}
        accessibilityLabel={"Accessibility text of the TextField"}
        testID={"TextFieldDefault"}
        inputProps={{
          returnKeyType: "done",
          autoCapitalize: "none",
          keyboardType: "default"
        }}
        overrideBorderColor={IOColors.green}
      />

      <VSpacer size={24} />

      <LabelledItem
        isValid={false}
        label={"Text field invalid"}
        accessibilityLabel={"Accessibility text of the TextField"}
        testID={"TextFieldDefault"}
        inputProps={{
          returnKeyType: "done",
          autoCapitalize: "none",
          keyboardType: "default"
        }}
        overrideBorderColor={IOColors.red}
      />

      <VSpacer size={24} />

      <LabelledItem
        label={"Text field with icon"}
        icon="email"
        isValid={undefined}
        inputProps={{
          returnKeyType: "done",
          autoCapitalize: "none",
          keyboardType: "email-address"
        }}
      />

      <VSpacer size={24} />

      <LabelledItem
        label={"Insert password"}
        accessibilityLabel={"Accessibility label for password text field"}
        inputProps={{
          keyboardType: "default",
          secureTextEntry: true,
          contextMenuHidden: true
        }}
        isValid={undefined}
        testID="PasswordField"
      />

      <VSpacer size={24} />

      <LabelledItem
        label={"Insert PIN code"}
        accessibilityLabel={"Accessibility label for PIN code text field"}
        inputProps={{
          keyboardType: "default",
          maxLength: 6,
          secureTextEntry: true,
          returnKeyType: "done",
          contextMenuHidden: true
        }}
        isValid={undefined}
        testID="PinField"
      />

      <VSpacer size={24} />

      <View>
        <LabelledItem
          label={"Insert PIN code (error)"}
          accessibilityLabel={"Accessibility label for PIN code text field"}
          inputProps={{
            keyboardType: "number-pad",
            maxLength: 6,
            secureTextEntry: true,
            returnKeyType: "done",
            contextMenuHidden: true
          }}
          icon={"notice"}
          iconColor={"red"}
          iconPosition="right"
          isValid={false}
          overrideBorderColor={IOColors.red}
          testID="PinFieldWarning"
        />
        <View
          style={{ position: "absolute", bottom: -25, left: 2 }}
          accessibilityElementsHidden={true}
          importantForAccessibility="no-hide-descendants"
        >
          <LabelSmall weight="Regular" color="red">
            With two lines, this custom description breaks everything ¯\_(ツ)_/¯
          </LabelSmall>
        </View>
      </View>

      <H2
        color={"bluegrey"}
        weight={"SemiBold"}
        style={{ marginBottom: 12, marginTop: 48 }}
      >
        Authentication
      </H2>

      <LabelledItem
        label={"Username"}
        icon="profile"
        inputProps={{
          placeholder: "Username",
          returnKeyType: "done"
        }}
      />

      <VSpacer size={16} />

      <LabelledItem
        label={"Password"}
        icon="locked"
        inputProps={{
          placeholder: "Password",
          returnKeyType: "done",
          secureTextEntry: true
        }}
      />

      <H2
        color={"bluegrey"}
        weight={"SemiBold"}
        style={{ marginBottom: 12, marginTop: 48 }}
      >
        Payments
      </H2>
      <LabelledItem
        label={"Card number"}
        icon={detectedBrand.iconForm}
        imageStyle={{ width: 24, height: 24 }}
        inputMaskProps={{
          value: pipe(
            creditCard.pan,
            O.getOrElse(() => "")
          ),
          placeholder: "0000 0000 0000 0000",
          keyboardType: "numeric",
          returnKeyType: "done",
          maxLength: 23,
          type: "custom",
          options: {
            mask: "9999 9999 9999 9999 999",
            getRawValue: value1 => value1.replace(/ /g, "")
          },
          includeRawValueInChangeText: true,
          onChangeText: (_, value) => {
            if (value !== undefined) {
              updateState("pan", value);
            }
          }
        }}
        testID={"pan"}
      />
    </>
  );
};
