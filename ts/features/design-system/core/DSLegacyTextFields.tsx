import { H4, IOColors, BodySmall, VSpacer } from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { useState } from "react";
import { View } from "react-native";

import { LabelledItem } from "../../../components/LabelledItem";
import { CreditCardDetector, SupportedBrand } from "../../../utils/creditCard";
import {
  CreditCardState,
  CreditCardStateKeys,
  INITIAL_CARD_FORM_STATE
} from "../../../utils/input";
import { DesignSystemScreen } from "../components/DesignSystemScreen";

export const DSLegacyTextFields = () => (
  <DesignSystemScreen title={"Legacy Text Fields"}>
    <LegacyTextFields />
  </DesignSystemScreen>
);

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
        overrideBorderColor={IOColors["success-500"]}
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
        overrideBorderColor={IOColors["error-600"]}
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
          iconColor={"error-500"}
          iconPosition="right"
          isValid={false}
          overrideBorderColor={IOColors["error-600"]}
          testID="PinFieldWarning"
        />
        <View
          style={{ position: "absolute", bottom: -25, left: 2 }}
          accessibilityElementsHidden={true}
          importantForAccessibility="no-hide-descendants"
        >
          <BodySmall weight="Regular" color="error-500">
            With two lines, this custom description breaks everything ¯\_(ツ)_/¯
          </BodySmall>
        </View>
      </View>

      <H4 style={{ marginBottom: 12, marginTop: 48 }}>Authentication</H4>

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

      <H4 style={{ marginBottom: 12, marginTop: 48 }}>Payments</H4>
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
