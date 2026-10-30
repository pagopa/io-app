import { IOToast } from "@io-app/design-system";
import * as Calendar from "expo-calendar";
import I18n from "i18next";
import { Alert, AlertButton } from "react-native";
import { expectSaga } from "redux-saga-test-plan";
import { takeLeading } from "typed-redux-saga/macro";

import { addCalendarEvent } from "../../../../store/actions/calendarEvents";
import { addCalendarEventRequest } from "../../store/actions";
import { handleAddCalendarEvent } from "../handleAddCalendarEvent";

jest.mock("@io-app/design-system", () => ({
  IOToast: { success: jest.fn(), error: jest.fn() }
}));

jest.mock("expo-calendar", () => ({
  createEventAsync: jest.fn(),
  getEventsAsync: jest.fn()
}));

const messageId = "01HSG6GR1JT2E23AJ5RBTAMZZP";
const eventId = "event-id";
const existingEventId = "existing-event-id";
const title = "Promemoria per: Pagamento TARI";
const dueDate = new Date("2026-10-20T00:00:00.000Z");
const calendar = {
  id: "calendar-id",
  title: "Personale",
  allowsModifications: true,
  source: { name: "iCloud" }
} as Calendar.Calendar;
const existingEvent = {
  id: existingEventId,
  title,
  endDate: dueDate.toISOString()
} as Calendar.Event;
const request = addCalendarEventRequest({
  messageId,
  dueDate,
  title,
  calendar
});

const mockNativeCreateEvent = (calendarId: string) =>
  calendarId === calendar.id
    ? Promise.resolve(eventId)
    : Promise.reject(
        new Error(`Couldn't find calendar with given id: ${calendarId}`)
      );

const mockAlertPressing = (buttonText: string) =>
  jest
    .spyOn(Alert, "alert")
    .mockImplementation((_title, _message, buttons?: Array<AlertButton>) =>
      buttons?.find(button => button.text === buttonText)?.onPress?.()
    );

describe("handleAddCalendarEvent", () => {
  beforeEach(() => {
    jest.mocked(Calendar.getEventsAsync).mockResolvedValue([]);
    jest
      .mocked(Calendar.createEventAsync)
      .mockImplementation(mockNativeCreateEvent);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("should add the event to the selected calendar and store its id", async () => {
    await expectSaga(handleAddCalendarEvent, request)
      .put(addCalendarEvent({ messageId, eventId }))
      .run();

    expect(Calendar.getEventsAsync).toHaveBeenCalledWith(
      [calendar.id],
      expect.any(Date),
      dueDate
    );
    expect(Calendar.createEventAsync).toHaveBeenCalledWith(
      calendar.id,
      expect.objectContaining({ title })
    );
    expect(IOToast.success).toHaveBeenCalledTimes(1);
    expect(IOToast.error).not.toHaveBeenCalled();
  });

  it("should show an error toast and not store the event when the device calendar rejects the creation", async () => {
    jest
      .mocked(Calendar.createEventAsync)
      .mockRejectedValue(new Error("Native failure"));

    await expectSaga(handleAddCalendarEvent, request)
      .not.put.actionType(addCalendarEvent.toString())
      .run();

    expect(IOToast.error).toHaveBeenCalledWith(
      I18n.t("messages.cta.reminderAddFailure")
    );
    expect(IOToast.success).not.toHaveBeenCalled();
  });

  describe("when a matching event already exists", () => {
    beforeEach(() => {
      jest.mocked(Calendar.getEventsAsync).mockResolvedValue([existingEvent]);
    });

    const choices = [
      {
        name: "keep the existing event if the user chooses to",
        button: "messages.cta.reminderAlertKeep",
        storedEventId: existingEventId,
        createdEvents: 0
      },
      {
        name: "create a new event if the user chooses to",
        button: "messages.cta.reminderAlertAdd",
        storedEventId: eventId,
        createdEvents: 1
      },
      {
        name: "do nothing if the user cancels",
        button: "global.buttons.cancel",
        storedEventId: undefined,
        createdEvents: 0
      }
    ] as const;

    it.each(choices)(
      "should $name",
      async ({ button, storedEventId, createdEvents }) => {
        const alertSpy = mockAlertPressing(I18n.t(button));

        const { effects } = await expectSaga(
          handleAddCalendarEvent,
          request
        ).run();

        expect(alertSpy).toHaveBeenCalledWith(
          I18n.t("messages.cta.reminderAlertTitle"),
          I18n.t("messages.cta.reminderAlertDescription"),
          expect.any(Array),
          { cancelable: false }
        );
        expect(Calendar.createEventAsync).toHaveBeenCalledTimes(createdEvents);
        expect(effects.put?.map(effect => effect.payload.action)).toEqual(
          storedEventId === undefined
            ? undefined
            : [addCalendarEvent({ messageId, eventId: storedEventId })]
        );
      }
    );
  });

  describe("when run with takeLeading", () => {
    function* watchAddCalendarEvent() {
      yield* takeLeading(addCalendarEventRequest, handleAddCalendarEvent);
    }

    const pendingSteps = [
      {
        name: "the event is being created",
        setup: () =>
          jest
            .mocked(Calendar.createEventAsync)
            .mockReturnValue(new Promise(() => undefined)),
        expectSingleRun: () =>
          expect(Calendar.createEventAsync).toHaveBeenCalledTimes(1)
      },
      {
        name: "the existing event confirmation is pending",
        setup: () => {
          jest
            .mocked(Calendar.getEventsAsync)
            .mockResolvedValue([existingEvent]);
          jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
        },
        expectSingleRun: () => expect(Alert.alert).toHaveBeenCalledTimes(1)
      }
    ];

    it.each(pendingSteps)(
      "should ignore requests made while $name",
      async ({ setup, expectSingleRun }) => {
        setup();

        await expectSaga(watchAddCalendarEvent)
          .dispatch(request)
          .delay(10)
          .dispatch(request)
          .silentRun(50);

        expect(Calendar.getEventsAsync).toHaveBeenCalledTimes(1);
        expectSingleRun();
      }
    );

    it("should accept a new request once the previous one has ended", async () => {
      await expectSaga(watchAddCalendarEvent)
        .dispatch(request)
        .delay(10)
        .dispatch(request)
        .silentRun(50);

      expect(Calendar.createEventAsync).toHaveBeenCalledTimes(2);
    });
  });
});
