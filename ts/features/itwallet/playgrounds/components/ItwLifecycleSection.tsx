/* eslint-disable curly */
import {
  ButtonSolid,
  ListItemHeader,
  ListItemInfo,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { itwLifecycleWalletReset } from "../../lifecycle/store/actions";
import {
  itwLifecycleIsInstalledSelector,
  itwLifecycleIsOperationalSelector,
  itwLifecycleIsValidSelector
} from "../../lifecycle/store/selectors";

export const ItwLifecycleSection = () => {
  const dispatch = useIODispatch();
  const isItwInstalled = useIOSelector(itwLifecycleIsInstalledSelector);
  const isItwOperational = useIOSelector(itwLifecycleIsOperationalSelector);
  const isItwValid = useIOSelector(itwLifecycleIsValidSelector);

  const resetWalletInstance = () => {
    dispatch(itwLifecycleWalletReset());
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
