import { VSpacer } from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import React from "react";
import { SpidIdp } from "../../../../../definitions/content/SpidIdp";
import { isReady } from "../../../../common/model/RemoteValue";
import IdpsGrid from "../../../../components/IdpsGrid";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { randomOrderIdps } from "../../../../screens/authentication/IdpSelectionScreen";
import { loadIdps } from "../../../../store/actions/content";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { idpsRemoteValueSelector } from "../../../../store/reducers/content";
import {
  LocalIdpsFallback,
  idps as idpsFallback
} from "../../../../utils/idps";
import LoadingComponent from "../../../fci/components/LoadingComponent";
import { ItwEidIssuanceMachineContext } from "../../machine/provider";
import { ItwTags } from "../../machine/tags";

export const ItwIdentificationIdpSelectionScreen = () => {
  const dispatch = useIODispatch();
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const isLoading = ItwEidIssuanceMachineContext.useSelector(snap =>
    snap.hasTag(ItwTags.Loading)
  );

  const idps = useIOSelector(idpsRemoteValueSelector);
  const idpValue = isReady(idps) ? idps.value.items : idpsFallback;
  const randomIdps = React.useRef<ReadonlyArray<SpidIdp | LocalIdpsFallback>>(
    randomOrderIdps(idpValue)
  );

  useFocusEffect(
    React.useCallback(() => {
      dispatch(loadIdps.request());
    }, [dispatch])
  );

  const onIdpSelected = (idp: LocalIdpsFallback) => {
    machineRef.send({ type: "select-spid-idp", idp });
  };

  if (isLoading) {
    return <LoadingView />;
  }

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

const LoadingView = () => {
  const navigation = useIONavigation();

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false
    });
  });

  return <LoadingComponent captionTitle={I18n.t("global.genericWaiting")} />;
};
