import * as React from "react";
import { constNull } from "fp-ts/lib/function";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { SignatureRequestDetailView } from "../../../../definitions/fci/SignatureRequestDetailView";
import { IOStackNavigationRouteProps } from "../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { FciParamsList } from "../navigation/params";
import { fciEndRequest, fciSignatureRequestFromId } from "../store/actions";
import { fciSignatureRequestSelector } from "../store/reducers/fciSignatureRequest";
import { LoadingErrorComponent } from "../../bonus/bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import SuccessComponent from "../components/SuccessComponent";
import GenericErrorComponent from "../components/GenericErrorComponent";

export type FciRouterScreenNavigationParams = Readonly<{
  signatureRequestId: SignatureRequestDetailView["id"];
}>;

const FciSignatureScreen = (
  props: IOStackNavigationRouteProps<FciParamsList, "FCI_ROUTER">
): React.ReactElement => {
  const signatureRequestId = props.route.params.signatureRequestId;
  const dispatch = useIODispatch();
  const fciSignatureRequest = useIOSelector(fciSignatureRequestSelector);

  React.useEffect(() => {
    dispatch(fciSignatureRequestFromId.request(signatureRequestId));
  }, [dispatch, signatureRequestId]);

  const LoadingComponent = () => (
    <LoadingErrorComponent
      isLoading={true}
      loadingCaption={""}
      onRetry={constNull}
      testID={"FciRouterLoadingScreenTestID"}
    />
  );

  return pot.fold(
    fciSignatureRequest,
    () => <LoadingComponent />,
    () => <LoadingComponent />,
    () => <LoadingComponent />,
    _ => <GenericErrorComponent onPress={() => dispatch(fciEndRequest())} />,
    b => <SuccessComponent signatureRequest={b} />,
    () => <LoadingComponent />,
    () => <LoadingComponent />,
    _ => <GenericErrorComponent onPress={() => dispatch(fciEndRequest())} />
  );
};

export default FciSignatureScreen;
