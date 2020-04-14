import { none, Option, some } from "fp-ts/lib/Option";
import { BugReporting, dismissType } from "instabug-reactnative";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import {
  instabugReportClosed,
  instabugReportOpened
} from "../../store/actions/debug";
import { updateInstabugUnreadMessages } from "../../store/actions/instabug";

export type InstabugHelperProps = ReturnType<typeof mapDispatchToProps>;

type State = Readonly<{
  reportType: Option<BugReporting.reportType>;
}>;

export type IProps = Readonly<{
  openInstabugReport: () => void;
  setReportType: (type: BugReporting.reportType) => void;
  getReportType: () => Option<BugReporting.reportType>;
}>;

const mapDispatchToProps = (dispatch: Dispatch) => ({
  reportOpen: (type: string) => dispatch(instabugReportOpened({ type })),
  reportClosed: (type: string, how: string) =>
    dispatch(instabugReportClosed({ type, how })),
  updateMessagesCounter: () => dispatch(updateInstabugUnreadMessages())
});

export function withInstabugHelper<P>(
  WrappedComponent: React.ComponentType<P>
) {
  class HOC extends React.PureComponent<InstabugHelperProps, State> {
    constructor(props: InstabugHelperProps) {
      super(props);
      this.state = {
        reportType: none
      };
    }

    private setReportType = (type: BugReporting.reportType) => {
      this.setState({ reportType: some(type) });
    };

    private getReportType = () => this.state.reportType;

    private openInstabugReport = () => {
      if (this.state.reportType.isSome()) {
        this.setState({ reportType: none });
        this.props.reportOpen(this.state.reportType.value.toString());

        BugReporting.showWithOptions(this.state.reportType.value, [
          BugReporting.option.commentFieldRequired,
          BugReporting.option.emailFieldHidden
        ]);
      }
    };

    public componentDidMount() {
      // Register to the instabug dismiss event. (https://docs.instabug.com/docs/react-native-bug-reporting-event-handlers#section-after-dismissing-instabug)
      // This event is fired when chat or bug screen is dismissed
      BugReporting.onSDKDismissedHandler((dismiss: dismissType) => {
        // Due an Instabug library bug, we can't use the report parameter because it always has "bug" as value.
        // We need to differentiate the type of report then use instabugReportType
        if (this.state.reportType.isSome()) {
          this.props.reportClosed(
            this.state.reportType.value.toString(),
            dismiss.toString()
          );
          // when user dismisses instabug report (chat or bug) we update the unread messages counter.
          // This is because user could have read or reply to some messages
          this.props.updateMessagesCounter();
        }
      });
    }

    public render() {
      return (
        <WrappedComponent
          {...this.props as InstabugHelperProps & P}
          openInstabugReport={this.openInstabugReport}
          setReportType={this.setReportType}
          getReportType={this.getReportType}
        />
      );
    }
  }

  return connect(
    undefined,
    mapDispatchToProps
  )(HOC);
}
