import { MixpanelProperties } from "mixpanel-react-native";
import * as baseBuilder from "../basePropertyBuilder";
import * as superProp from "../superProperties";
import * as profileProp from "../profileProperties";
import {
  updateCredentialAddedProperties,
  updateItwAnalyticsProperties,
  updatePropertiesWalletRevoked
} from "../propertyUpdaters";
import { GlobalState } from "../../../../../store/reducers/types";
import { ITWSuperProperties } from "../superProperties";
import { ITW_ANALYTICS_CREDENTIALS } from "../propertyTypes";

export const mockedRegisterSuperProperties = jest.fn();
export const mockedSet = jest.fn();
jest.mock("../../../../../mixpanel", () => ({
  isMixpanelInstanceInitialized: () => true,
  registerSuperProperties: (properties: MixpanelProperties) =>
    mockedRegisterSuperProperties(properties),
  getPeople: () => ({
    set: mockedSet
  })
}));

describe("propertyUpdaters", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("updates profile and super properties with base and super props", () => {
    jest
      .spyOn(baseBuilder, "buildItwBaseProperties")
      .mockReturnValue({ ITW_STATUS_V2: "valid" } as any);

    jest
      .spyOn(superProp, "buildItwSuperProperties")
      .mockReturnValue({
        OFFLINE_ACCESS_REASON: "session_refresh"
      } as ITWSuperProperties);

    updateItwAnalyticsProperties({} as GlobalState);

    expect(mockedSet).toHaveBeenCalledWith({
      ITW_STATUS_V2: "valid"
    });

    expect(mockedRegisterSuperProperties).toHaveBeenCalledWith({
      ITW_STATUS_V2: "valid",
      OFFLINE_ACCESS_REASON: "session_refresh"
    });
  });

  it("updates credential property only if it is an ITW analytics credential", () => {
    const profileSpy = jest.spyOn(
      profileProp,
      "forceUpdateItwProfileProperties"
    );
    const superSpy = jest.spyOn(superProp, "forceUpdateItwSuperProperties");

    updateCredentialAddedProperties("ITW_PG_V3");
    updateCredentialAddedProperties("ITW_RES");

    expect(profileSpy).toHaveBeenCalledTimes(1);
    expect(superSpy).toHaveBeenCalledTimes(1);

    expect(profileSpy).toHaveBeenCalledWith({
      ITW_PG_V3: "valid"
    });
    expect(superSpy).toHaveBeenCalledWith({
      ITW_PG_V3: "valid"
    });
  });

  it("resets only ITW analytics credentials on wallet revoked", () => {
    const profileSpy = jest.spyOn(
      profileProp,
      "forceUpdateItwProfileProperties"
    );

    updatePropertiesWalletRevoked();

    expect(profileSpy).toHaveBeenCalledTimes(1);

    const callArg = profileSpy.mock.calls[0][0];

    ITW_ANALYTICS_CREDENTIALS.forEach(k => {
      expect(callArg[k]).toBe("not_available");
    });

    expect(callArg.ITW_STATUS_V2).toBe("not_active");
    expect(callArg).not.toHaveProperty("ITW_RES");
  });
});
