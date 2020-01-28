/**
 * A HOC to display the WrappedComponent when the email is validated, otherwise the RemindEmailValidationOverlay will be displayed
 */

import { none } from "fp-ts/lib/Option";
import React from "react";
import { View } from "react-native";
import { NavigationEvents } from "react-navigation";
import { connect } from "react-redux";
import { withLightModalContext } from "../../components/helpers/withLightModalContext";
import RemindEmailValidationOverlay from "../../components/RemindEmailValidationOverlay";
import { LightModalContextInterface } from "../../components/ui/LightModal";
import { acknowledgeOnEmailValidation } from "../../store/actions/profile";
import { Dispatch } from "../../store/actions/types";
import { emailValidationSelector } from "../../store/reducers/emailValidation";
import { isProfileEmailValidatedSelector } from "../../store/reducers/profile";
import { GlobalState } from "../../store/reducers/types";
import { withConditionalView } from "./withConditionalView";

export type ModalProps = LightModalContextInterface &
  ReturnType<typeof mapDispatchToProps>;

/*
  ModalRemindEmailValidationOverlay is the component that allows viewing the email reminder via light modal.
  The light modal is activated via the onWillFocus listener of the NavigationEvents component.
  The light modal is hidden in two moments:
    - ModalRemindEmailValidationOverlay is unmounted
    - A navigation request is made (eg navigationBack) and the onWillBlur listener is activated
      */
class ModalRemindEmailValidationOverlay extends React.Component<ModalProps> {
  public componentWillUnmount() {
    this.hideModal();
  }

  private hideModal = () => {
    this.props.hideModal();
    // when the reminder modal will be closed
    // we set acknowledgeOnEmailValidation to none because we don't want
    // any feedback about the email validation
    // remember that only RemindEmailValidationOverlay sets it to some, because there
    // we want the user feedback
    this.props.dispatchAcknowledgeOnEmailValidation();
  };

  public render() {
    return (
      <View>
        <NavigationEvents
          onWillBlur={this.hideModal}
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
  const acknowledgeOnEmailValidated = emailValidationSelector(state)
    .acknowledgeOnEmailValidated;
  // we consider the email validated (-> hide the reminder screen) when
  // the profile has the email validated flag on ON AND (if it is some) when the user
  // knows about the validation completed
  return {
    isEmailValidated:
      isEmailValidated && acknowledgeOnEmailValidated.getOrElse(true)
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  dispatchAcknowledgeOnEmailValidation: () =>
    dispatch(acknowledgeOnEmailValidation(none))
});

export function withValidatedEmail<P>(
  WrappedComponent: React.ComponentType<P>
) {
  return connect(
    mapStateToProps,
    mapDispatchToProps
  )(
    withConditionalView(
      WrappedComponent,
      (props: Props) => props.isEmailValidated,
      ConditionalView
    )
  );
}
