import * as pot from "@pagopa/ts-commons/lib/pot";
import React from "react";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { itwCredentialsAddPid } from "../../store/actions";
import { PidMockType } from "../../utils/mocks";
import { ItwCredentialsSelector } from "../../store/reducers/itwCredentials";
import ItwLoadingSpinnerOverlay from "../../components/ItwLoadingSpinnerOverlay";

type PidIssuingScreenProps = {
  vc: PidMockType;
};

const PidIssuingScreen = ({ vc }: PidIssuingScreenProps) => {
  const dispatch = useIODispatch();
  const credentials = useIOSelector(ItwCredentialsSelector);
  useOnFirstRender(() => {
    dispatch(itwCredentialsAddPid.request(vc));
  });

  const LoadingScreen = () => (
    <ItwLoadingSpinnerOverlay
      captionTitle="example"
      isLoading
      captionSubtitle="exampl2"
    >
      <></>
    </ItwLoadingSpinnerOverlay>
  );

  return pot.fold(
    credentials,
    () => <LoadingScreen />,
    () => <LoadingScreen />,
    () => <LoadingScreen />,
    _ => <></>,
    _ => <></>,
    () => <LoadingScreen />,
    () => <LoadingScreen />,
    (_, __) => <></>
  );
};

export default PidIssuingScreen;
