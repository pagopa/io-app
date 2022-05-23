import * as React from "react";
import { useEffect } from "react";
import { constNull } from "fp-ts/lib/function";
import {
  cdcEnrollUserToBonusSelector,
  cdcSelectedBonusSelector
} from "../store/reducers/cdcBonusRequest";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import CdcRequirementsError from "../components/CdcRequirementsError";
import { cdcEnrollUserToBonus } from "../store/actions/cdcBonusRequest";
import { fold } from "../../bpd/model/RemoteValue";
import CdcRequestCompleted from "../components/CdcRequestCompleted";
import { LoadingErrorComponent } from "../../bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import I18n from "../../../../i18n";
import {
  CdcBonusRequestResponse,
  CdcSelectedBonusList
} from "../types/CdcBonusRequest";
import CdcRequestPartiallySuccess from "../components/CdcRequestPartiallySuccess";
import CdcWrongFormat from "../components/CdcWrongFormat";
import CdcGenericError from "../components/CdcGenericError";

const LoadingComponent = () => (
  <LoadingErrorComponent
    isLoading={true}
    loadingCaption={I18n.t(
      "bonus.cdc.bonusRequest.bonusRequested.loading.title"
    )}
    loadingSubtitle={I18n.t(
      "bonus.cdc.bonusRequest.bonusRequested.loading.subtitle"
    )}
    onRetry={constNull}
    testID={"loadingComponent"}
  />
);

const SuccessComponent = (props: {
  selectedBonus: CdcSelectedBonusList;
  bonusResponse: CdcBonusRequestResponse;
}) => {
  switch (props.bonusResponse.kind) {
    case "success":
      return <CdcRequestCompleted />;
    case "partialSuccess":
      return <CdcRequestPartiallySuccess />;
    case "requirementsError":
      return <CdcRequirementsError />;
    case "wrongFormat":
      return <CdcWrongFormat />;
    case "genericError":
      return <CdcGenericError />;
  }
};

const CdcBonusRequestBonusRequested = () => {
  const dispatch = useIODispatch();
  const cdcSelectedBonus = useIOSelector(cdcSelectedBonusSelector);
  const cdcEnrollUserToBonusRequest = useIOSelector(
    cdcEnrollUserToBonusSelector
  );

  useEffect(() => {
    if (cdcSelectedBonus) {
      dispatch(cdcEnrollUserToBonus.request(cdcSelectedBonus));
    }
  }, [cdcSelectedBonus, dispatch]);

  if (!cdcSelectedBonus?.length) {
    return <CdcGenericError />;
  }

  return fold(
    cdcEnrollUserToBonusRequest,
    () => <LoadingComponent />,
    () => <LoadingComponent />,
    b => (
      <SuccessComponent bonusResponse={b} selectedBonus={cdcSelectedBonus} />
    ),
    _ => <CdcGenericError />
  );
};

export default CdcBonusRequestBonusRequested;
