import * as fetchUtils from "../../../../../utils/fetch";
import { createIDPayClient } from "../client";

const baseUrl = "https://localhost";
const apiVersion = "2.0";
const operationDate = "2026-10-21T10:34:50.294Z";
const timeline = {
  lastUpdate: "2026-10-21T11:57:09.192Z",
  operationList: [
    {
      operationType: "PAID_REFUND",
      operationDate,
      operationId: "paid-refund",
      eventId: "paid-event",
      amountCents: 7878
    },
    {
      operationType: "REJECTED_REFUND",
      operationDate,
      operationId: "rejected-refund",
      eventId: "rejected-event",
      amountCents: 7479
    },
    {
      operationType: "REVERSAL",
      operationDate,
      operationId: "reversal",
      accruedCents: 2007,
      amountCents: 9264,
      status: "AUTHORIZED",
      channel: "BARCODE"
    },
    {
      operationType: "TRANSACTION",
      operationDate,
      operationId: "cancelled",
      accruedCents: 764,
      amountCents: 7207,
      status: "CANCELLED",
      channel: "IDPAYCODE"
    },
    {
      operationType: "TRANSACTION",
      operationDate,
      operationId: "authorized",
      accruedCents: 999,
      amountCents: 7692,
      status: "AUTHORIZED",
      channel: "RTD"
    }
  ],
  pageNo: 0,
  pageSize: 5,
  totalElements: 16,
  totalPages: 4
};
const params = {
  bearerAuth: "token",
  "Accept-Language": "it-IT",
  initiativeId: "initiative",
  page: 0,
  size: 5,
  operationType: "TRANSACTION"
};

describe("createIDPayClient timeline", () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    jest.spyOn(fetchUtils, "defaultRetryingFetch").mockReturnValue(fetchMock);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    fetchMock.mockReset();
  });

  it.each([
    { name: "zero", totalElements: 0 },
    { name: "the previous upper bound", totalElements: 10 },
    { name: "just above the previous upper bound", totalElements: 11 },
    { name: "the reported total", totalElements: 16 },
    { name: "a large total", totalElements: 1000 }
  ])("decodes $name without changing the total", async ({ totalElements }) => {
    const payload = { ...timeline, totalElements };
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(payload), { status: 200 })
    );

    const result = await createIDPayClient(baseUrl, apiVersion).getTimeline(
      params
    );

    expect(result).toEqual({
      _tag: "Right",
      right: {
        status: 200,
        headers: expect.anything(),
        value: {
          ...payload,
          lastUpdate: new Date(payload.lastUpdate),
          operationList: payload.operationList.map(operation => ({
            ...operation,
            operationDate: new Date(operation.operationDate)
          }))
        }
      }
    });
    expect(fetchMock).toHaveBeenCalledWith(
      `${baseUrl}/idpay-itn/timeline/initiative?operationType=TRANSACTION&page=0&size=5`,
      expect.objectContaining({
        method: "get",
        headers: expect.objectContaining({
          Authorization: "Bearer token",
          "x-Api-Version": apiVersion,
          "Accept-Language": "it-IT"
        })
      })
    );
  });

  it.each([
    { name: "a negative total", changes: { totalElements: -1 } },
    { name: "a fractional total", changes: { totalElements: 1.5 } },
    { name: "a string total", changes: { totalElements: "16" } },
    { name: "a missing total", changes: { totalElements: undefined } },
    { name: "a null total", changes: { totalElements: null } },
    { name: "an invalid date", changes: { lastUpdate: "invalid" } },
    { name: "an invalid page", changes: { pageNo: -1 } },
    {
      name: "an invalid operation",
      changes: {
        operationList: [
          { ...timeline.operationList[0], amountCents: "invalid" }
        ]
      }
    }
  ])("rejects $name", async ({ changes }) => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ ...timeline, ...changes }), { status: 200 })
    );

    const result = await createIDPayClient(baseUrl, apiVersion).getTimeline(
      params
    );

    expect(result._tag).toBe("Left");
  });

  it.each([
    { name: "bad request", status: 400 },
    { name: "session expired", status: 401 },
    { name: "not found", status: 404 },
    { name: "rate limited", status: 429 },
    { name: "server error", status: 500 }
  ])("preserves the $name response", async ({ status }) => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({ code: "TIMELINE_GENERIC_ERROR", message: "error" }),
        {
          status
        }
      )
    );

    const result = await createIDPayClient(baseUrl, apiVersion).getTimeline(
      params
    );

    expect(result).toEqual({
      _tag: "Right",
      right: expect.objectContaining({ status })
    });
  });
});
