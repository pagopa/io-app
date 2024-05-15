import { ButtonSolidProps } from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import { SafeAreaView } from "react-native";
import image from "../../../../img/pictograms/doubt.png";
import { FooterStackButton } from "../../../components/buttons/FooterStackButtons";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { InfoScreenComponent } from "../../../components/infoScreen/InfoScreenComponent";
import { renderInfoRasterImage } from "../../../components/infoScreen/imageRendering";
import I18n from "../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../store/hooks";
import { zendeskConfigSelector } from "../store/reducers";
import { handleContactSupport } from "../utils";

type Props = {
  assistanceForPayment: boolean;
  assistanceForCard: boolean;
  assistanceForFci: boolean;
};

const ZendeskEmptyTicketsComponent = ({
  assistanceForPayment,
  assistanceForCard,
  assistanceForFci
}: Props) => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const zendeskRemoteConfig = useIOSelector(zendeskConfigSelector);

  const handleContactSupportPress = React.useCallback(
    () =>
      handleContactSupport(
        navigation,
        assistanceForPayment,
        assistanceForCard,
        assistanceForFci,
        zendeskRemoteConfig
      ),
    [
      navigation,
      assistanceForPayment,
      assistanceForCard,
      assistanceForFci,
      zendeskRemoteConfig
    ]
  );

  const continueButtonProps: ButtonSolidProps = {
    label: I18n.t("support.helpCenter.cta.contactSupport"),
    accessibilityLabel: I18n.t("support.helpCenter.cta.contactSupport"),
    onPress: handleContactSupportPress,
    testID: "continueButtonId"
  };

  // It should be `ButtonOutlineProps`
  const cancelButtonProps: ButtonSolidProps = {
    label: I18n.t("global.buttons.back"),
    accessibilityLabel: I18n.t("global.buttons.back"),
    onPress: () => navigation.goBack(),
    testID: "cancelButtonId"
  };

  return (
    <SafeAreaView style={IOStyles.flex} testID={"emptyTicketsComponent"}>
      <InfoScreenComponent
        image={renderInfoRasterImage(image)}
        title={I18n.t("support.ticketList.noTicket.title")}
        body={I18n.t("support.ticketList.noTicket.body")}
      />
      <FooterStackButton
        primaryActionProps={continueButtonProps}
        secondaryActionProps={cancelButtonProps}
      />
    </SafeAreaView>
  );
};

export default ZendeskEmptyTicketsComponent;
