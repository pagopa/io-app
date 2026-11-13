import { FiscalCode } from "@pagopa/ts-commons/lib/strings";

import {
  itwIsEngagementScreenShownSelector,
  itwShouldShowEngagementScreenSelector
} from "..";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { setProfileHashedFiscalCode } from "../../../../../../store/actions/crossSessions";
import { appReducer } from "../../../../../../store/reducers";
import { hashedProfileFiscalCodeSelector } from "../../../../../../store/reducers/crossSessions";
import { logoutSuccess } from "../../../../../authentication/common/store/actions";
import {
  itwResetEngagementScreenShown,
  itwSetEngagementScreenShown,
  itwSetFiscalCodeWhitelisted,
  itwSetWhatsNewLocallyEnabled
} from "../../../../common/store/actions/preferences";
import * as remoteConfig from "../../../../common/store/selectors/remoteConfig";
import { ItwStoredCredentialsMocks } from "../../../../common/utils/itwMocksUtils";
import * as credentials from "../../../../credentials/store/selectors";

const initialState = appReducer(undefined, applicationChangeState("active"));
const userState = appReducer(
  appReducer(
    initialState,
    setProfileHashedFiscalCode("AAAAAA00A00A000A" as FiscalCode)
  ),
  itwSetFiscalCodeWhitelisted(true)
);

describe("itwIsEngagementScreenShownSelector", () => {
  it("is false when the user is unknown", () =>
    expect(itwIsEngagementScreenShownSelector(initialState)).toBe(false));

  it("tracks the current user's marker", () => {
    const user = hashedProfileFiscalCodeSelector(userState)!;
    expect(itwIsEngagementScreenShownSelector(userState)).toBe(false);

    const seenState = appReducer(userState, itwSetEngagementScreenShown(user));
    expect(itwIsEngagementScreenShownSelector(seenState)).toBe(true);

    expect(
      itwIsEngagementScreenShownSelector(
        appReducer(
          seenState,
          setProfileHashedFiscalCode("BBBBBB00B00B000B" as FiscalCode)
        )
      )
    ).toBe(false);
    expect(
      itwIsEngagementScreenShownSelector(
        appReducer(seenState, itwResetEngagementScreenShown())
      )
    ).toBe(false);
  });
});

describe("ITW engagement eligibility", () => {
  beforeEach(() =>
    jest
      .spyOn(remoteConfig, "isItwWhatsNewMinAppVersionSupportedSelector")
      .mockReturnValue(true)
  );
  afterEach(() => jest.restoreAllMocks());

  test.each([
    { name: "no wallet", eid: undefined, expected: true },
    {
      name: "Documenti su IO wallet",
      eid: ItwStoredCredentialsMocks.eid,
      expected: true
    },
    {
      name: "IT-Wallet",
      eid: {
        ...ItwStoredCredentialsMocks.eid,
        spec_version: "1.3.3",
        verification: {
          assurance_level: "high",
          trust_framework: "eidas"
        }
      },
      expected: false
    }
  ])("handles $name", ({ eid, expected }) => {
    jest.spyOn(remoteConfig, "isItwEnabledSelector").mockReturnValue(true);
    jest.spyOn(credentials, "itwCredentialsEidSelector").mockReturnValue(eid);

    expect(itwShouldShowEngagementScreenSelector(userState)).toBe(expected);
  });

  it("shows when the remote or the local flag is on", () => {
    jest.spyOn(remoteConfig, "isItwEnabledSelector").mockReturnValue(true);
    jest
      .spyOn(remoteConfig, "isItwWhatsNewMinAppVersionSupportedSelector")
      .mockReturnValue(false);
    expect(itwShouldShowEngagementScreenSelector(userState)).toBe(false);
    expect(
      itwShouldShowEngagementScreenSelector(
        appReducer(userState, itwSetWhatsNewLocallyEnabled(true))
      )
    ).toBe(true);
  });

  it("does not show when the feature is disabled, the user is not whitelisted or unknown", () => {
    jest.spyOn(remoteConfig, "isItwEnabledSelector").mockReturnValue(false);
    expect(itwShouldShowEngagementScreenSelector(userState)).toBe(false);
    jest.spyOn(remoteConfig, "isItwEnabledSelector").mockReturnValue(true);
    expect(
      itwShouldShowEngagementScreenSelector(
        appReducer(userState, itwSetFiscalCodeWhitelisted(false))
      )
    ).toBe(false);
    jest.spyOn(remoteConfig, "isItwEnabledSelector").mockReturnValue(true);
    expect(itwShouldShowEngagementScreenSelector(initialState)).toBe(false);
  });

  it("retains seen state through logout without hiding it for other users", () => {
    jest.spyOn(remoteConfig, "isItwEnabledSelector").mockReturnValue(true);
    const seenState = appReducer(
      userState,
      itwSetEngagementScreenShown(hashedProfileFiscalCodeSelector(userState)!)
    );
    const loggedOutState = appReducer(seenState, logoutSuccess());
    expect(itwShouldShowEngagementScreenSelector(loggedOutState)).toBe(false);

    const otherUserState = appReducer(
      loggedOutState,
      setProfileHashedFiscalCode("BBBBBB00B00B000B" as FiscalCode)
    );
    expect(itwShouldShowEngagementScreenSelector(otherUserState)).toBe(true);

    const returningUserState = appReducer(
      otherUserState,
      setProfileHashedFiscalCode("AAAAAA00A00A000A" as FiscalCode)
    );
    expect(itwShouldShowEngagementScreenSelector(returningUserState)).toBe(
      false
    );
  });
});
