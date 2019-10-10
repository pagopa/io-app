/**
 * A HOC to display the WrappedComponent when the email is validated, otherwise the RemindEmailValidationOverlay will be displayed
 */

import React from "react";
import { connect } from "react-redux";
import RemindEmailValidationOverlay from "../../components/RemindEmailValidationOverlay";
import { GlobalState } from "../../store/reducers/types";
import { withConditionalView } from "./withConditionalView";

export type Props = ReturnType<typeof mapStateToProps>;

const mapStateToProps = (state: GlobalState) => ({
  isValidEmail: !state // TODO: get the proper isValidEmail from store
});

export function withValidatedEmail<P>(
  WrappedComponent: React.ComponentType<P>
) {
  return connect(
    mapStateToProps,
    null
  )(
    withConditionalView(
      WrappedComponent,
      (props: Props) => props.isValidEmail,
      RemindEmailValidationOverlay
    )
  );
}
