import { Form } from "native-base";
import * as React from "react";
import { TextInput } from "react-native";
import { Field, InjectedFormProps, reduxForm } from "redux-form";
import {
  getTraslatedFormFieldPropertyValue,
  renderNativeBaseInput,
  validators
} from "./utils";

export const FORM_NAME = "spidInformation";
const getCurrentFormFieldProperty = getTraslatedFormFieldPropertyValue(
  FORM_NAME
);

/**
 * A form to collect the user email address
 */
class SpidInformationForm extends React.Component<InjectedFormProps, never> {
  public render() {
    return (
      <Form>
        <TextInput
          name="email"
          component={renderNativeBaseInput}
          placeholder={getCurrentFormFieldProperty("email")("placeholder")}
          validate={[validators.email]}
          showError={true}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </Form>
    );
  }
}
export default reduxForm({
  form: FORM_NAME
})(SpidInformationForm);
