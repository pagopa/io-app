import React from "react";
import { SafeAreaView, ScrollView } from "react-native";
import I18n from "../../../i18n";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { H1 } from "../../../components/core/typography/H1";
import View from "../../../components/ui/TextWithIcon";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import { useNavigationContext } from "../../../utils/hooks/useOnFocus";
import { navigateToZendeskChooseCategory } from "../store/actions/navigation";
import { H4 } from "../../../components/core/typography/H4";
import { H3 } from "../../../components/core/typography/H3";
import { ListItem } from "native-base";
import FiscalCode from "../../../../img/assistence/fiscalCode.svg";
import { H5 } from "../../../components/core/typography/H5";
import { useIOSelector } from "../../../store/hooks";
import {
  idpSelector,
  selectedIdentityProviderSelector
} from "../../../store/reducers/authentication";
import { RTron } from "../../../boot/configureStoreAndPersistor";

const ZendeskAskPermissions = () => {
  const navigation = useNavigationContext();
  const idp = useIOSelector(idpSelector);

  RTron.log(idp);
  const cancelButtonProps = {
    testID: "cancelButtonId",
    primary: false,
    bordered: true,
    onPress: () => true, // TODO: complete the workunit and send the user to the web form
    title: I18n.t("support.askPermissions.cta.denies")
  };
  const continueButtonProps = {
    testID: "continueButtonId",
    bordered: false,
    onPress: () => navigation.navigate(navigateToZendeskChooseCategory()),
    title: I18n.t("support.askPermissions.cta.allow")
  };
  return (
    // The void customRightIcon is needed to have a centered header title
    <BaseScreenComponent
      showInstabugChat={false}
      goBack={true}
      customRightIcon={{
        iconName: "",
        onPress: () => true
      }}
      headerTitle={I18n.t("support.askPermissions.header")}
    >
      <SafeAreaView style={IOStyles.flex} testID={"ZendeskAskPermissions"}>
        <ScrollView style={[IOStyles.horizontalContentPadding]}>
          <H1>{I18n.t("support.askPermissions.title")}</H1>
          <View spacer />
          <H4 weight={"Regular"}>
            {
              "Per ricevere supporto è necessario inviare al team di IO alcuni dati. Se neghi il consenso, potrai inviare una richiesta generica via email."
            }
          </H4>
          <View spacer />
          <H3>{"Verranno inviati i seguenti dati:"}</H3>
          <View spacer />
          <ListItem first={true}>
            <View
              style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
            >
              <FiscalCode width={30} height={30} />
              <View hspacer />
              <View style={{ flex: 1, flexDirection: "column" }}>
                <H4>{"Codice Fiscale"}</H4>
                <H5 weight={"Regular"}>{"RSSMRA60D20F205R"}</H5>
              </View>
            </View>
          </ListItem>
        </ScrollView>
        <FooterWithButtons
          type={"TwoButtonsInlineHalf"}
          leftButton={cancelButtonProps}
          rightButton={continueButtonProps}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default ZendeskAskPermissions;
