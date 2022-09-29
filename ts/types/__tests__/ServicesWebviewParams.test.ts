import * as E from "fp-ts/lib/Either";
import { ServicesWebviewParams } from "../ServicesWebviewParams";

const validParams = {
  serviceId: "service_id",
  url: "http://google.com"
};

const invalidParams1 = {
  url: "http://google.com"
};

const invalidParams2 = {
  serviceId: "service_id"
};

const invalidParams3 = {
  serviceId: "",
  url: "http://google.com"
};

describe("WebviewMessage", () => {
  it("Should recognize a valid payload for Params", () => {
    expect(E.isRight(ServicesWebviewParams.decode(validParams))).toBeTruthy();
  });

  it("Should recognize an invalid payload for Params", () => {
    expect(E.isRight(ServicesWebviewParams.decode(invalidParams1))).toBeFalsy();
  });

  it("Should recognize an invalid payload for Params", () => {
    expect(E.isRight(ServicesWebviewParams.decode(invalidParams2))).toBeFalsy();
  });

  it("Should recognize an invalid payload for Params", () => {
    expect(E.isRight(ServicesWebviewParams.decode(invalidParams3))).toBeFalsy();
  });
});
