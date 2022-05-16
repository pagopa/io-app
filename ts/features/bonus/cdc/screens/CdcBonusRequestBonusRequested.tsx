import * as React from "react";
import { useEffect, useMemo } from "react";
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
import { Anno } from "../../../../../definitions/cdc/Anno";
import { EsitoRichiestaEnum } from "../../../../../definitions/cdc/EsitoRichiesta";
import CdcWrongFormat from "../components/CdcWrongFormat";

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
  />
);

const SuccessComponent = (props: {
  selectedBonus: CdcSelectedBonusList;
  bonusResponse: CdcBonusRequestResponse;
}) => {
  const notInItalySelectedBonusYears: ReadonlyArray<Anno> = props.selectedBonus
    .filter(b => b.residence === "notItaly")
    .map(b => b.year);

  switch (props.bonusResponse.kind) {
    case "success":
      // if the answer is "successful" but there is at least one year for which the user has declared to have "notItaly" residence
      // return the PartialSuccessComponent
      return notInItalySelectedBonusYears.length > 0 ? (
        <CdcRequestPartiallySuccess
          failedYears={notInItalySelectedBonusYears}
          successYears={props.bonusResponse.value.map(b => b.year)}
        />
      ) : (
        <CdcRequestCompleted />
      );
    case "partialSuccess":
      return (
        <CdcRequestPartiallySuccess
          failedYears={[
            ...notInItalySelectedBonusYears,
            ...props.bonusResponse.value
              .filter(b => b.outcome !== EsitoRichiestaEnum.OK)
              .map(b => b.year)
          ]}
          successYears={props.bonusResponse.value
            .filter(b => b.outcome === EsitoRichiestaEnum.OK)
            .map(b => b.year)}
        />
      );
    case "wrongFormat":
      return <CdcWrongFormat />;
  }
};

const CdcBonusRequestBonusRequested = () => {
  const dispatch = useIODispatch();
  const cdcSelectedBonus = useIOSelector(cdcSelectedBonusSelector);
  const cdcEnrollUserToBonusRequest = useIOSelector(
    cdcEnrollUserToBonusSelector
  );

  const bonusWithRequirements = useMemo(
    () => cdcSelectedBonus?.filter(b => b.residence === "italy"),
    [cdcSelectedBonus]
  );

  useEffect(() => {
    if (bonusWithRequirements && bonusWithRequirements.length > 0) {
      dispatch(
        cdcEnrollUserToBonus.request(
          bonusWithRequirements.map(b => ({ year: b.year }))
        )
      );
    }
  }, [bonusWithRequirements, dispatch]);

  if (!bonusWithRequirements?.length) {
    return <CdcRequirementsError />;
  }

  return fold(
    cdcEnrollUserToBonusRequest,
    () => <LoadingComponent />,
    () => <LoadingComponent />,
    b => (
      <SuccessComponent
        bonusResponse={b}
        selectedBonus={cdcSelectedBonus ?? []}
      />
    ),
    _ => null
  );
};

export default CdcBonusRequestBonusRequested;
