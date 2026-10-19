import {
  isItWalletAvailable,
  isWalletActive,
  ItwLifecycleState,
  itwLifecycleStateSelector
} from "..";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { Action } from "../../../../../../store/actions/types";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { reproduceSequence } from "../../../../../../utils/tests";
import {
  itwDisableItwActivation,
  itwSetFiscalCodeWhitelisted,
  itwSetL2Fallback
} from "../../../../common/store/actions/preferences";
import { CredentialType } from "../../../../common/utils/itwMocksUtils";
import { CredentialMetadata } from "../../../../common/utils/itwTypesUtils";
import { itwCredentialsStore } from "../../../../credentials/store/actions";
import { itwStoreIntegrityKeyTag } from "../../../../issuance/store/actions";

const l2Pid = {
  credentialType: CredentialType.PID,
  credentialId: "dc_sd_jwt_PersonIdentificationData",
  format: "dc+sd-jwt",
  spec_version: "1.0.0"
} as CredentialMetadata;

const l3Pid = {
  ...l2Pid,
  spec_version: "1.3.3",
  verification: { assurance_level: "high", trust_framework: "it_cie" }
} as unknown as CredentialMetadata;

const walletInstance = itwStoreIntegrityKeyTag("integrity-key-tag");
const whitelisted = itwSetFiscalCodeWhitelisted(true);
const noNfc = itwDisableItwActivation();
const noCie = itwSetL2Fallback(true);

const stateWith = (actions: ReadonlyArray<Action>) =>
  reproduceSequence({} as GlobalState, appReducer, [
    applicationChangeState("active"),
    ...actions
  ]);

describe("itwLifecycleStateSelector", () => {
  test.each(
    (
      [
        {
          name: "no wallet instance",
          actions: [],
          expected: ItwLifecycleState.INACTIVE
        },
        {
          name: "a wallet instance without a PID",
          actions: [walletInstance],
          expected: ItwLifecycleState.INACTIVE
        },
        {
          name: "a PID without a wallet instance",
          actions: [itwCredentialsStore([l2Pid])],
          expected: ItwLifecycleState.INACTIVE
        },
        {
          name: "no wallet, eligible for IT-Wallet",
          actions: [whitelisted],
          expected: ItwLifecycleState.IT_WALLET_ELIGIBLE
        },
        {
          name: "no wallet, eligible for IT-Wallet without NFC",
          actions: [whitelisted, noNfc],
          expected: ItwLifecycleState.IT_WALLET_UNSUPPORTED
        },
        {
          name: "no wallet, eligible for IT-Wallet after a no CIE fallback",
          actions: [whitelisted, noCie],
          expected: ItwLifecycleState.IT_WALLET_ELIGIBLE
        },
        {
          name: "a L2 PID, not eligible for IT-Wallet",
          actions: [walletInstance, itwCredentialsStore([l2Pid])],
          expected: ItwLifecycleState.DOC_IO
        },
        {
          name: "a L2 PID, eligible for IT-Wallet",
          actions: [whitelisted, walletInstance, itwCredentialsStore([l2Pid])],
          expected: ItwLifecycleState.DOC_IO_UPGRADABLE
        },
        {
          name: "a L2 PID, eligible for IT-Wallet without NFC",
          actions: [
            whitelisted,
            noNfc,
            walletInstance,
            itwCredentialsStore([l2Pid])
          ],
          expected: ItwLifecycleState.DOC_IO_FALLBACK
        },
        {
          name: "a L2 PID, eligible for IT-Wallet without CIE",
          actions: [
            whitelisted,
            noCie,
            walletInstance,
            itwCredentialsStore([l2Pid])
          ],
          expected: ItwLifecycleState.DOC_IO_FALLBACK
        },
        {
          name: "a L3 PID",
          actions: [whitelisted, walletInstance, itwCredentialsStore([l3Pid])],
          expected: ItwLifecycleState.IT_WALLET
        },
        {
          name: "a L3 PID, no longer eligible for IT-Wallet",
          actions: [walletInstance, itwCredentialsStore([l3Pid])],
          expected: ItwLifecycleState.IT_WALLET
        },
        {
          name: "a L3 PID after a no NFC fallback",
          actions: [
            whitelisted,
            noNfc,
            walletInstance,
            itwCredentialsStore([l3Pid])
          ],
          expected: ItwLifecycleState.IT_WALLET
        }
      ] satisfies Array<{
        actions: ReadonlyArray<Action>;
        expected: ItwLifecycleState;
        name: string;
      }>
    ).map(row => ({ ...row, expectedName: ItwLifecycleState[row.expected] }))
  )("returns $expectedName with $name", ({ actions, expected }) => {
    expect(itwLifecycleStateSelector(stateWith(actions))).toBe(expected);
  });
});

describe("lifecycle state predicates", () => {
  test.each<{
    active: boolean;
    available: boolean;
    lifecycle: ItwLifecycleState;
  }>(
    [
      {
        lifecycle: ItwLifecycleState.INACTIVE,
        active: false,
        available: false
      },
      {
        lifecycle: ItwLifecycleState.IT_WALLET_ELIGIBLE,
        active: false,
        available: true
      },
      {
        lifecycle: ItwLifecycleState.IT_WALLET_UNSUPPORTED,
        active: false,
        available: true
      },
      { lifecycle: ItwLifecycleState.DOC_IO, active: true, available: false },
      {
        lifecycle: ItwLifecycleState.DOC_IO_UPGRADABLE,
        active: true,
        available: true
      },
      {
        lifecycle: ItwLifecycleState.DOC_IO_FALLBACK,
        active: true,
        available: true
      },
      { lifecycle: ItwLifecycleState.IT_WALLET, active: true, available: true }
    ].map(row => ({ ...row, lifecycleName: ItwLifecycleState[row.lifecycle] }))
  )(
    "$lifecycleName is active: $active, IT-Wallet available: $available",
    ({ lifecycle, active, available }) => {
      expect(isWalletActive(lifecycle)).toBe(active);
      expect(isItWalletAvailable(lifecycle)).toBe(available);
    }
  );
});
