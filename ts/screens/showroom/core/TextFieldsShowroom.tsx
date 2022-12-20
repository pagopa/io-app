import * as React from "react";
import { View } from "react-native";
import { View as NBView } from "native-base";

import { ShowroomSection } from "../components/ShowroomSection";
import { LabelledItem } from "../../../components/LabelledItem";
import { IOColors } from "../../../components/core/variables/IOColors";
import { LabelSmall } from "../../../components/core/typography/LabelSmall";
import { H2 } from "../../../components/core/typography/H2";

export const TextFieldsShowroom = () => (
  <ShowroomSection title={"Text Fields"}>
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

    <NBView spacer={true} large={true} />

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

    <NBView spacer={true} large={true} />

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

    <NBView spacer={true} large={true} />

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

    <NBView spacer={true} large={true} />

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

    <NBView spacer={true} large={true} />

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

    <NBView spacer={true} large={true} />

    <LabelledItem
      label={"Text field with icon"}
      icon="io-envelope"
      isValid={undefined}
      inputProps={{
        returnKeyType: "done",
        autoCapitalize: "none",
        keyboardType: "email-address"
      }}
    />

    <NBView spacer={true} large={true} />

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

    <NBView spacer={true} large={true} />

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

    <NBView spacer={true} large={true} />

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
        icon={"io-warning"}
        iconColor={IOColors.red}
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
          When there are two lines, this custom description breaks everything
          ¯\_(ツ)_/¯
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
      icon="io-titolare"
      inputProps={{
        placeholder: "Username",
        returnKeyType: "done"
      }}
    />

    <NBView spacer={true} />

    <LabelledItem
      label={"Password"}
      icon="io-lucchetto"
      inputProps={{
        placeholder: "Password",
        returnKeyType: "done",
        secureTextEntry: true
      }}
    />
  </ShowroomSection>
);
