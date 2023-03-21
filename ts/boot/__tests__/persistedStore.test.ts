import { applicationChangeState } from "../../store/actions/application";
import { appReducer } from "../../store/reducers";
import { GlobalState } from "../../store/reducers/types";

describe("Check the addition for new fields to the persisted store. If one of this test fails, check that exists the migration before updating the snapshot!", () => {
  jest.useFakeTimers();
  const globalState = appReducer(undefined, applicationChangeState("active"));
  it("Freeze 'onboarding' state", () => {
    expect(globalState.onboarding).toMatchSnapshot();
  });
  it("Freeze 'notifications' state", () => {
    const notifications: GlobalState["notifications"] = {
      ...globalState.notifications,
      installation: {
        ...globalState.notifications.installation,
        id: "fakeInstallationId"
      }
    };
    expect(notifications).toMatchSnapshot();
  });
  it("Freeze 'profile' state", () => {
    expect(globalState.profile).toMatchSnapshot();
  });
  it("Freeze 'debug' state", () => {
    expect(globalState.debug).toMatchSnapshot();
  });
  it("Freeze 'persistedPreferences' state", () => {
    expect(globalState.persistedPreferences).toMatchSnapshot();
  });
  it("Freeze 'installation' state", () => {
    expect(globalState.installation).toMatchSnapshot();
  });
  it("Freeze 'payments' state", () => {
    expect(globalState.payments).toMatchSnapshot();
  });
  it("Freeze 'content' state", () => {
    expect(globalState.content).toMatchSnapshot();
  });
  it("Freeze 'userMetadata' state", () => {
    expect(globalState.userMetadata).toMatchSnapshot();
  });
  it("Freeze 'crossSessions' state", () => {
    expect(globalState.crossSessions).toMatchSnapshot();
  });
  it("Freeze 'entities' state", () => {
    expect(globalState.entities).toMatchSnapshot();
  });
  it("Freeze 'authentication' state", () => {
    expect(globalState.authentication).toMatchSnapshot();
  });
  it("Freeze 'identification' state", () => {
    expect(globalState.identification).toMatchSnapshot();
  });
  it("Freeze 'wallet.wallets.walletById' state", () => {
    expect(globalState.wallet.wallets.walletById).toMatchSnapshot();
  });

  it("Freeze 'installation.appVersionHistory' state", () => {
    expect(globalState.installation.appVersionHistory).toMatchSnapshot();
  });
});
