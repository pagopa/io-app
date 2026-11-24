import { renderHook } from "@testing-library/react-native";
import * as Calendar from "expo-calendar";

import { addCalendarEventRequest } from "../../store/actions";
import { useMessageCalendar } from "../useMessageCalendar";

const mockDispatch = jest.fn();
jest.mock("../../../../store/hooks", () => ({
  useIODispatch: () => mockDispatch,
  useIOSelector: () => undefined
}));

const messageId = "01HSG6GR1JT2E23AJ5RBTAMZZP";
const title = "Promemoria per: Pagamento TARI";
const dueDate = new Date("2026-10-20T00:00:00.000Z");
const calendar = {
  id: "calendar-id",
  title: "Personale",
  allowsModifications: true,
  source: { name: "iCloud" }
} as Calendar.Calendar;

describe("useMessageCalendar", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("addEventToCalendar", () => {
    it("should request to add the reminder of the message to the given calendar", () => {
      const { result } = renderHook(() => useMessageCalendar(messageId));

      result.current.addEventToCalendar(dueDate, title, calendar);

      expect(mockDispatch).toHaveBeenCalledWith(
        addCalendarEventRequest({ messageId, dueDate, title, calendar })
      );
    });
  });
});
