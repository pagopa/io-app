import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { HeaderSecondLevel } from "@pagopa/io-app-design-system";
import React from "react";
import { StyleSheet, View } from "react-native";
import { ItwSkeumorphicCard } from "../../common/components/ItwSkeumorphicCard";
import { StoredCredential } from "../../common/utils/itwTypesUtils";

type UseCredentialFullScreenCardModalProps = {
  credential: StoredCredential;
};

export const useCredentialFullScreenCardModal = (
  props: UseCredentialFullScreenCardModalProps
) => {
  const { credential } = props;
  const bottomSheetModalRef = React.useRef<BottomSheetModal>(null);

  const handlePresentModalPress = React.useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const handleCloseModalPress = React.useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
  }, []);

  const modal = (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      snapPoints={["100%"]}
      handleComponent={null}
      enablePanDownToClose={false}
      enableOverDrag={false}
    >
      <BottomSheetView style={styles.contentContainer}>
        <HeaderSecondLevel
          title={""}
          type="singleAction"
          firstAction={{
            icon: "closeLarge",
            accessibilityLabel: "Close",
            onPress: handleCloseModalPress
          }}
        />
        <View style={styles.cardContainer}>
          <ItwSkeumorphicCard credential={credential} />
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );

  return {
    present: handlePresentModalPress,
    close: handleCloseModalPress,
    content: modal
  };
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1
  },
  cardContainer: {
    flex: 1,
    padding: 24,
    width: "100%",
    height: "100%"
  }
});
