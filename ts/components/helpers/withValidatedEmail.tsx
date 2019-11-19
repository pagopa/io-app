/**
 * A HOC to display the WrappedComponent when the email is validated, otherwise the RemindEmailValidationOverlay will be displayed
 */

import React from "react";
import { View } from "react-native";
import { NavigationEvents } from "react-navigation";
import { connect } from "react-redux";
import { withLightModalContext } from "../../components/helpers/withLightModalContext";
import RemindEmailValidationOverlay from "../../components/RemindEmailValidationOverlay";
import { LightModalContextInterface } from "../../components/ui/LightModal";
import { isEmailEditingAndValidationEnabled } from "../../config";
import { isProfileEmailValidatedSelector } from "../../store/reducers/profile";
import { GlobalState } from "../../store/reducers/types";
import { withConditionalView } from "./withConditionalView";

export type ModalProps = LightModalContextInterface;

/*
  ModalRemindEmailValidationOverlay is the component that allows viewing the email reminder via light modal.
  The light modal is activated via the onWillFocus listener of the NavigationEvents component.
  The light modal is hidden in two moments:
    - ModalRemindEmailValidationOverlay is unmounted
    - A navigation request is made (eg navigationBack) and the onWillBlur listener is activated
      */
class ModalRemindEmailValidationOverlay extends React.Component<ModalProps> {
  public componentWillUnmount() {
    this.props.hideModal();
  }

  public render() {
    return (
      <View>
        <NavigationEvents
          onWillBlur={this.props.hideModal}
          onWillFocus={() => {
            this.props.showModal(<RemindEmailValidationOverlay />);
          }}
        />
      </View>
    );
  }
}

const ConditionalView = withLightModalContext(
  ModalRemindEmailValidationOverlay
);

export type Props = ReturnType<typeof mapStateToProps>;

const mapStateToProps = (state: GlobalState) => {
  const isEmailValidated = isProfileEmailValidatedSelector(state);
  return {
    isEmailValidate: isEmailEditingAndValidationEnabled
      ? isEmailValidated
      : true
  };
};

export function withValidatedEmail<P>(
  WrappedComponent: React.ComponentType<P>
) {
  return connect(
    mapStateToProps,
    null
  )(
    withConditionalView(
      WrappedComponent,
      (props: Props) => props.isEmailValidate,
      ConditionalView
    )
  );
}
