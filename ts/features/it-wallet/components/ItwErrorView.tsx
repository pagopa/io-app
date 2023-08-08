import React from "react";
import { IOPictograms, Pictogram } from "@pagopa/io-app-design-system";
import { ItWalletError } from "../utils/errors/itwErrors";
import {
  getItwGenericError,
  mapItwError
} from "../utils/errors/itwErrorsMapping";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import { InfoScreenComponent } from "../../../components/infoScreen/InfoScreenComponent";
import { BlockButtonsProps } from "../../../components/ui/BlockButtons";

export type ItwErrorViewProps = {
  error?: ItWalletError;
  pictogramName?: IOPictograms;
} & BlockButtonsProps;

const ItwErrorView = ({
  error,
  pictogramName,
  ...footerWithButtonsProps
}: ItwErrorViewProps) => {
  const mappedError = error ? mapItwError(error) : getItwGenericError();

  return (
    <>
      <InfoScreenComponent
        title={mappedError.title}
        body={mappedError.body}
        image={<Pictogram name={pictogramName ? pictogramName : "error"} />}
      />
      <FooterWithButtons {...footerWithButtonsProps} />
    </>
  );
};

export default ItwErrorView;
