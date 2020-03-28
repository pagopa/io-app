/**
 * A HOC to display the WrappedComponent when the email is validated, otherwise the RemindEmailValidationOverlay will be displayed
 */
import React from "react";
import {
  NavigationEvents,
  NavigationScreenProps,
  StackActions
} from "react-navigation";
import { connect } from "react-redux";
import { withLightModalContext } from "../../components/helpers/withLightModalContext";
import RemindEmailValidationOverlay from "../../components/RemindEmailValidationOverlay";
import { LightModalContextInterface } from "../../components/ui/LightModal";
import { navigateToEmailInsertScreen } from "../../store/actions/navigation";
import { isProfileEmailValidatedSelector } from "../../store/reducers/profile";
import { GlobalState } from "../../store/reducers/types";
import { withConditionalView } from "./withConditionalView";

/**
 * Light Modal used as wrapped component
 */

export type ModalProps = LightModalContextInterface &
  NavigationScreenProps &
  ReturnType<typeof mapStateToProps>;

type ModalState = Readonly<{
  /**
   * acknowledgeValidation is introduced to manage the case the email is validated while the app focus is on the RemindEmailValidationOverlay
   * So that the user can display the message "Email validated" and hide the modal only by:
   * - clicking on the "Continue" button
   * - clicking the cross icon at header right
   */
  acknowledgeValidation: boolean;
}>;

/**
 * ModalRemindEmailValidationOverlay is the component that allows viewing the email reminder via light modal.
 * The light modal is activated via the onWillFocus listener of the NavigationEvents component.
 * The light modal is hidden if:
 * - ModalRemindEmailValidationOverlay is unmounted
 * - A navigation request is made (eg navigationBack) and the onWillBlur listener is activated
 */
class ModalRemindEmailValidationOverlay extends React.Component<
  ModalProps,
  ModalState
> {
  constructor(props: ModalProps) {
    super(props);
    this.state = { acknowledgeValidation: false };
  }

  public componentWillUnmount() {
    if (this.state.acknowledgeValidation) {
      this.props.hideModal();
    }
  }

  private handleForcedClose = () => {
    // due a known bug (see https://github.com/react-navigation/react-navigation/issues/4867)
    // when the user is in onboarding phase and he asks to go to insert email screen
    // the navigation reset is forced
    const resetAction = StackActions.reset({
      index: 0,
      actions: [navigateToEmailInsertScreen()]
    });
    this.props.navigation.dispatch(resetAction);
  };

  public render() {
    return (
      <React.Fragment>
        <NavigationEvents
          onWillBlur={() => {
            this.props.hideModal();
          }}
          onWillFocus={() => {
            this.setState({ acknowledgeValidation: false });
            this.props.showModal(
              <RemindEmailValidationOverlay
                closeModalAndNavigateToEmailInsertScreen={() => {
                  this.setState({ acknowledgeValidation: true });
                  this.handleForcedClose();
                }}
                acknowledgeValidation={() => {
                  this.setState({ acknowledgeValidation: true });
                }}
                closeModal={() => {
                  this.setState({ acknowledgeValidation: true });
                  this.props.hideModal();
                }}
              />
            );
          }}
        />
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  // we consider the email validated (-> hide the reminder screen) when
  // the profile has the is_email_validated flag on ON
  isEmailValidated: isProfileEmailValidatedSelector(state)
});

const ConditionatedItem = connect(mapStateToProps)(
  withLightModalContext(ModalRemindEmailValidationOverlay)
);

/**
 * Conditional item
 */

export function withValidatedEmail<P>(
  WrappedComponent: React.ComponentType<P>
) {
  return connect(mapStateToProps)(
    withConditionalView(
      WrappedComponent,
      (props: ModalProps) => props.isEmailValidated,
      ConditionatedItem
    )
  );
}
