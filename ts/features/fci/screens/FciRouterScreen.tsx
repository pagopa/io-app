import * as React from "react";
import { constNull } from "fp-ts/lib/function";
import * as pot from "@pagopa/ts-commons/lib/pot";
import I18n from "../../../i18n";
import { SignatureRequestDetailView } from "../../../../definitions/fci/SignatureRequestDetailView";
import { IOStackNavigationRouteProps } from "../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { FciParamsList } from "../navigation/params";
import { fciEndRequest, fciSignatureRequestFromId } from "../store/actions";
import { fciSignatureRequestSelector } from "../store/reducers/fciSignatureRequest";
import { LoadingErrorComponent } from "../../bonus/bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import SuccessComponent from "../components/SuccessComponent";
import GenericErrorComponent from "../components/GenericErrorComponent";
import { withValidatedEmail } from "../../../components/helpers/withValidatedEmail";
import { isFciEnabledSelector } from "../../../store/reducers/backendStatus";

export type FciRouterScreenNavigationParams = Readonly<{
  signatureRequestId: SignatureRequestDetailView["id"];
}>;

const FciSignatureScreen = (
  props: IOStackNavigationRouteProps<FciParamsList, "FCI_ROUTER">
): React.ReactElement => {
  const signatureRequestId = props.route.params.signatureRequestId;
  const dispatch = useIODispatch();
  const fciSignatureRequest = useIOSelector(fciSignatureRequestSelector);
  const fciEnabled = useIOSelector(isFciEnabledSelector);

  React.useEffect(() => {
    if (fciEnabled) {
      dispatch(fciSignatureRequestFromId.request(signatureRequestId));
    }
  }, [dispatch, signatureRequestId, fciEnabled]);

  if (!fciEnabled) {
    return (
      <GenericErrorComponent
        title={I18n.t("features.fci.errors.generic.default.title")}
        subTitle={I18n.t("features.fci.errors.generic.default.subTitle")}
        onPress={() => dispatch(fciEndRequest())}
        testID="GenericErrorComponentTestID"
      />
    );
  }

  const LoadingComponent = () => (
    <LoadingErrorComponent
      isLoading={true}
      loadingCaption={""}
      onRetry={constNull}
      testID={"FciRouterLoadingScreenTestID"}
    />
  );

  const ErrorComponent = () => (
    <GenericErrorComponent
      title={I18n.t("features.fci.errors.generic.default.title")}
      subTitle={I18n.t("features.fci.errors.generic.default.subTitle")}
      onPress={() => dispatch(fciEndRequest())}
      testID="GenericErrorComponentTestID"
    />
  );

  return pot.fold(
    fciSignatureRequest,
    () => <LoadingComponent />,
    () => <LoadingComponent />,
    () => <LoadingComponent />,
    _ => <ErrorComponent />,
    b => <SuccessComponent signatureRequest={b} />,
    () => <LoadingComponent />,
    () => <LoadingComponent />,
    _ => <ErrorComponent />
  );
};

export default withValidatedEmail(FciSignatureScreen);
