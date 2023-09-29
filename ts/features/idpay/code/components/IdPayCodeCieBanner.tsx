import * as React from "react";
import { VSpacer, Banner } from "@pagopa/io-app-design-system";
import I18n from "../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { idpayInitiativeInstrumentsGet } from "../../configuration/store/actions";
import { showIdPayCodeBannerSelector } from "../store/selectors";
import { ScaleInOutAnimation } from "../../../../components/animations/ScaleInOutAnimation";
import { preferencesIdPayCodeCieBannerClose } from "../../../../store/actions/persistedPreferences";

export type IdPayCodeCIEBannerParams = {
  initiativeId: string;
};

const IdPayCodeCieBanner = ({ initiativeId }: IdPayCodeCIEBannerParams) => {
  const bannerViewRef = React.useRef(null);
  // const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const dispatch = useIODispatch();
  const showBanner = useIOSelector(showIdPayCodeBannerSelector);

  React.useEffect(() => {
    if (initiativeId) {
      dispatch(
        idpayInitiativeInstrumentsGet.request({
          initiativeId
        })
      );
    }
  }, [initiativeId, dispatch]);

  const handleOnCloseBanner = () => {
    dispatch(preferencesIdPayCodeCieBannerClose({ initiativeId }));
  };

  if (showBanner) {
    return (
      <ScaleInOutAnimation>
        <Banner
          color="turquoise"
          pictogramName="cie"
          title={I18n.t(
            "idpay.initiative.discountDetails.IDPayCode.banner.title"
          )}
          size="big"
          content={I18n.t(
            "idpay.initiative.discountDetails.IDPayCode.banner.body"
          )}
          action={I18n.t(
            "idpay.initiative.discountDetails.IDPayCode.banner.action"
          )}
          onPress={() => {
            // TODO: Navigate to the onboarding IDPay code screen
          }}
          onClose={handleOnCloseBanner}
          labelClose={I18n.t(
            "idpay.initiative.discountDetails.IDPayCode.banner.close"
          )}
          viewRef={bannerViewRef}
        />
        <VSpacer size={24} />
      </ScaleInOutAnimation>
    );
  }

  return <></>;
};

export { IdPayCodeCieBanner };
