import React from "react";
import I18n from "../../../i18n";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { SafeAreaView, ScrollView } from "react-native";
import { H1 } from "../../../components/core/typography/H1";
import View from "../../../components/ui/TextWithIcon";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import { useNavigationContext } from "../../../utils/hooks/useOnFocus";
import { navigateToZendeskChooseCategory } from "../store/actions/navigation";

const ZendeskAskPermissions = () => {
  const navigation = useNavigationContext();
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
