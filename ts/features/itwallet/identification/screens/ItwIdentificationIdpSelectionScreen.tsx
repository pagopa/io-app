import { VSpacer } from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useRef } from "react";
import { isReady } from "../../../../common/model/RemoteValue";
import IdpsGrid from "../../../../components/IdpsGrid";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { randomOrderIdps } from "../../../../screens/authentication/IdpSelectionScreen";
import { loadIdps } from "../../../../store/actions/content";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { idpsRemoteValueSelector } from "../../../../store/reducers/content";
import {
  fromGeneratedToLocalSpidIdp,
  idps as idpsFallback,
  SpidIdp
} from "../../../../utils/idps";
import {
  trackItWalletSpidIDPSelected,
  trackItWalletSpidIDPSelection
} from "../../analytics";
import { ItwEidIssuanceMachineContext } from "../../machine/provider";

export const ItwIdentificationIdpSelectionScreen = () => {
  const dispatch = useIODispatch();
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();

  const idps = useIOSelector(idpsRemoteValueSelector);
  const idpValue = isReady(idps)
    ? fromGeneratedToLocalSpidIdp(idps.value.items)
    : idpsFallback;
  const randomIdps = useRef<ReadonlyArray<SpidIdp>>(randomOrderIdps(idpValue));

  useFocusEffect(
    useCallback(() => {
      trackItWalletSpidIDPSelection();
      dispatch(loadIdps.request());
    }, [dispatch])
  );

  const onIdpSelected = (idp: SpidIdp) => {
    trackItWalletSpidIDPSelected({ idp: idp.name });
    machineRef.send({ type: "select-spid-idp", idp });
  };

  return (
    <IOScrollViewWithLargeHeader title={{ label: "" }}>
      <IdpsGrid
        idps={randomIdps.current}
        onIdpSelected={onIdpSelected}
        headerComponent={undefined}
        footerComponent={<VSpacer size={24} />}
      />
    </IOScrollViewWithLargeHeader>
  );
};
