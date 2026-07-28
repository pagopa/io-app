import { createMigrate } from "redux-persist";

import { migrations } from "../index";

describe("entities reducer migrations", () => {
  const migrate = createMigrate(migrations);

  it("should migrate the store to version 5 removing the organizations section", async () => {
    const previousState = {
      _persist: { version: 4, rehydrated: false },
      organizations: {
        all: [{ fiscalCode: "12345678901", name: "Organization 1" }],
        nameByFiscalCode: { "12345678901": "Organization 1" }
      },
      calendarEvents: { byMessageId: {} },
      paymentByRptId: {}
    };

    const newState = await migrate(previousState, 5);

    expect(newState).toEqual({
      _persist: { version: 4, rehydrated: false },
      calendarEvents: { byMessageId: {} },
      paymentByRptId: {}
    });
  });

  it("should migrate the store to version 5 without errors if organizations is already missing", async () => {
    const previousState = {
      _persist: { version: 4, rehydrated: false },
      calendarEvents: { byMessageId: {} }
    };

    const newState = await migrate(previousState, 5);

    expect(newState).toEqual({
      _persist: { version: 4, rehydrated: false },
      calendarEvents: { byMessageId: {} }
    });
  });
});
