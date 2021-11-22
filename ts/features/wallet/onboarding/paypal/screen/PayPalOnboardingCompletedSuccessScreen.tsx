import React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { View } from "native-base";
import { SafeAreaView } from "react-native";
import { constNull } from "fp-ts/lib/function";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import { InfoScreenComponent } from "../../../../../components/infoScreen/InfoScreenComponent";
import { renderInfoRasterImage } from "../../../../../components/infoScreen/imageRendering";
import successImage from "../../../../../../img/pictograms/payment-completed.png";
import { confirmButtonProps } from "../../../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { GlobalState } from "../../../../../store/reducers/types";
import I18n from "../../../../../i18n";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import { paypalSelector } from "../../../../../store/reducers/wallet/wallets";
import { useNavigationContext } from "../../../../../utils/hooks/useOnFocus";
type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

/**
 * this screen shows that the onboarding is completed successfully
 * footer button navigates to the PayPal method details
 * @param props
 * @constructor
 */
const PayPalOnboardingCompletedSuccessScreen = (props: Props) => {
  const navigation = useNavigationContext();
  const navigateToDetailScreen = () =>
    navigation.navigate(
      navigateToPayPalDetailScreen(props.paypalPaymentMethod)
    );
  return (
    <BaseScreenComponent
      goBack={false}
      customGoBack={<View />}
      showInstabugChat={false}
    >
      <SafeAreaView
        style={IOStyles.flex}
        testID={"PayPalOnboardingCompletedSuccessScreen"}
      >
        <InfoScreenComponent
          image={renderInfoRasterImage(successImage)}
          title={I18n.t("wallet.onboarding.paypal.onBoardingCompleted.title")}
          body={I18n.t("wallet.onboarding.paypal.onBoardingCompleted.body")}
        />
        <FooterWithButtons
          type={"SingleButton"}
          leftButton={confirmButtonProps(
            props.methodDetails,
            I18n.t(
              "wallet.onboarding.paypal.onBoardingCompleted.primaryButton"
            ),
            undefined,
            "primaryButtonId"
          )}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (state: GlobalState) => ({
  paypalPaymentMethod: paypalSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PayPalOnboardingCompletedSuccessScreen);
