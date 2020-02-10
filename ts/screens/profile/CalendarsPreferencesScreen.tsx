import * as React from "react";
import { Calendar } from "react-native-calendar-events";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import CalendarsListContainer from "../../components/CalendarsListContainer";
import LoadingSpinnerOverlay from "../../components/LoadingSpinnerOverlay";
import { ContextualHelpPropsMarkdown } from "../../components/screens/BaseScreenComponent";
import ScreenContent from "../../components/screens/ScreenContent";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import I18n from "../../i18n";
import { preferredCalendarSaveSuccess } from "../../store/actions/persistedPreferences";
import { Dispatch } from "../../store/actions/types";

type OwnProps = NavigationInjectedProps;

type Props = ReturnType<typeof mapDispatchToProps> & OwnProps;

type State = {
  isLoading: boolean;
};

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "profile.preferences.calendar.contextualHelpTitle",
  body: "profile.preferences.calendar.contextualHelpContent"
};

/**
 * Allows the user to select one of the device available Calendars
 */
class CalendarsPreferencesScreen extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: true
    };
  }

  private onCalendarSelected = (calendar: Calendar) => {
    this.props.preferredCalendarSaveSuccess(calendar);
    this.props.navigation.goBack();
  };

  private onCalendarsLoaded = () => {
    this.setState({ isLoading: false });
  };

  public render() {
    const { isLoading } = this.state;
    return (
      <LoadingSpinnerOverlay isLoading={isLoading}>
        <TopScreenComponent
          contextualHelpMarkdown={contextualHelpMarkdown}
          headerTitle={I18n.t("profile.preferences.title")}
          goBack={this.props.navigation.goBack}
        >
          <ScreenContent
            title={I18n.t("profile.preferences.list.preferred_calendar.title")}
            subtitle={I18n.t("messages.cta.reminderCalendarSelect")}
          >
            <CalendarsListContainer
              onCalendarSelected={this.onCalendarSelected}
              onCalendarsLoaded={this.onCalendarsLoaded}
            />
          </ScreenContent>
        </TopScreenComponent>
      </LoadingSpinnerOverlay>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  preferredCalendarSaveSuccess: (calendar: Calendar) =>
    dispatch(
      preferredCalendarSaveSuccess({
        preferredCalendar: calendar
      })
    )
});

export default connect(
  undefined,
  mapDispatchToProps
)(CalendarsPreferencesScreen);
