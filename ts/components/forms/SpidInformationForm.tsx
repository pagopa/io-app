import { Form } from "native-base";
import * as React from "react";
import { Field, InjectedFormProps, reduxForm } from "redux-form";

import I18n from "../../i18n";

import { renderNativeBaseInput, validators } from "./utils";

export const FORM_NAME = "spidInformation";

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
          placeholder={I18n.t("forms.spidInformation.fields.email.placeholder")}
          validate={[validators.email]}
          showError={true}
          // TODO: Check wich type definition force us to disable tslint
          // @https://www.pivotaltracker.com/story/show/157846397
          /* tslint:disable */
          keyboardType={"email-address" as "email-address"}
          autoCapitalize={"none" as "none"}
          /* tslint:enable */
        />
      </Form>
    );
  }
}
export default reduxForm({
  form: FORM_NAME
})(SpidInformationForm);
