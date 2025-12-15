import { VSpacer } from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import { useRef, useCallback } from "react";
import I18n from "i18next";
import { isReady } from "../../../../../common/model/RemoteValue";
import IdpsGrid from "../../../../authentication/login/idp/components/IdpsGrid";
import { IOScrollViewWithLargeHeader } from "../../../../../components/ui/IOScrollViewWithLargeHeader";
import { randomOrderIdps } from "../../../../authentication/login/idp/screens/IdpSelectionScreen";
import { loadIdps } from "../../../../../store/actions/content";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { idpsRemoteValueSelector } from "../../../../../store/reducers/content";
import { idps as idpsFallback, SpidIdp } from "../../../../../utils/idps";
import { ItwEidIssuanceMachineContext } from "../../../machine/eid/provider";
import {
  trackItWalletSpidIDPSelected,
  trackItWalletSpidIDPSelection
} from "../../../analytics";
import { useItwDismissalDialog } from "../../../common/hooks/useItwDismissalDialog";

export const ItwIdentificationIdpSelectionScreen = () => {
  const dispatch = useIODispatch();
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();

  const idps = useIOSelector(idpsRemoteValueSelector);
  const idpValue = isReady(idps) ? idps.value : idpsFallback;
  const randomIdps = useRef<ReadonlyArray<SpidIdp>>(randomOrderIdps(idpValue));

  const dismissalDialog = useItwDismissalDialog({
    customLabels: {
      body: I18n.t(
        "features.itWallet.discovery.screen.itw.dismissalDialog.body"
      )
    }
  });

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
    <IOScrollViewWithLargeHeader
      goBack={dismissalDialog.show}
      title={{ label: "" }}
    >
      <IdpsGrid
        idps={randomIdps.current}
        onIdpSelected={onIdpSelected}
        headerComponent={undefined}
        footerComponent={<VSpacer size={24} />}
      />
    </IOScrollViewWithLargeHeader>
  );
};
