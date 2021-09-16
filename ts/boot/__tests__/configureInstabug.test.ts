import Instabug from "instabug-reactnative";

import {
  setInstabugSupportTokenAttribute,
  setInstabugDeviceIdAttribute,
  setInstabugUserAttribute
} from "../configureInstabug";

describe("setInstabugDeviceIdAttribute", () => {
  it("should set `deviceUniqueID` attribute when is defined", () => {
    const spySet = spyOn(Instabug, "setUserAttribute");
    const spyRemove = spyOn(Instabug, "removeUserAttribute");

    setInstabugDeviceIdAttribute("abcd");

    expect(spySet).toHaveBeenCalledTimes(1);
    expect(spySet).toHaveBeenCalledWith("deviceUniqueID", "abcd");
    expect(spyRemove).not.toHaveBeenCalled();
  });

  it("should remove `deviceUniqueID` attribute when is not defined", () => {
    const spySet = spyOn(Instabug, "setUserAttribute");
    const spyRemove = spyOn(Instabug, "removeUserAttribute");

    setInstabugDeviceIdAttribute(undefined);

    expect(spySet).toHaveBeenCalledTimes(0);
    expect(spyRemove).toHaveBeenCalledTimes(1);
    expect(spyRemove).toHaveBeenCalledWith("deviceUniqueID");
  });
});

describe("setInstabugSupportTokenAttribute", () => {
  const supportToken = { access_token: "xyz", expires_in: 10 };

  it("should set `deviceUniqueID` attribute when is defined", () => {
    const spySet = spyOn(Instabug, "setUserAttribute");
    const spyRemove = spyOn(Instabug, "removeUserAttribute");

    setInstabugSupportTokenAttribute(supportToken);

    expect(spySet).toHaveBeenCalledTimes(1);
    expect(spySet).toHaveBeenCalledWith(
      "supportToken",
      supportToken.access_token
    );
    expect(spyRemove).not.toHaveBeenCalled();
  });

  it("should remove `deviceUniqueID` attribute when is not defined", () => {
    const spySet = spyOn(Instabug, "setUserAttribute");
    const spyRemove = spyOn(Instabug, "removeUserAttribute");

    setInstabugSupportTokenAttribute(undefined);

    expect(spySet).toHaveBeenCalledTimes(0);
    expect(spyRemove).toHaveBeenCalledTimes(1);
    expect(spyRemove).toHaveBeenCalledWith("supportToken");
  });
});

describe("setInstabugUserAttribute", () => {
  it("should call setUserAttribute with the key and value", () => {
    const spySet = spyOn(Instabug, "setUserAttribute");
    const spyRemove = spyOn(Instabug, "removeUserAttribute");

    setInstabugUserAttribute("activeScreen", "зелёный паспорт");

    expect(spySet).toHaveBeenCalledTimes(1);
    expect(spySet).toHaveBeenCalledWith("activeScreen", "зелёный паспорт");
    expect(spyRemove).not.toHaveBeenCalled();
  });
});
