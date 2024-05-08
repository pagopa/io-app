import { VSpacer } from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import React from "react";
import { Alert } from "react-native";
import { SpidIdp } from "../../../../../definitions/content/SpidIdp";
import { isReady } from "../../../../common/model/RemoteValue";
import IdpsGridRevamp from "../../../../components/IdpsGridRevamp";
import { RNavScreenWithLargeHeader } from "../../../../components/ui/RNavScreenWithLargeHeader";
import { randomOrderIdps } from "../../../../screens/authentication/IdpSelectionScreen";
import { loadIdps } from "../../../../store/actions/content";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { idpsRemoteValueSelector } from "../../../../store/reducers/content";
import {
  LocalIdpsFallback,
  idps as idpsFallback
} from "../../../../utils/idps";

export const ItwIdentificationIdpSelectionScreen = () => {
  const dispatch = useIODispatch();
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

  const onIdpSelected = (_idp: LocalIdpsFallback) => {
    Alert.alert("Not implemented");
  };

  return (
    <RNavScreenWithLargeHeader title={{ label: "" }}>
      <IdpsGridRevamp
        idps={randomIdps.current}
        onIdpSelected={onIdpSelected}
        headerComponent={undefined}
        footerComponent={<VSpacer size={24} />}
      />
    </RNavScreenWithLargeHeader>
  );
};
