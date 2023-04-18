import * as React from "react";
import { SafeAreaView, View, SectionList } from "react-native";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import ScreenContent from "../../../../components/screens/ScreenContent";
import SignatureRequestItem from "../../components/SignatureRequestItem";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { fciSignaturesListSelector } from "../../store/reducers/fciSignaturesList";
import { fciSignaturesListRequest } from "../../store/actions";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import I18n from "../../../../i18n";
import { assistanceToolConfigSelector } from "../../../../store/reducers/backendStatus";
import {
  addTicketCustomField,
  appendLog,
  assistanceToolRemoteConfig,
  resetCustomFields,
  zendeskCategoryId,
  zendeskFCICategory
} from "../../../../utils/supportAssistance";
import {
  zendeskSelectedCategory,
  zendeskSupportStart
} from "../../../zendesk/store/actions";
import { ToolEnum } from "../../../../../definitions/content/AssistanceToolConfig";
import { SignatureRequestListView } from "../../../../../definitions/fci/SignatureRequestListView";

const FciSignatureRequestsScreen = () => {
  const dispatch = useIODispatch();
  const dataItems = useIOSelector(fciSignaturesListSelector);
  const assistanceToolConfig = useIOSelector(assistanceToolConfigSelector);
  const choosenTool = assistanceToolRemoteConfig(assistanceToolConfig);

  const zendeskAssistanceLogAndStart = (
    signatureRequestId: SignatureRequestListView["id"]
  ) => {
    resetCustomFields();
    addTicketCustomField(zendeskCategoryId, zendeskFCICategory.value);
    // Append the signatureRequestID in the log
    appendLog(JSON.stringify(signatureRequestId));
    dispatch(
      zendeskSupportStart({
        startingRoute: "n/a",
        assistanceForPayment: false,
        assistanceForCard: false,
        assistanceForFci: true
      })
    );
    dispatch(zendeskSelectedCategory(zendeskFCICategory));
  };

  const handleAskAssistance = (
    signatureRequestId: SignatureRequestListView["id"]
  ) => {
    switch (choosenTool) {
      case ToolEnum.zendesk:
        zendeskAssistanceLogAndStart(signatureRequestId);
        break;
    }
  };

  React.useEffect(() => {
    dispatch(fciSignaturesListRequest.request());
  }, [dispatch]);

  const renderSignatureRequests = () => (
    <SectionList
      sections={dataItems.map(item => ({
        title: item.dossier_title,
        created_at: item.created_at,
        data: [item]
      }))}
      keyExtractor={(_, index) => `${index}`}
      testID={"FciSignatureRequestsListTestID"}
      renderItem={({ item }) => (
        <SignatureRequestItem
          item={item}
          onPress={() => handleAskAssistance(item.id)}
        />
      )}
    />
  );

  return (
    <LoadingSpinnerOverlay isLoading={dataItems === undefined}>
      <BaseScreenComponent
        goBack={true}
        headerTitle={I18n.t("features.fci.requests.header")}
      >
        <SafeAreaView style={IOStyles.flex}>
          <ScreenContent title={I18n.t("features.fci.requests.title")}>
            <View style={[IOStyles.flex, IOStyles.horizontalContentPadding]}>
              {renderSignatureRequests()}
            </View>
          </ScreenContent>
        </SafeAreaView>
      </BaseScreenComponent>
    </LoadingSpinnerOverlay>
  );
};
export default FciSignatureRequestsScreen;
