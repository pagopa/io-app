import I18n from "i18next";
import { useCallback, useState } from "react";
import { Calendar } from "react-native-calendar-events";

import CalendarsListContainer from "../../../../components/CalendarsListContainer";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import {
  preferredCalendarRemoveSuccess,
  preferredCalendarSaveSuccess
} from "../../../../store/actions/persistedPreferences";
import { useIODispatch } from "../../../../store/hooks";
import { ContextualHelpPropsMarkdown } from "../../../../utils/contextualHelp";

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "profile.preferences.calendar.contextualHelpTitle",
  body: "profile.preferences.calendar.contextualHelpContent"
};

/** Allows the user to select one of the device available Calendars */
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
      contextualHelpMarkdown={contextualHelpMarkdown}
      description={I18n.t("messages.cta.reminderCalendarSelect")}
      headerActionsProp={{ showHelp: true }}
      includeContentMargins
      title={{
        label: I18n.t("profile.preferences.list.preferred_calendar.title")
      }}
    >
      <LoadingSpinnerOverlay isLoading={isLoading}>
        <CalendarsListContainer
          onCalendarRemove={preferredCalendarRemoveSuccessDispatch}
          onCalendarSelected={preferredCalendarSaveSuccessDispatch}
          onCalendarsLoaded={onCalendarsLoaded}
        />
      </LoadingSpinnerOverlay>
    </IOScrollViewWithLargeHeader>
  );
};

export default CalendarsPreferencesScreen;
