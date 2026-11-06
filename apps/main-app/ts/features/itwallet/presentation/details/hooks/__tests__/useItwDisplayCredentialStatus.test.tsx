import { renderHook } from "@testing-library/react-native";
import { PropsWithChildren } from "react";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";

import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { OfflineAccessReasonEnum } from "../../../../../ingress/store/reducer";
import * as ingressSelectors from "../../../../../ingress/store/selectors";
import { CredentialType } from "../../../../common/utils/itwMocksUtils";
import {
  ItwCredentialStatus,
  ItwJwtCredentialStatus
} from "../../../../common/utils/itwTypesUtils";
import * as credentialSelectors from "../../../../credentials/store/selectors";
import { useItwDisplayCredentialStatus } from "../useItwDisplayCredentialStatus";

type RenderHookParams = {
  credentialStatus: ItwCredentialStatus;
  credentialType: string;
  eidStatus: ItwJwtCredentialStatus;
  offlineAccessReason?: OfflineAccessReasonEnum;
};

describe("useItwDisplayCredentialStatus", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  // The PID shares its status with the eID, so both are set to the same value
  it.each`
    credentialStatus | offlineAccessReason                       | expected
    ${"valid"}       | ${undefined}                              | ${"valid"}
    ${"jwtExpiring"} | ${undefined}                              | ${"jwtExpiring"}
    ${"jwtExpired"}  | ${undefined}                              | ${"invalid"}
    ${"valid"}       | ${OfflineAccessReasonEnum.DEVICE_OFFLINE} | ${"valid"}
    ${"jwtExpiring"} | ${OfflineAccessReasonEnum.DEVICE_OFFLINE} | ${"valid"}
    ${"jwtExpired"}  | ${OfflineAccessReasonEnum.DEVICE_OFFLINE} | ${"invalid"}
  `(
    "returns $expected for a PID with status $credentialStatus and offline reason $offlineAccessReason",
    ({ credentialStatus, offlineAccessReason, expected }) => {
      const result = renderDisplayStatusHook({
        credentialStatus,
        credentialType: CredentialType.PID,
        eidStatus: credentialStatus,
        offlineAccessReason
      });

      expect(result).toBe(expected);
    }
  );

  it("treats an undefined offline access reason as online", () => {
    const result = renderDisplayStatusHook({
      credentialStatus: "jwtExpiring",
      credentialType: CredentialType.DRIVING_LICENSE,
      eidStatus: "valid",
      offlineAccessReason: undefined
    });

    expect(result).toBe("jwtExpiring");
  });

  it("keeps the expiring status of the PID when the eID is expiring", () => {
    const result = renderDisplayStatusHook({
      credentialStatus: "jwtExpiring",
      credentialType: CredentialType.PID,
      eidStatus: "jwtExpiring",
      offlineAccessReason: undefined
    });

    expect(result).toBe("jwtExpiring");
  });

  it("hides the expiring status of a credential when the eID is expiring", () => {
    const result = renderDisplayStatusHook({
      credentialStatus: "jwtExpiring",
      credentialType: CredentialType.DRIVING_LICENSE,
      eidStatus: "jwtExpiring",
      offlineAccessReason: undefined
    });

    expect(result).toBe("valid");
  });
});

const renderDisplayStatusHook = ({
  credentialStatus,
  credentialType,
  eidStatus,
  offlineAccessReason
}: RenderHookParams) => {
  jest
    .spyOn(credentialSelectors, "itwCredentialsEidStatusSelector")
    .mockReturnValue(eidStatus);
  jest
    .spyOn(ingressSelectors, "offlineAccessReasonSelector")
    .mockReturnValue(offlineAccessReason);

  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = configureMockStore<GlobalState>()(initialState);
  const wrapper = ({ children }: PropsWithChildren) => (
    <Provider store={store}>{children}</Provider>
  );
  const { result } = renderHook(
    () => useItwDisplayCredentialStatus(credentialStatus, credentialType),
    { wrapper }
  );

  return result.current;
};
