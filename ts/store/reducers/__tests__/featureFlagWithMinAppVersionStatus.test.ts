import * as O from "fp-ts/lib/Option";
import DeviceInfo from "react-native-device-info";
import { BackendStatus } from "../../../../definitions/content/BackendStatus";
import { isPropertyWithMinAppVersionEnabled } from "../featureFlagWithMinAppVersionStatus";

describe("backend service Feature Flag (nativeLogin example) with min app version --- no optional config", () => {
  jest.spyOn(DeviceInfo, "getVersion").mockReturnValue("2.0.0.0");
  jest.spyOn(DeviceInfo, "getReadableVersion").mockReturnValue("2.0.0.0");

  const customConfigNativeLogin = (
    nativeLoginConfig: object
  ): O.Option<BackendStatus["config"]> =>
    O.some({
      nativeLogin: nativeLoginConfig
    }) as unknown as O.Option<BackendStatus["config"]>;

  it("should return (nativelogin) enabled --- eq min version & local flag enabled", () => {
    const store = customConfigNativeLogin({
      min_app_version: { ios: "2.0.0.0", android: "2.0.0.0" }
    });
    expect(
      isPropertyWithMinAppVersionEnabled({
        remoteConfig: store,
        mainLocalFlag: true,
        configPropertyName: "nativeLogin"
      })
    ).toBeTruthy();
  });

  it("should return (nativelogin) enabled --- < min version & local flag enabled", () => {
    const store = customConfigNativeLogin({
      min_app_version: { ios: "1.1.1.1", android: "1.1.1.1" }
    });
    expect(
      isPropertyWithMinAppVersionEnabled({
        remoteConfig: store,
        mainLocalFlag: true,
        configPropertyName: "nativeLogin"
      })
    ).toBeTruthy();
  });

  it("should return (nativelogin) disabled --- > min version & local flag enabled", () => {
    const store = customConfigNativeLogin({
      min_app_version: { ios: "2.0.0.1", android: "2.0.0.1" }
    });
    expect(
      isPropertyWithMinAppVersionEnabled({
        remoteConfig: store,
        mainLocalFlag: true,
        configPropertyName: "nativeLogin"
      })
    ).toBeFalsy();
  });

  it("should return (nativelogin) disabled --- eq min version & local flag disabled", () => {
    const store = customConfigNativeLogin({
      min_app_version: { ios: "2.0.0.0", android: "2.0.0.0" }
    });
    expect(
      isPropertyWithMinAppVersionEnabled({
        remoteConfig: store,
        mainLocalFlag: false,
        configPropertyName: "nativeLogin"
      })
    ).toBeFalsy();
  });

  it("should return (nativelogin) disabled --- < min version & local flag disabled", () => {
    const store = customConfigNativeLogin({
      min_app_version: { ios: "1.0.0.0", android: "1.0.0.0" }
    });
    expect(
      isPropertyWithMinAppVersionEnabled({
        remoteConfig: store,
        mainLocalFlag: false,
        configPropertyName: "nativeLogin"
      })
    ).toBeFalsy();
  });

  it("should return (nativelogin) disabled --- > min version & local flag disabled", () => {
    const store = customConfigNativeLogin({
      min_app_version: { ios: "3.0.0.0", android: "3.0.0.0" }
    });
    expect(
      isPropertyWithMinAppVersionEnabled({
        remoteConfig: store,
        mainLocalFlag: false,
        configPropertyName: "nativeLogin"
      })
    ).toBeFalsy();
  });

  it("should return (nativelogin) disabled --- min version undefined & local flag disabled", () => {
    const store = customConfigNativeLogin({});
    expect(
      isPropertyWithMinAppVersionEnabled({
        remoteConfig: store,
        mainLocalFlag: false,
        configPropertyName: "nativeLogin"
      })
    ).toBeFalsy();
  });

  it("should return (nativelogin) disabled --- min version undefined & local flag enabled", () => {
    const store = customConfigNativeLogin({});
    expect(
      isPropertyWithMinAppVersionEnabled({
        remoteConfig: store,
        mainLocalFlag: true,
        configPropertyName: "nativeLogin"
      })
    ).toBeFalsy();
  });

  it("should return (nativelogin) disabled --- nativelogin undefined & local flag enabled", () => {
    const store = O.some({
      config: {}
    }) as unknown as O.Option<BackendStatus["config"]>;
    expect(
      isPropertyWithMinAppVersionEnabled({
        remoteConfig: store,
        mainLocalFlag: true,
        configPropertyName: "nativeLogin"
      })
    ).toBeFalsy();
  });

  it("should return (nativelogin) disabled --- nativelogin undefined & local flag disabled", () => {
    const store = O.some({
      config: {}
    }) as unknown as O.Option<BackendStatus["config"]>;
    expect(
      isPropertyWithMinAppVersionEnabled({
        remoteConfig: store,
        mainLocalFlag: false,
        configPropertyName: "nativeLogin"
      })
    ).toBeFalsy();
  });
});

