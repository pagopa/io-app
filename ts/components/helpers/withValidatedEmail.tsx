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
import { GlobalState } from "../../store/reducers/types";
import { withConditionalView } from "./withConditionalView";

export type ModalProps = LightModalContextInterface;

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

const ConditionalView = withLightModalContext<ModalProps>(
  ModalRemindEmailValidationOverlay
);

export type Props = ReturnType<typeof mapStateToProps>;

const mapStateToProps = (state: GlobalState) => ({
  isValidEmail: !isEmailEditingAndValidationEnabled && !!state // TODO: get the proper isValidEmail from store
});

export function withValidatedEmail<P>(
  WrappedComponent: React.ComponentType<P>
) {
  return connect(
    mapStateToProps,
    null
  )(
    withConditionalView<P, Props, ModalProps>(
      WrappedComponent,
      (props: Props) => props.isValidEmail,
      ConditionalView
    )
  );
}
