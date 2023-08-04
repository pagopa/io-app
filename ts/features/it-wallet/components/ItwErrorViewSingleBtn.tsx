import React from "react";
import { IOPictograms, Pictogram } from "@pagopa/io-app-design-system";
import { ItWalletError } from "../utils/errors/itwErrors";
import {
  getItwGenericError,
  mapItwError
} from "../utils/errors/itwErrorsMapping";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import { InfoScreenComponent } from "../../../components/infoScreen/InfoScreenComponent";
import I18n from "../../../i18n";

export type ItwErrorViewProps = {
  onClosePress: () => void;
  error?: ItWalletError;
  pictogramName?: IOPictograms;
};

const ItwErrorViewSingleBtn = ({
  error,
  onClosePress,
  pictogramName = "error"
}: ItwErrorViewProps) => {
  const mappedError = error ? mapItwError(error) : getItwGenericError();
  const cancelButtonProps = {
    block: true,
    light: false,
    bordered: true,
    onPress: onClosePress,
    title: I18n.t("features.itWallet.generic.close")
  };
  return (
    <>
      <InfoScreenComponent
        title={mappedError.title}
        body={mappedError.body}
        image={<Pictogram name={pictogramName} />}
      />
      <FooterWithButtons type={"SingleButton"} leftButton={cancelButtonProps} />
    </>
  );
};

export default ItwErrorViewSingleBtn;
