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
    expect(ServicesWebviewParams.decode(validParams).isRight()).toBeTruthy();
  });

  it("Should recognize an invalid payload for Params", () => {
    expect(ServicesWebviewParams.decode(invalidParams1).isRight()).toBeFalsy();
  });

  it("Should recognize an invalid payload for Params", () => {
    expect(ServicesWebviewParams.decode(invalidParams2).isRight()).toBeFalsy();
  });

  it("Should recognize an invalid payload for Params", () => {
    expect(ServicesWebviewParams.decode(invalidParams3).isRight()).toBeFalsy();
  });
});
