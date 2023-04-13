import * as React from "react";
import { SafeAreaView, View, SectionList } from "react-native";
import { constNull } from "fp-ts/lib/function";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import ScreenContent from "../../../../components/screens/ScreenContent";
import SignatureRequestItem from "../../components/SignatureRequestItem";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { fciSignaturesListSelector } from "../../store/reducers/fciSignaturesList";
import { fciSignaturesListRequest } from "../../store/actions";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import SectionHeaderComponent from "../../../../components/screens/SectionHeaderComponent";

const FciSignatureRequestsScreen = () => {
  const dispatch = useIODispatch();
  const dataItems = useIOSelector(fciSignaturesListSelector);

  React.useEffect(() => {
    dispatch(fciSignaturesListRequest.request());
  }, [dispatch]);

  const renderSectionHeader = (info: { section: any }): React.ReactNode => (
    <SectionHeaderComponent
      sectionHeader={info.section.created_at.toLocaleDateString()}
    />
  );

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
        <SignatureRequestItem item={item} onPress={constNull} />
      )}
    />
  );

  return (
    <LoadingSpinnerOverlay isLoading={dataItems === undefined}>
      <BaseScreenComponent
        goBack={true}
        headerTitle={"Stato delle firme"}
        contextualHelp={emptyContextualHelp}
      >
        <SafeAreaView style={IOStyles.flex}>
          <ScreenContent title={"Gli stati delle tue firme"}>
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
