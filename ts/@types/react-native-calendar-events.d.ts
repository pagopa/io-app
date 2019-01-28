declare module "react-native-calendar-events" {
  // More here @https://github.com/wmcmahan/react-native-calendar-events#authorizationstatus
  export type AuthorizationStatus =
    | "denied"
    | "restricted"
    | "authorized"
    | "undetermined";

  export type Calendar = {
    id: string;
    title: string;
    type: string;
    source: string;
    isPrimary: boolean;
    allowsModifications: boolean;
    color: string;
  };

  export type StructuredLocation = {
    title: string,
    proximity: string,
    radius: number,
  }

  export type Alarm = {
    date: Date | number,
    structuredLocation: StructuredLocation
  }

  export type SaveEventDetails = {
    id?: string;
    calendarId: string;
    title: string;
    startDate: string;
    endDate: string;
    allDay: boolean;
    alarms?: Array<Alarm>
  };

  export type SaveEventOptions = {
    exceptionDate?: Date;
    futureEvents: boolean;
  };

  const RNCalendarEvents: {
    authorizationStatus(): Promise<AuthorizationStatus>;
    authorizeEventStore(): Promise<AuthorizationStatus>;
    findCalendars(): Promise<ReadonlyArray<Calendar>>;
    saveEvent(
      title: string,
      details: SaveEventDetails,
      options?: SaveEventOptions
    ): Promise<string>;
  };

  export default RNCalendarEvents;
}
