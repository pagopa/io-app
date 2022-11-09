import * as React from "react";
import { constNull } from "fp-ts/lib/function";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { SignatureRequestDetailView } from "../../../../definitions/fci/SignatureRequestDetailView";
import { IOStackNavigationRouteProps } from "../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { FciParamsList } from "../navigation/params";
import { fciSignatureRequestFromId } from "../store/actions/fciSignatureRequest";
import { fciSignatureDetailViewSelector } from "../store/reducers/fciSignatureDetailView";
import { LoadingErrorComponent } from "../../bonus/bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import SuccessComponent from "../components/SuccessComponent";
import GenericErrorComponent from "../components/GenericErrorComponent";

export type FciSignatureScreenNavigationParams = Readonly<{
  signatureRequestId: SignatureRequestDetailView["id"];
}>;

const FciSignatureScreen = (
  props: IOStackNavigationRouteProps<FciParamsList, "FCI_SIGNATURE">
): React.ReactElement => {
  const dispatch = useIODispatch();
  const fciSignatureDetailViewRequest = useIOSelector(
    fciSignatureDetailViewSelector
  );

  React.useEffect(() => {
    const signatureRequestId = props.route.params.signatureRequestId;
    dispatch(fciSignatureRequestFromId.request(signatureRequestId));
  }, [dispatch, props.route.params.signatureRequestId]);

  const LoadingComponent = () => (
    <LoadingErrorComponent
      isLoading={true}
      loadingCaption={""}
      onRetry={constNull}
      testID={"FciRouterLoadingScreenTestID"}
    />
  );

  return pot.fold(
    fciSignatureDetailViewRequest,
    () => <LoadingComponent />,
    () => <LoadingComponent />,
    () => <LoadingComponent />,
    _ => <GenericErrorComponent />,
    b => <SuccessComponent signatureRequest={b} />,
    () => <LoadingComponent />,
    () => <LoadingComponent />,
    _ => <GenericErrorComponent />
  );
};

export default FciSignatureScreen;
