import { useRef, useEffect } from "react";
import { VSpacer, Banner } from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";

import I18n from "../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { idpayInitiativeInstrumentsGet } from "../../configuration/store/actions";
import { showIdPayCodeBannerSelector } from "../store/selectors";
import { IdPayCodeParamsList } from "../navigation/params";
import { IdPayCodeRoutes } from "../navigation/routes";
import { IOStackNavigationProp } from "../../../../navigation/params/AppParamsList";
import { isLoadingDiscountInitiativeInstrumentsSelector } from "../../configuration/store";
import { idPayCodeCieBannerClose } from "../store/actions";

export type IdPayCodeCIEBannerParams = {
  initiativeId: string;
};

const IdPayCodeCieBanner = ({ initiativeId }: IdPayCodeCIEBannerParams) => {
  const bannerViewRef = useRef(null);
  const navigation =
    useNavigation<IOStackNavigationProp<IdPayCodeParamsList>>();
  const dispatch = useIODispatch();
  const showBanner = useIOSelector(showIdPayCodeBannerSelector);
  const isLoadingInitiativeInstruments = useIOSelector(
    isLoadingDiscountInitiativeInstrumentsSelector
  );

  useEffect(() => {
    if (initiativeId) {
      dispatch(
        idpayInitiativeInstrumentsGet.request({
          initiativeId
        })
      );
    }
  }, [initiativeId, dispatch]);

  const handleOnCloseBanner = () => {
    dispatch(idPayCodeCieBannerClose({ initiativeId }));
  };

  const handleNavigateToOnboardingStart = () => {
    navigation.navigate(IdPayCodeRoutes.IDPAY_CODE_MAIN, {
      screen: IdPayCodeRoutes.IDPAY_CODE_ONBOARDING,
      params: {
        initiativeId
      }
    });
  };

  if (showBanner && !isLoadingInitiativeInstruments) {
    return (
      <>
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
          onPress={handleNavigateToOnboardingStart}
          onClose={handleOnCloseBanner}
          labelClose={I18n.t(
            "idpay.initiative.discountDetails.IDPayCode.banner.close"
          )}
          viewRef={bannerViewRef}
        />
        <VSpacer size={24} />
      </>
    );
  }

  return <></>;
};

export { IdPayCodeCieBanner };
