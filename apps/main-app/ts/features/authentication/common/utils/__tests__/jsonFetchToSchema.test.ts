import { err, ok } from "neverthrow";
import { z } from "zod";

import { FetchResponse } from "../fetch";
import { jsonFetchToSchema } from "../jsonFetchToSchema";

const schema = z.array(z.string());

const jsonResponse = (status: number, body: unknown): Response =>
  ({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body)
  }) as unknown as Response;

describe("jsonFetchToSchema", () => {
  it("should return the parsed data when the response is ok and the body matches the schema", async () => {
    const requestPromise = Promise.resolve<FetchResponse>({
      type: "success",
      response: jsonResponse(200, ["a", "b"])
    });

    await expect(jsonFetchToSchema(requestPromise, schema)).resolves.toEqual(
      ok(["a", "b"])
    );
  });

  it("should return the transport-level reason and message when the request fails", async () => {
    const requestPromise = Promise.resolve<FetchResponse>({
      type: "failure",
      reason: "network-error",
      message: "Network Error"
    });

    await expect(jsonFetchToSchema(requestPromise, schema)).resolves.toEqual(
      err({ type: "network-error", message: "Network Error" })
    );
  });

  it("should return the HTTP status when the response status is not ok", async () => {
    const requestPromise = Promise.resolve<FetchResponse>({
      type: "success",
      response: jsonResponse(500, ["a", "b"])
    });

    await expect(jsonFetchToSchema(requestPromise, schema)).resolves.toEqual(
      err({
        type: "http-status",
        code: 500,
        message: "Unexpected HTTP status 500"
      })
    );
  });

  it("should return an invalid-json error when the body cannot be parsed as JSON", async () => {
    const response = {
      ok: true,
      status: 200,
      json: () => Promise.reject(new Error("Invalid JSON"))
    } as unknown as Response;

    const requestPromise = Promise.resolve<FetchResponse>({
      type: "success",
      response
    });

    await expect(jsonFetchToSchema(requestPromise, schema)).resolves.toEqual(
      err({
        type: "invalid-json",
        message: expect.stringContaining("Invalid JSON")
      })
    );
  });

  it("should return an invalid-schema error with a prettified message when the body does not match the schema", async () => {
    const requestPromise = Promise.resolve<FetchResponse>({
      type: "success",
      response: jsonResponse(200, { something: "wrong" })
    });

    await expect(jsonFetchToSchema(requestPromise, schema)).resolves.toEqual(
      err({
        type: "invalid-schema",
        message: expect.stringContaining("Invalid input")
      })
    );
  });

  it("should return the status of the last response when the retryable status persists", async () => {
    const requestPromise = Promise.resolve<FetchResponse>({
      type: "failure",
      reason: "retryable-status",
      message: "Received retryable status code 429",
      response: jsonResponse(429, {})
    });

    await expect(jsonFetchToSchema(requestPromise, schema)).resolves.toEqual(
      err({
        type: "retryable-status",
        code: 429,
        message: "Received retryable status code 429"
      })
    );
  });
});
