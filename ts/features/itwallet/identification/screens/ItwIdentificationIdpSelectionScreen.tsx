import { VSpacer } from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import React from "react";
import { SpidIdp } from "../../../../../definitions/content/SpidIdp";
import { isReady } from "../../../../common/model/RemoteValue";
import IdpsGrid from "../../../../components/IdpsGrid";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { randomOrderIdps } from "../../../../screens/authentication/IdpSelectionScreen";
import { loadIdps } from "../../../../store/actions/content";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { idpsRemoteValueSelector } from "../../../../store/reducers/content";
import {
  LocalIdpsFallback,
  idps as idpsFallback
} from "../../../../utils/idps";
import { useItwIdpIdentificationWebView } from "../hooks/useItwIdpIdentificationWebView";

export const ItwIdentificationIdpSelectionScreen = () => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();

  const { startIdentification } = useItwIdpIdentificationWebView();
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
    startIdentification(idp);
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
