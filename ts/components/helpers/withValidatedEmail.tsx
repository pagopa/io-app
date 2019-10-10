/**
 * Provides a mechanism to display non-native modals (i.e. overlays)
 * on top of the root component.
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
