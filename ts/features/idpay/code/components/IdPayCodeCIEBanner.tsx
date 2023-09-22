import * as React from "react";
import { VSpacer, Banner } from "@pagopa/io-app-design-system";
import I18n from "../../../../i18n";
import { useIODispatch } from "../../../../store/hooks";

// export type IdPayCodeCIEBannerParams = {};

const IdPayCodeCIEBanner = () => {
  const bannerViewRef = React.useRef(null);
  // const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const dispatch = useIODispatch();

  return (
    <>
      {/* <IdPayCodeCIEBanner /> */}
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
        onClose={() => {
          // TODO: Dispatch action to hide banner and save it in the store
        }}
        labelClose={I18n.t(
          "idpay.initiative.discountDetails.IDPayCode.banner.close"
        )}
        viewRef={bannerViewRef}
      />
      <VSpacer size={24} />
    </>
  );
};

export { IdPayCodeCIEBanner };
