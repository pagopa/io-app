import React, { useCallback, useState } from "react";
import { Calendar } from "react-native-calendar-events";
import CalendarsListContainer from "../../components/CalendarsListContainer";
import LoadingSpinnerOverlay from "../../components/LoadingSpinnerOverlay";
import { ContextualHelpPropsMarkdown } from "../../components/screens/BaseScreenComponent";
import I18n from "../../i18n";
import {
  preferredCalendarRemoveSuccess,
  preferredCalendarSaveSuccess
} from "../../store/actions/persistedPreferences";
import { IOScrollViewWithLargeHeader } from "../../components/ui/IOScrollViewWithLargeHeader";
import { useIODispatch } from "../../store/hooks";

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "profile.preferences.calendar.contextualHelpTitle",
  body: "profile.preferences.calendar.contextualHelpContent"
};

/**
 * Allows the user to select one of the device available Calendars
 */
const CalendarsPreferencesScreen = () => {
  const dispatch = useIODispatch();
  const [isLoading, setIsLoading] = useState(true);

  const preferredCalendarSaveSuccessDispatch = useCallback(
    (calendar: Calendar) =>
      dispatch(
        preferredCalendarSaveSuccess({
          preferredCalendar: calendar
        })
      ),
    [dispatch]
  );

  const preferredCalendarRemoveSuccessDispatch = useCallback(
    () => dispatch(preferredCalendarRemoveSuccess()),
    [dispatch]
  );

  const onCalendarsLoaded = useCallback(() => {
    setIsLoading(false);
  }, []);

  return (
    <IOScrollViewWithLargeHeader
      title={{
        label: I18n.t("profile.preferences.list.preferred_calendar.title")
      }}
      description={I18n.t("messages.cta.reminderCalendarSelect")}
      contextualHelpMarkdown={contextualHelpMarkdown}
      headerActionsProp={{ showHelp: true }}
    >
      <LoadingSpinnerOverlay isLoading={isLoading}>
        <CalendarsListContainer
          onCalendarSelected={preferredCalendarSaveSuccessDispatch}
          onCalendarRemove={preferredCalendarRemoveSuccessDispatch}
          onCalendarsLoaded={onCalendarsLoaded}
        />
      </LoadingSpinnerOverlay>
    </IOScrollViewWithLargeHeader>
  );
};

export default CalendarsPreferencesScreen;
