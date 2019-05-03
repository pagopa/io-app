import * as React from "react";
import { connect } from "react-redux";

import { none, Option, some } from "fp-ts/lib/Option";
import { Millisecond } from "italia-ts-commons/lib/units";
import { Toast } from "native-base";
import I18n from "../i18n";
import { GlobalState } from "../store/reducers/types";

interface OwnProps {
  exitApp: () => void;
}
type Props = ReturnType<typeof mapStateToProps> & OwnProps;
type State = {
  lastExitRequestTime: Option<Millisecond>;
  canExit: Option<boolean>;
};

/**
 * if the user presses back button twice in a time window of exitConfirmThreshold milliseconds
 * then exitApp event will be raised
 */
const exitConfirmThreshold = 2000 as Millisecond;

/**
 * Implements a component that show a toast if the app can be closed
 * If the user presses back again in exitConfirmThreshold milliseconds, exitApp will be executed
 */
class ExitAppComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      lastExitRequestTime: none,
      canExit: none
    };
  }

  /**
   * this component render nothing
   */
  public render() {
    return null;
  }

  /**
   * Updates the state only when necessary
   */
  public static getDerivedStateFromProps(
    nextProps: Props,
    prevState: State
  ): Partial<State> | null {
    // if no time is set, it is not eligible to exit
    // invert canExit if it is set
    if (nextProps.lastExitRequestTime.isNone()) {
      return prevState.canExit
        .map(_ => ({ ...prevState, canExit: none }))
        .toNullable();
    }
    // canExit is true when there is a previous back pressed
    // and the new one is at least exitConfirmThreshold milliseconds distant
    const canExit = some(
      prevState.lastExitRequestTime
        .chain(prev =>
          nextProps.lastExitRequestTime.map(
            next => next - prev < exitConfirmThreshold
          )
        )
        .getOrElse(false)
    );

    // update the status
    return {
      lastExitRequestTime: nextProps.lastExitRequestTime,
      canExit
    };
  }

  /**
   * if canExit has a value and it is false, this means the app should be closed
   * we need another back (closed in time) to fire the event
   */
  public componentDidUpdate() {
    this.state.canExit.map(
      canExit =>
        canExit
          ? this.props.exitApp()
          : Toast.show({ text: I18n.t("exit.pressAgain") })
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  lastExitRequestTime: state.exitApp.exitRequestTime
});

export default connect(mapStateToProps)(ExitAppComponent);
