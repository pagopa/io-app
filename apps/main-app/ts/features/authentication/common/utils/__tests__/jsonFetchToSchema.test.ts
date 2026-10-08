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

  it("should return the failure message when the request fails at the transport level", async () => {
    const requestPromise = Promise.resolve<FetchResponse>({
      type: "failure",
      reason: "network-error",
      message: "Network Error"
    });

    await expect(jsonFetchToSchema(requestPromise, schema)).resolves.toEqual(
      err("Network Error")
    );
  });

  it("should return a message when the HTTP response status is not ok", async () => {
    const requestPromise = Promise.resolve<FetchResponse>({
      type: "success",
      response: jsonResponse(500, ["a", "b"])
    });

    await expect(jsonFetchToSchema(requestPromise, schema)).resolves.toEqual(
      err("Unexpected HTTP status 500")
    );
  });

  it("should return a message when the body cannot be parsed as JSON", async () => {
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
      err(expect.stringContaining("Invalid JSON"))
    );
  });

  it("should return a prettified message when the body does not match the schema", async () => {
    const requestPromise = Promise.resolve<FetchResponse>({
      type: "success",
      response: jsonResponse(200, { something: "wrong" })
    });

    await expect(jsonFetchToSchema(requestPromise, schema)).resolves.toEqual(
      err(expect.stringContaining("Invalid input"))
    );
  });
});
