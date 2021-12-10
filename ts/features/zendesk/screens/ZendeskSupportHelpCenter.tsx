import React, { useEffect } from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { useDispatch } from "react-redux";
import I18n from "../../../i18n";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import View from "../../../components/ui/TextWithIcon";
import { getZendeskConfig, zendeskSupportBack } from "../store/actions";
import ZendeskSupportComponent from "../../../components/ZendeskSupportComponent";

/**
 * Ingress screen to access the Zendesk assistance tool
 * the user can choose to open a new ticket, follow previous conversations or read the faqs
 * @constructor
 */
const ZendeskSupportHelpCenter = () => {
  const dispatch = useDispatch();
  const workUnitBack = () => dispatch(zendeskSupportBack());
  /**
   * as first step request the config (categories + panicmode) that could
     be used in the next steps (possible network error are handled in {@link ZendeskAskPermissions})
   */
  useEffect(() => {
    dispatch(getZendeskConfig.request());
  }, [dispatch]);

  return (
    <BaseScreenComponent
      showInstabugChat={false}
      customGoBack={<View />}
      customRightIcon={{
        iconName: "io-close",
        onPress: workUnitBack,
        accessibilityLabel: I18n.t("global.accessibility.contextualHelp.close")
      }}
      headerTitle={I18n.t("support.helpCenter.header")}
    >
      <SafeAreaView
        style={IOStyles.flex}
        testID={"ZendeskSupportHelpCenterScreen"}
      >
        <ScrollView style={[IOStyles.horizontalContentPadding]}>
          <View spacer />
          <ZendeskSupportComponent />
        </ScrollView>
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default ZendeskSupportHelpCenter;
