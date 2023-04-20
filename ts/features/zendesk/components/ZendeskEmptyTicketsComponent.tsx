import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import { SafeAreaView } from "react-native";
import image from "../../../../img/pictograms/doubt.png";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { renderInfoRasterImage } from "../../../components/infoScreen/imageRendering";
import { InfoScreenComponent } from "../../../components/infoScreen/InfoScreenComponent";
import I18n from "../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../store/hooks";
import { FooterStackButton } from "../../bonus/bonusVacanze/components/buttons/FooterStackButtons";
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

  const continueButtonProps = {
    testID: "continueButtonId",
    bordered: false,
    onPress: handleContactSupportPress,
    title: I18n.t("support.helpCenter.cta.contactSupport")
  };

  const cancelButtonProps = {
    testID: "cancelButtonId",
    bordered: true,
    onPress: () => navigation.goBack(),
    title: I18n.t("global.buttons.back")
  };

  return (
    <SafeAreaView style={IOStyles.flex} testID={"emptyTicketsComponent"}>
      <InfoScreenComponent
        image={renderInfoRasterImage(image)}
        title={I18n.t("support.ticketList.noTicket.title")}
        body={I18n.t("support.ticketList.noTicket.body")}
      />
      <FooterStackButton buttons={[continueButtonProps, cancelButtonProps]} />
    </SafeAreaView>
  );
};

export default ZendeskEmptyTicketsComponent;
