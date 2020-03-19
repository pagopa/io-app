/**
 * A HOC to display the WrappedComponent when the email is validated, otherwise the RemindEmailValidationOverlay will be displayed
 *
 * TODO: fix workaround introduced to solve bug on navigation during the onboarding (https://github.com/react-navigation/react-navigation/issues/4867)
 *       If the didFocus and the blur related events are not fired, at forward navigation the hideModal is dispatched manually
 */
import React from "react";
import { View } from "react-native";
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

export type ModalProps = LightModalContextInterface & NavigationScreenProps;

/*
  ModalRemindEmailValidationOverlay is the component that allows viewing the email reminder via light modal.
  The light modal is activated via the onWillFocus listener of the NavigationEvents component.
  The light modal is hidden in two moments:
    - ModalRemindEmailValidationOverlay is unmounted
    - A navigation request is made (eg navigationBack) and the onWillBlur listener is activated
      */
class ModalRemindEmailValidationOverlay extends React.Component<ModalProps> {
  constructor(props: ModalProps) {
    super(props);
  }
  public componentWillUnmount() {
    this.hideModal();
  }

  private hideModal = () => {
    this.props.hideModal();
  };

  private handleForcedClose = () => {
    // due a known bug (see https://github.com/react-navigation/react-navigation/issues/4867)
    // when the user is in onboarding phase and he asks to go to insert email screen
    // the navigation is forced reset
    const resetAction = StackActions.reset({
      index: 0,
      actions: [navigateToEmailInsertScreen()]
    });
    this.props.navigation.dispatch(resetAction);
  };

  public render() {
    return (
      <View>
        <NavigationEvents
          onWillBlur={() => {
            this.hideModal();
          }}
          onWillFocus={() => {
            this.props.showModal(
              <RemindEmailValidationOverlay
                closeModalAndNavigateToEmailInsertScreen={
                  this.handleForcedClose
                }
              />
            );
          }}
          onDidFocus={() => {
            this.setState({ forceNavigationEvents: false });
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
  // we consider the email validated (-> hide the reminder screen) when
  // the profile has the email validated flag on ON
  return {
    isEmailValidated: isProfileEmailValidatedSelector(state)
  };
};

export function withValidatedEmail<P>(
  WrappedComponent: React.ComponentType<P>
) {
  return connect(mapStateToProps)(
    withConditionalView(
      WrappedComponent,
      (props: Props) => props.isEmailValidated,
      ConditionalView
    )
  );
}