describe("backend service Feature Flag (fastLogin example) with min app version --- with optional config (opt_in example)", () => {
  jest.spyOn(DeviceInfo, "getVersion").mockReturnValue("2.0.0.0");
  jest.spyOn(DeviceInfo, "getReadableVersion").mockReturnValue("2.0.0.0");

  const customConfigFastLogin = (
    fastLoginConfig: object
  ): O.Option<BackendStatus["config"]> =>
    O.some({
      fastLogin: fastLoginConfig
    }) as unknown as O.Option<BackendStatus["config"]>;

  it("should return (fastlogin) enabled --- eq min version & local flag enabled & optional config undefined", () => {
    const store = customConfigFastLogin({
      min_app_version: { ios: "2.0.0.0", android: "2.0.0.0" }
    });
    expect(
      isPropertyWithMinAppVersionEnabled({
        remoteConfig: store,
        mainLocalFlag: true,
        configPropertyName: "fastLogin"
      })
    ).toBeTruthy();
  });

  it("should return (fastlogin) enabled --- eq min version & local flag enabled & optional config > min version", () => {
    const store = customConfigFastLogin({
      min_app_version: { ios: "2.0.0.0", android: "2.0.0.0" },
      opt_in: {
        min_app_version: { ios: "3.0.0.0", android: "3.0.0.0" }
      }
    });
    expect(
      isPropertyWithMinAppVersionEnabled({
        remoteConfig: store,
        mainLocalFlag: true,
        configPropertyName: "fastLogin"
      })
    ).toBeTruthy();
  });

  it("should return (fastlogin) enabled --- eq min version & local flag enabled & optional config < min version", () => {
    const store = customConfigFastLogin({
      min_app_version: { ios: "2.0.0.0", android: "2.0.0.0" },
      opt_in: {
        min_app_version: { ios: "1.0.0.0", android: "1.0.0.0" }
      }
    });
    expect(
      isPropertyWithMinAppVersionEnabled({
        remoteConfig: store,
        mainLocalFlag: true,
        configPropertyName: "fastLogin"
      })
    ).toBeTruthy();
  });

  it("should return (fastlogin) disabled --- > min version & local flag enabled & optional config < min version", () => {
    const store = customConfigFastLogin({
      min_app_version: { ios: "3.0.0.0", android: "3.0.0.0" },
      opt_in: {
        min_app_version: { ios: "1.0.0.0", android: "1.0.0.0" }
      }
    });
    expect(
      isPropertyWithMinAppVersionEnabled({
        remoteConfig: store,
        mainLocalFlag: true,
        configPropertyName: "fastLogin"
      })
    ).toBeFalsy();
  });

  it("should return (fastlogin) disabled --- > min version & local flag enabled & optional config > min version", () => {
    const store = customConfigFastLogin({
      min_app_version: { ios: "3.0.0.0", android: "3.0.0.0" },
      opt_in: {
        min_app_version: { ios: "3.0.0.0", android: "3.0.0.0" }
      }
    });
    expect(
      isPropertyWithMinAppVersionEnabled({
        remoteConfig: store,
        mainLocalFlag: true,
        configPropertyName: "fastLogin"
      })
    ).toBeFalsy();
  });

  it("should return (fastlogin - opt_in) enabled --- eq min version & local flag enabled & optional config eq min version & optional local flag enabled", () => {
    const store = customConfigFastLogin({
      min_app_version: { ios: "2.0.0.0", android: "2.0.0.0" },
      opt_in: {
        min_app_version: { ios: "2.0.0.0", android: "2.0.0.0" }
      }
    });
    expect(
      isPropertyWithMinAppVersionEnabled({
        remoteConfig: store,
        mainLocalFlag: true,
        configPropertyName: "fastLogin",
        optionalLocalFlag: true,
        optionalConfig: "opt_in"
      })
    ).toBeTruthy();
  });

  it("should return (fastlogin - opt_in) enabled --- eq min version & local flag enabled & optional config < min version & optional local flag enabled", () => {
    const store = customConfigFastLogin({
      min_app_version: { ios: "2.0.0.0", android: "2.0.0.0" },
      opt_in: {
        min_app_version: { ios: "1.9.9.9", android: "1.9.9.9" }
      }
    });
    expect(
      isPropertyWithMinAppVersionEnabled({
        remoteConfig: store,
        mainLocalFlag: true,
        configPropertyName: "fastLogin",
        optionalLocalFlag: true,
        optionalConfig: "opt_in"
      })
    ).toBeTruthy();
  });

  it("should return (fastlogin - opt_in) disabled --- eq min version & local flag enabled & optional config > min version & optional local flag enabled", () => {
    const store = customConfigFastLogin({
      min_app_version: { ios: "2.0.0.0", android: "2.0.0.0" },
      opt_in: {
        min_app_version: { ios: "2.9.9.9", android: "2.9.9.9" }
      }
    });
    expect(
      isPropertyWithMinAppVersionEnabled({
        remoteConfig: store,
        mainLocalFlag: true,
        configPropertyName: "fastLogin",
        optionalLocalFlag: true,
        optionalConfig: "opt_in"
      })
    ).toBeFalsy();
  });

  it("should return (fastlogin - opt_in) disabled --- eq min version & local flag enabled & optional config > min version & optional local flag disabled", () => {
    const store = customConfigFastLogin({
      min_app_version: { ios: "2.0.0.0", android: "2.0.0.0" },
      opt_in: {
        min_app_version: { ios: "2.9.9.9", android: "2.9.9.9" }
      }
    });
    expect(
      isPropertyWithMinAppVersionEnabled({
        remoteConfig: store,
        mainLocalFlag: true,
        configPropertyName: "fastLogin",
        optionalLocalFlag: false,
        optionalConfig: "opt_in"
      })
    ).toBeFalsy();
  });

  it("should return (fastlogin - opt_in) disabled --- eq min version & local flag enabled & optional config eq min version & optional local flag disabled", () => {
    const store = customConfigFastLogin({
      min_app_version: { ios: "2.0.0.0", android: "2.0.0.0" },
      opt_in: {
        min_app_version: { ios: "2.0.0.0", android: "2.0.0.0" }
      }
    });
    expect(
      isPropertyWithMinAppVersionEnabled({
        remoteConfig: store,
        mainLocalFlag: true,
        configPropertyName: "fastLogin",
        optionalLocalFlag: false,
        optionalConfig: "opt_in"
      })
    ).toBeFalsy();
  });

  it("should return (fastlogin - opt_in) disabled --- eq min version & local flag enabled & optional config < min version & optional local flag disabled", () => {
    const store = customConfigFastLogin({
      min_app_version: { ios: "2.0.0.0", android: "2.0.0.0" },
      opt_in: {
        min_app_version: { ios: "1.0.0.0", android: "1.0.0.0" }
      }
    });
    expect(
      isPropertyWithMinAppVersionEnabled({
        remoteConfig: store,
        mainLocalFlag: true,
        configPropertyName: "fastLogin",
        optionalLocalFlag: false,
        optionalConfig: "opt_in"
      })
    ).toBeFalsy();
  });

  it("should return (fastlogin - opt_in) enabled --- < min version & local flag enabled & optional config eq min version & optional local flag enabled", () => {
    const store = customConfigFastLogin({
      min_app_version: { ios: "1.0.0.0", android: "1.0.0.0" },
      opt_in: {
        min_app_version: { ios: "2.0.0.0", android: "2.0.0.0" }
      }
    });
    expect(
      isPropertyWithMinAppVersionEnabled({
        remoteConfig: store,
        mainLocalFlag: true,
        configPropertyName: "fastLogin",
        optionalLocalFlag: true,
        optionalConfig: "opt_in"
      })
    ).toBeTruthy();
  });

  it("should return (fastlogin - opt_in) disabled --- < min version & local flag disabled & optional config eq min version & optional local flag enabled", () => {
    const store = customConfigFastLogin({
      min_app_version: { ios: "1.0.0.0", android: "1.0.0.0" },
      opt_in: {
        min_app_version: { ios: "2.0.0.0", android: "2.0.0.0" }
      }
    });
    expect(
      isPropertyWithMinAppVersionEnabled({
        remoteConfig: store,
        mainLocalFlag: false,
        configPropertyName: "fastLogin",
        optionalLocalFlag: true,
        optionalConfig: "opt_in"
      })
    ).toBeFalsy();
  });

  it("should return (fastlogin - opt_in) disabled --- > min version & local flag enabled & optional config eq min version & optional local flag enabled", () => {
    const store = customConfigFastLogin({
      min_app_version: { ios: "3.0.0.0", android: "3.0.0.0" },
      opt_in: {
        min_app_version: { ios: "2.0.0.0", android: "2.0.0.0" }
      }
    });
    expect(
      isPropertyWithMinAppVersionEnabled({
        remoteConfig: store,
        mainLocalFlag: true,
        configPropertyName: "fastLogin",
        optionalLocalFlag: true,
        optionalConfig: "opt_in"
      })
    ).toBeFalsy();
  });

  it("should return (fastlogin - opt_in) disabled --- > min version & local flag disabled & optional config eq min version & optional local flag enabled", () => {
    const store = customConfigFastLogin({
      min_app_version: { ios: "3.0.0.0", android: "3.0.0.0" },
      opt_in: {
        min_app_version: { ios: "2.0.0.0", android: "2.0.0.0" }
      }
    });
    expect(
      isPropertyWithMinAppVersionEnabled({
        remoteConfig: store,
        mainLocalFlag: false,
        configPropertyName: "fastLogin",
        optionalLocalFlag: true,
        optionalConfig: "opt_in"
      })
    ).toBeFalsy();
  });

  it("should return (fastlogin - opt_in) disabled --- min version undefined & local flag enabled & optional config eq min version & optional local flag enabled", () => {
    const store = customConfigFastLogin({
      opt_in: {
        min_app_version: { ios: "2.0.0.0", android: "2.0.0.0" }
      }
    });
    expect(
      isPropertyWithMinAppVersionEnabled({
        remoteConfig: store,
        mainLocalFlag: true,
        configPropertyName: "fastLogin",
        optionalLocalFlag: true,
        optionalConfig: "opt_in"
      })
    ).toBeFalsy();
  });

  it("should return (fastlogin - opt_in) disabled --- min version undefined & local flag disabled & optional config eq min version & optional local flag enabled", () => {
    const store = customConfigFastLogin({
      opt_in: {
        min_app_version: { ios: "2.0.0.0", android: "2.0.0.0" }
      }
    });
    expect(
      isPropertyWithMinAppVersionEnabled({
        remoteConfig: store,
        mainLocalFlag: false,
        configPropertyName: "fastLogin",
        optionalLocalFlag: true,
        optionalConfig: "opt_in"
      })
    ).toBeFalsy();
  });

  it("should return (fastlogin - opt_in) disabled --- eq min version & local flag disabled & optional config eq min version & optional local flag enabled", () => {
    const store = customConfigFastLogin({
      min_app_version: { ios: "2.0.0.0", android: "2.0.0.0" },
      opt_in: {
        min_app_version: { ios: "2.0.0.0", android: "2.0.0.0" }
      }
    });
    expect(
      isPropertyWithMinAppVersionEnabled({
        remoteConfig: store,
        mainLocalFlag: false,
        configPropertyName: "fastLogin",
        optionalLocalFlag: true,
        optionalConfig: "opt_in"
      })
    ).toBeFalsy();
  });

  it("should return (fastlogin - opt_in) disabled --- eq min version & local flag enabled & optional config undefined & optional local flag enabled", () => {
    const store = customConfigFastLogin({
      min_app_version: { ios: "2.0.0.0", android: "2.0.0.0" }
    });
    expect(
      isPropertyWithMinAppVersionEnabled({
        remoteConfig: store,
        mainLocalFlag: true,
        configPropertyName: "fastLogin",
        optionalLocalFlag: true,
        optionalConfig: "opt_in"
      })
    ).toBeFalsy();
  });

  it("should return (fastlogin - opt_in) disabled --- eq min version & local flag enabled & optional config (only min_app_version) undefined & optional local flag enabled", () => {
    const store = customConfigFastLogin({
      min_app_version: { ios: "2.0.0.0", android: "2.0.0.0" },
      opt_in: {}
    });
    expect(
      isPropertyWithMinAppVersionEnabled({
        remoteConfig: store,
        mainLocalFlag: true,
        configPropertyName: "fastLogin",
        optionalLocalFlag: true,
        optionalConfig: "opt_in"
      })
    ).toBeFalsy();
  });

  it("should return (fastlogin - opt_in) disabled --- eq min version & local flag enabled & optional config undefined & optional local flag disabled", () => {
    const store = customConfigFastLogin({
      min_app_version: { ios: "2.0.0.0", android: "2.0.0.0" }
    });
    expect(
      isPropertyWithMinAppVersionEnabled({
        remoteConfig: store,
        mainLocalFlag: true,
        configPropertyName: "fastLogin",
        optionalLocalFlag: false,
        optionalConfig: "opt_in"
      })
    ).toBeFalsy();
  });

  it("should return (fastlogin - opt_in) disabled --- eq min version & local flag enabled & optional config (only min_app_version) undefined & optional local flag disabled", () => {
    const store = customConfigFastLogin({
      min_app_version: { ios: "2.0.0.0", android: "2.0.0.0" },
      opt_in: {}
    });
    expect(
      isPropertyWithMinAppVersionEnabled({
        remoteConfig: store,
        mainLocalFlag: true,
        configPropertyName: "fastLogin",
        optionalLocalFlag: false,
        optionalConfig: "opt_in"
      })
    ).toBeFalsy();
  });
});
