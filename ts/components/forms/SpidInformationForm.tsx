import { Form } from "native-base";
import * as React from "react";
import { connect } from "react-redux";
import {
  BaseFieldProps,
  BaseFieldsProps,
  Field,
  FormErrors,
  FormProps,
  InjectedFormProps,
  reduxForm,
  WrappedFieldProps
} from "redux-form";
import { Dispatch, ReduxProps } from "../../actions/types";
import IdpSelectionScreen from "../../screens/authentication/IdpSelectionScreen";
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
        <Field
          name="email"
          component={renderNativeBaseInput}
          placeholder={getCurrentFormFieldProperty("email")("placeholder")}
          validate={[validators.email]}
          showError
        />
      </Form>
    );
  }
}
export default reduxForm({
  form: FORM_NAME
})(SpidInformationForm);
