declare module "react-native-add-calendar-event" {
  export type EventConfig = {
    title: string;
    startDate?: string;
    endDate?: string;
    location?: string;
    allDay?: boolean;
    url?: string;
    notes?: string;
  };

  export type EventInfo = {
    calendarItemIdentifier: string;
    eventIdentifier: string;
  };

  export type EventCreationSuccess = {
    action: "SAVED";
  } & EventInfo;

  export type EventCreationFailure = {
    action: "CANCELED";
  };

  export type EventCreationResult = EventCreationSuccess | EventCreationFailure;

  export function presentEventCreatingDialog(
    eventConfig: EventConfig
  ): Promise<EventCreationResult>;
}
