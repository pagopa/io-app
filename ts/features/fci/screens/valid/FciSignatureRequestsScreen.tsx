import * as React from "react";
import { SectionList, ScrollView } from "react-native";
import { H2, IOStyles } from "@pagopa/io-app-design-system";
import { SafeAreaView } from "react-native-safe-area-context";
import SignatureRequestItem from "../../components/SignatureRequestItem";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { fciSignaturesListSelector } from "../../store/reducers/fciSignaturesList";
import { fciSignaturesListRequest } from "../../store/actions";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import I18n from "../../../../i18n";
import { assistanceToolConfigSelector } from "../../../../store/reducers/backendStatus";
import {
  addTicketCustomField,
  assistanceToolRemoteConfig,
  resetCustomFields,
  zendeskCategoryId,
  zendeskFCICategory,
  zendeskFciId
} from "../../../../utils/supportAssistance";
import {
  zendeskSelectedCategory,
  zendeskSupportStart
} from "../../../zendesk/store/actions";
import { ToolEnum } from "../../../../../definitions/content/AssistanceToolConfig";
import { SignatureRequestListView } from "../../../../../definitions/fci/SignatureRequestListView";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";

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
    addTicketCustomField(zendeskFciId, signatureRequestId ?? "");
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

  useHeaderSecondLevel({
    title: I18n.t("features.fci.requests.header"),
    contextualHelp: emptyContextualHelp,
    supportRequest: true
  });

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
      <>
        <SafeAreaView style={IOStyles.flex} edges={["bottom", "left", "right"]}>
          <ScrollView style={IOStyles.horizontalContentPadding}>
            <H2>{I18n.t("features.fci.requests.title")}</H2>
            {renderSignatureRequests()}
          </ScrollView>
        </SafeAreaView>
      </>
    </LoadingSpinnerOverlay>
  );
};
export default FciSignatureRequestsScreen;
