import * as Calendar from "expo-calendar";
import I18n from "i18next";
import { useCallback, useState } from "react";

import CalendarsListContainer from "../../../../components/CalendarsListContainer";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import {
  preferredCalendarRemoveSuccess,
  preferredCalendarSaveSuccess
} from "../../../../store/actions/persistedPreferences";
import { useIODispatch } from "../../../../store/hooks";

/** Allows the user to select one of the device available Calendars */
const CalendarsPreferencesScreen = () => {
  const dispatch = useIODispatch();
  const [isLoading, setIsLoading] = useState(true);

  const preferredCalendarSaveSuccessDispatch = useCallback(
    (calendar: Calendar.Calendar) =>
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
