/* eslint-disable curly */
import * as React from "react";
import {
  ButtonSolid,
  ListItemHeader,
  ListItemInfo,
  VSpacer
} from "@pagopa/io-app-design-system";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as A from "fp-ts/lib/Array";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { itwCredentialsWalletReset } from "../../credentials/store/actions";
import { itwRemoveIntegrityKeyTag } from "../../issuance/store/actions";
import { itwLifecycleStateUpdated } from "../../lifecycle/store/actions";
import { ItwLifecycleState } from "../../lifecycle/store/reducers";
import {
  itwLifecycleIsInstalledSelector,
  itwLifecycleIsOperationalSelector,
  itwLifecycleIsValidSelector
} from "../../lifecycle/store/selectors";
import { walletRemoveCards } from "../../../newWallet/store/actions/cards";
import { itwCredentialsSelector } from "../../credentials/store/selectors";

export const ItwLifecycleSection = () => {
  const dispatch = useIODispatch();
  const isItwInstalled = useIOSelector(itwLifecycleIsInstalledSelector);
  const isItwOperational = useIOSelector(itwLifecycleIsOperationalSelector);
  const isItwValid = useIOSelector(itwLifecycleIsValidSelector);
  const { eid, credentials } = useIOSelector(itwCredentialsSelector);

  const resetWalletInstance = () => {
    dispatch(itwCredentialsWalletReset());
    dispatch(itwRemoveIntegrityKeyTag());
    dispatch(
      itwLifecycleStateUpdated(ItwLifecycleState.ITW_LIFECYCLE_INSTALLED)
    );
    if (O.isSome(eid)) {
      dispatch(
        walletRemoveCards([
          eid.value.keyTag,
          ...pipe(credentials, A.filterMap(O.map(x => x.keyTag)))
        ])
      );
    }
  };

  const getLifecycleStateLabel = () => {
    if (isItwInstalled) return "INSTALLED";
    if (isItwOperational) return "OPERATIONAL";
    if (isItwValid) return "VALID";
    return "UNKNOWN";
  };

  return (
    <>
      <ListItemHeader label="Wallet Instance Lifecycle" />
      <ListItemInfo label="Current status" value={getLifecycleStateLabel()} />
      <VSpacer size={8} />
      <ButtonSolid
        fullWidth={true}
        label="Reset Wallet Instance"
        onPress={resetWalletInstance}
      />
    </>
  );
};
