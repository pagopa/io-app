import { VSpacer } from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import React from "react";
import { Alert } from "react-native";
import { SpidIdp } from "../../../../../definitions/content/SpidIdp";
import { isReady } from "../../../../common/model/RemoteValue";
import IdpsGrid from "../../../../components/IdpsGrid";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
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
import { getItwGenericMappedError } from "../../common/utils/itwErrorsUtils";
import { useItwIdpIdentification } from "../hooks/useItwIdpIdentification";

export const ItwIdentificationIdpSelectionScreen = () => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();

  const idps = useIOSelector(idpsRemoteValueSelector);
  const idpValue = isReady(idps) ? idps.value.items : idpsFallback;
  const randomIdps = React.useRef<ReadonlyArray<SpidIdp | LocalIdpsFallback>>(
    randomOrderIdps(idpValue)
  );

  const { startIdentification, ...identification } = useItwIdpIdentification();

  useFocusEffect(
    React.useCallback(() => {
      dispatch(loadIdps.request());
    }, [dispatch])
  );

  React.useEffect(() => {
    if (identification.result) {
      Alert.alert("Identification", identification.result, [
        { text: "Ok", onPress: navigation.goBack }
      ]);
    }
  }, [identification.result, navigation]);

  if (identification.error) {
    const mappedError = getItwGenericMappedError(() => navigation.goBack());
    return <OperationResultScreenContent {...mappedError} />;
  }

  if (identification.isPending) {
    return <LoadingView />;
  }

  return (
    <IOScrollViewWithLargeHeader title={{ label: "" }}>
      <IdpsGrid
        idps={randomIdps.current}
        onIdpSelected={startIdentification}
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
