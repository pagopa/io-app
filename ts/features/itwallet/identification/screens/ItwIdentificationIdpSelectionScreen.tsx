import { VSpacer } from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import React from "react";
import { SpidIdp } from "../../../../../definitions/content/SpidIdp";
import { isReady } from "../../../../common/model/RemoteValue";
import IdpsGrid from "../../../../components/IdpsGrid";
import { RNavScreenWithLargeHeader } from "../../../../components/ui/RNavScreenWithLargeHeader";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { randomOrderIdps } from "../../../../screens/authentication/IdpSelectionScreen";
import { loadIdps } from "../../../../store/actions/content";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { idpsRemoteValueSelector } from "../../../../store/reducers/content";
import {
  LocalIdpsFallback,
  idps as idpsFallback
} from "../../../../utils/idps";
import {
  getPidCredentialCatalogItem,
  pidDataMock
} from "../../common/utils/itwMocksUtils";
import { itwIssuanceEid } from "../../issuance/store/actions/eid";
import { ITW_ROUTES } from "../../navigation/routes";

export const ItwIdentificationIdpSelectionScreen = () => {
  const navigation = useIONavigation();
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
    /** Mock request */
    const pidCredentialCatalogItem = getPidCredentialCatalogItem();
    dispatch(
      itwIssuanceEid.request({
        ...pidCredentialCatalogItem,
        pidData: {
          name: pidDataMock.name,
          surname: pidDataMock.surname,
          birthDate: pidDataMock.birthDate,
          fiscalCode: pidDataMock.fiscalCode
        }
      })
    );
    /** ---  */

    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ISSUANCE.EID_PREVIEW
    });
  };

  return (
    <RNavScreenWithLargeHeader title={{ label: "" }}>
      <IdpsGrid
        idps={randomIdps.current}
        onIdpSelected={onIdpSelected}
        headerComponent={undefined}
        footerComponent={<VSpacer size={24} />}
      />
    </RNavScreenWithLargeHeader>
  );
};
