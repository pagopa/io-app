import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { getEnv } from "../../common/utils/environment";
import { ProximityMachineDeps } from "../../presentation/proximity/machine/input";
import { RemoteMachineDeps } from "../../presentation/remote/machine/input";
import { TrustmarkMachineDeps } from "../../trustmark/machine/input";
import { CredentialIssuanceMachineDeps } from "../credential/input";
import { EidIssuanceMachineDeps } from "../eid/input";
import { CredentialUpgradeMachineDeps } from "../upgrade/input";
import { MachineNavigation, MachineStore, MachineToast } from "./deps";

const noop = () => undefined;

export const testMachineStore = (
  store: Partial<MachineStore> = {}
): MachineStore => ({
  dispatch: noop,
  getState: () => appReducer(undefined, applicationChangeState("active")),
  subscribe: () => noop,
  ...store
});

export const testMachineNavigation = (
  navigation: Partial<MachineNavigation> = {}
): MachineNavigation => ({
  canGoBack: () => false,
  getState: () => ({
    index: 0,
    key: "test",
    routeNames: [],
    routes: [],
    stale: false,
    type: "stack"
  }),
  goBack: noop,
  navigate: noop,
  pop: noop,
  popToTop: noop,
  replace: noop,
  reset: noop,
  ...navigation
});

export const testMachineToast = (
  toast: Partial<MachineToast> = {}
): MachineToast => ({
  error: noop,
  success: noop,
  ...toast
});

export const testEidIssuanceDeps = (
  overrides: Partial<EidIssuanceMachineDeps> = {}
): EidIssuanceMachineDeps => ({
  env: getEnv("pre"),
  navigation: testMachineNavigation(),
  store: testMachineStore(),
  toast: testMachineToast(),
  ...overrides
});

export const testCredentialIssuanceDeps = (
  overrides: Partial<CredentialIssuanceMachineDeps> = {}
): CredentialIssuanceMachineDeps => ({
  env: getEnv("pre"),
  itwVersion: "1.0.0",
  navigation: testMachineNavigation(),
  store: testMachineStore(),
  toast: testMachineToast(),
  ...overrides
});

export const testCredentialUpgradeDeps = (
  overrides: Partial<CredentialUpgradeMachineDeps> = {}
): CredentialUpgradeMachineDeps => ({
  env: getEnv("pre"),
  store: testMachineStore(),
  ...overrides
});

export const testProximityDeps = (
  overrides: Partial<ProximityMachineDeps> = {}
): ProximityMachineDeps => ({
  env: getEnv("pre"),
  navigation: testMachineNavigation(),
  store: testMachineStore(),
  ...overrides
});

export const testRemoteDeps = (
  overrides: Partial<RemoteMachineDeps> = {}
): RemoteMachineDeps => ({
  env: getEnv("pre"),
  itwVersion: "1.0.0",
  navigation: testMachineNavigation(),
  store: testMachineStore(),
  ...overrides
});

export const testTrustmarkDeps = (
  overrides: Partial<TrustmarkMachineDeps> = {}
): TrustmarkMachineDeps => ({
  env: getEnv("pre"),
  itwVersion: "1.0.0",
  navigation: testMachineNavigation(),
  store: testMachineStore(),
  toast: testMachineToast(),
  ...overrides
});
