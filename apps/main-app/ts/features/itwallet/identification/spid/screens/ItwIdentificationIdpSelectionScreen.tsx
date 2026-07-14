import { VSpacer } from "@io-app/design-system";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useRef } from "react";

import { isReady } from "../../../../../common/model/RemoteValue";
import { IOScrollViewWithLargeHeader } from "../../../../../components/ui/IOScrollViewWithLargeHeader";
import { loadIdps } from "../../../../../store/actions/content";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { idpsRemoteValueSelector } from "../../../../../store/reducers/content";
import { idps as idpsFallback, SpidIdp } from "../../../../../utils/idps";
import IdpsGrid from "../../../../authentication/login/idp/components/IdpsGrid";
import { randomOrderIdps } from "../../../../authentication/login/idp/screens/IdpSelectionScreen";
import { ItwFlow } from "../../../analytics/utils/types";
import { ItwEidIssuanceMachineContext } from "../../../machine/eid/provider";
import { isL3FeaturesEnabledSelector } from "../../../machine/eid/selectors";
import {
  trackItWalletSpidIDPSelected,
  trackItWalletSpidIDPSelection
} from "../../analytics";

export const ItwIdentificationIdpSelectionScreen = () => {
  const dispatch = useIODispatch();
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const isL3 = ItwEidIssuanceMachineContext.useSelector(
    isL3FeaturesEnabledSelector
  );

  const idps = useIOSelector(idpsRemoteValueSelector);
  const idpValue = isReady(idps) ? idps.value : idpsFallback;
  const randomIdps = useRef<ReadonlyArray<SpidIdp>>(randomOrderIdps(idpValue));

  const itw_flow: ItwFlow = isL3 ? "L3" : "L2";

  useFocusEffect(
    useCallback(() => {
      trackItWalletSpidIDPSelection(itw_flow);
      dispatch(loadIdps.request());
    }, [dispatch, itw_flow])
  );

  const onIdpSelected = (idp: SpidIdp) => {
    trackItWalletSpidIDPSelected({ idp: idp.name, itw_flow });
    machineRef.send({ type: "select-spid-idp", idp });
  };

  return (
    <IOScrollViewWithLargeHeader title={{ label: "" }}>
      <IdpsGrid
        footerComponent={<VSpacer size={24} />}
        headerComponent={undefined}
        idps={randomIdps.current}
        onIdpSelected={onIdpSelected}
      />
    </IOScrollViewWithLargeHeader>
  );
};
