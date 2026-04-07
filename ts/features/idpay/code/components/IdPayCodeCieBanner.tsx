import { Banner, VSpacer } from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import I18n from "i18next";
import { useEffect, useRef } from "react";
import { View } from "react-native";

import { IOStackNavigationProp } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { isIdPayCiePaymentCodeEnabledSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { isLoadingDiscountInitiativeInstrumentsSelector } from "../../configuration/store";
import { idpayInitiativeInstrumentsGet } from "../../configuration/store/actions";
import { IdPayCodeParamsList } from "../navigation/params";
import { IdPayCodeRoutes } from "../navigation/routes";
import { idPayCodeCieBannerClose } from "../store/actions";
import { showIdPayCodeBannerSelector } from "../store/selectors";

type IdPayCodeCIEBannerParams = {
  initiativeId: string;
};

const IdPayCodeCieBanner = ({ initiativeId }: IdPayCodeCIEBannerParams) => {
  const bannerViewRef = useRef<View>(null);
  const navigation =
    useNavigation<IOStackNavigationProp<IdPayCodeParamsList>>();
  const dispatch = useIODispatch();
  const isIdPayCodeCieEnabled = useIOSelector(
    isIdPayCiePaymentCodeEnabledSelector
  );
  const showBanner =
    useIOSelector(showIdPayCodeBannerSelector) && isIdPayCodeCieEnabled;
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
          action={I18n.t(
            "idpay.initiative.discountDetails.IDPayCode.banner.action"
          )}
          color="turquoise"
          content={I18n.t(
            "idpay.initiative.discountDetails.IDPayCode.banner.body"
          )}
          labelClose={I18n.t(
            "idpay.initiative.discountDetails.IDPayCode.banner.close"
          )}
          onClose={handleOnCloseBanner}
          onPress={handleNavigateToOnboardingStart}
          pictogramName="cie"
          ref={bannerViewRef}
          title={I18n.t(
            "idpay.initiative.discountDetails.IDPayCode.banner.title"
          )}
        />
        <VSpacer size={24} />
      </>
    );
  }

  return <></>;
};

export { IdPayCodeCieBanner };
