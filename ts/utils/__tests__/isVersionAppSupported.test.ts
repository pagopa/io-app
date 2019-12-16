import { ServerInfo } from "../../../definitions/backend/ServerInfo";
import { isVersionAppSupported } from "../isVersionAppSupported";

describe("isVersionAppSupported", () => {
  it("is supported", () => {
    const backendInfo: ServerInfo = {
      version: "123",
      minAppVersion: "0.0.0"
    };
    expect(isVersionAppSupported(backendInfo, "1.2")).toEqual(true);
  });

  it("not supported", () => {
    const backendInfo: ServerInfo = {
      version: "123",
      minAppVersion: "1.4.0"
    };
    expect(isVersionAppSupported(backendInfo, "1.2")).toEqual(false);
  });

  it("undefined then supported", () => {
    const backendInfo = undefined;
    expect(isVersionAppSupported(backendInfo, "1.2")).toEqual(true);
  });
});
