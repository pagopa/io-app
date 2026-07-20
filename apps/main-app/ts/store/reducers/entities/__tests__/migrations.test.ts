import { createMigrate } from "redux-persist";

import { migrations } from "../index";

describe("entities reducer migrations", () => {
  const migrate = createMigrate(migrations);

  it("should migrate the store to version 0 removing services.currentSelectedService", async () => {
    const previousState = {
      _persist: { version: -1, rehydrated: false },
      services: {
        currentSelectedService: { serviceId: "s1" },
        byId: { s1: { name: "Service 1" } }
      }
    };

    const newState = await migrate(previousState, 0);

    expect(newState).toEqual({
      _persist: { version: -1, rehydrated: false },
      services: {
        byId: { s1: { name: "Service 1" } }
      }
    });
  });

  it("should migrate the store to version 1 leaving the state untouched", async () => {
    const previousState = {
      _persist: { version: 0, rehydrated: false },
      messages: { byId: {} }
    };

    const newState = await migrate(previousState, 1);

    expect(newState).toEqual({
      _persist: { version: 0, rehydrated: false },
      messages: { byId: {} }
    });
  });

  it("should migrate the store to version 2 removing messages.allIds, messages.idsByServiceId and messages.byId", async () => {
    const previousState = {
      _persist: { version: 1, rehydrated: false },
      messages: {
        allIds: ["m1", "m2"],
        idsByServiceId: { s1: ["m1"] },
        byId: { m1: { serviceId: "s1" } },
        detailsById: {}
      },
      organizations: { all: [] }
    };

    const newState = await migrate(previousState, 2);

    expect(newState).toEqual({
      _persist: { version: 1, rehydrated: false },
      messages: {
        detailsById: {}
      },
      organizations: { all: [] }
    });
  });

  it("should migrate the store to version 2 defaulting messages to an empty object when messages is missing", async () => {
    const previousState = {
      _persist: { version: 1, rehydrated: false },
      organizations: { all: [] }
    };

    const newState = await migrate(previousState, 2);

    expect(newState).toEqual({
      _persist: { version: 1, rehydrated: false },
      messages: {},
      organizations: { all: [] }
    });
  });

  it("should migrate the store to version 3 removing the services section", async () => {
    const previousState = {
      _persist: { version: 2, rehydrated: false },
      services: { byId: {} },
      messages: { byId: {} }
    };

    const newState = await migrate(previousState, 3);

    expect(newState).toEqual({
      _persist: { version: 2, rehydrated: false },
      messages: { byId: {} }
    });
  });

  it("should migrate the store to version 4 removing messagesStatus", async () => {
    const previousState = {
      _persist: { version: 3, rehydrated: false },
      messagesStatus: { m1: "processed" },
      messages: { byId: {} }
    };

    const newState = await migrate(previousState, 4);

    expect(newState).toEqual({
      _persist: { version: 3, rehydrated: false },
      messages: { byId: {} }
    });
  });

  it("should migrate the store to version 5 removing the organizations section", async () => {
    const previousState = {
      _persist: { version: 4, rehydrated: false },
      organizations: {
        all: [{ fiscalCode: "12345678901", name: "Organization 1" }],
        nameByFiscalCode: { "12345678901": "Organization 1" }
      },
      messages: { byId: {} },
      paymentByRptId: {}
    };

    const newState = await migrate(previousState, 5);

    expect(newState).toEqual({
      _persist: { version: 4, rehydrated: false },
      messages: { byId: {} },
      paymentByRptId: {}
    });
  });

  it("should migrate the store to version 5 without errors if organizations is already missing", async () => {
    const previousState = {
      _persist: { version: 4, rehydrated: false },
      messages: { byId: {} }
    };

    const newState = await migrate(previousState, 5);

    expect(newState).toEqual({
      _persist: { version: 4, rehydrated: false },
      messages: { byId: {} }
    });
  });
});
