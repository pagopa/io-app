import { H2, IOVisualCostants } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useEffect } from "react";
import { ScrollView, SectionList } from "react-native";

import { ToolEnum } from "../../../../../definitions/content/AssistanceToolConfig";
import { SignatureRequestListView } from "../../../../../definitions/fci/SignatureRequestListView";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { assistanceToolConfigSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { emptyContextualHelp } from "../../../../utils/contextualHelp";
import {
  addTicketCustomField,
  assistanceToolRemoteConfig,
  defaultZendeskBonusesCategory,
  resetCustomFields,
  zendeskBonusAndInitiativeCategoryId,
  zendeskCategoryId,
  zendeskFCICategory,
  zendeskFciId
} from "../../../../utils/supportAssistance";
import {
  zendeskSelectedCategory,
  zendeskSelectedSubcategory,
  zendeskSupportStart
} from "../../../zendesk/store/actions";
import SignatureRequestItem from "../../components/SignatureRequestItem";
import { fciSignaturesListRequest } from "../../store/actions";
import { fciSignaturesListSelector } from "../../store/reducers/fciSignaturesList";

const FciSignatureRequestsScreen = () => {
  const dispatch = useIODispatch();
  const dataItems = useIOSelector(fciSignaturesListSelector);
  const assistanceToolConfig = useIOSelector(assistanceToolConfigSelector);
  const choosenTool = assistanceToolRemoteConfig(assistanceToolConfig);

  const zendeskAssistanceLogAndStart = (
    signatureRequestId: SignatureRequestListView["id"]
  ) => {
    resetCustomFields();
    addTicketCustomField(
      zendeskCategoryId,
      defaultZendeskBonusesCategory.value
    );
    addTicketCustomField(
      zendeskBonusAndInitiativeCategoryId,
      zendeskFCICategory.value
    );
    addTicketCustomField(zendeskFciId, signatureRequestId ?? "");
    dispatch(
      zendeskSupportStart({
        startingRoute: "n/a",
        assistanceType: {
          fci: true
        }
      })
    );
    dispatch(zendeskSelectedCategory(defaultZendeskBonusesCategory));
    dispatch(zendeskSelectedSubcategory(zendeskFCICategory));
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

  useEffect(() => {
    dispatch(fciSignaturesListRequest.request());
  }, [dispatch]);

  useHeaderSecondLevel({
    title: I18n.t("features.fci.requests.header"),
    contextualHelp: emptyContextualHelp,
    supportRequest: true
  });

  const renderSignatureRequests = () => (
    <SectionList
      keyExtractor={(_, index) => `${index}`}
      renderItem={({ item }) => (
        <SignatureRequestItem
          item={item}
          onPress={() => handleAskAssistance(item.id)}
        />
      )}
      sections={dataItems.map(item => ({
        title: item.dossier_title,
        created_at: item.created_at,
        data: [item]
      }))}
      testID={"FciSignatureRequestsListTestID"}
    />
  );

  return (
    <LoadingSpinnerOverlay isLoading={dataItems === undefined}>
      {/* TODO: Replace with `IOScrollView` component. */}
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: IOVisualCostants.appMarginDefault
        }}
      >
        <H2>{I18n.t("features.fci.requests.title")}</H2>
        {renderSignatureRequests()}
      </ScrollView>
    </LoadingSpinnerOverlay>
  );
};
export default FciSignatureRequestsScreen;
