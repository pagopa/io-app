import { H3 } from "@pagopa/io-app-design-system";
import React from "react";
import { RNavScreenWithLargeHeader } from "../../../../components/ui/RNavScreenWithLargeHeader";
import { useIODispatch } from "../../../../store/hooks";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";

export const ItwIssuanceEidPreviewScreen = () => {
  const dispatch = useIODispatch();

  return (
    <RNavScreenWithLargeHeader
      title={{ label: "{Identità Digitale}: ecco l’anteprima" }}
    >
      <H3>Hello</H3>
    </RNavScreenWithLargeHeader>
  );
};
