import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { ButtonLink, HeaderSecondLevel } from "@pagopa/io-app-design-system";
import React from "react";
import { StyleSheet, View } from "react-native";
import I18n from "../../../../i18n";
import { ItwSkeumorphicCard } from "../../common/components/ItwSkeumorphicCard";
import { StoredCredential } from "../../common/utils/itwTypesUtils";

type UseCredentialFullScreenCardModalProps = {
  credential: StoredCredential;
};

export const useCredentialFullScreenCardModal = (
  props: UseCredentialFullScreenCardModalProps
) => {
  const { credential } = props;

  const [isFlipped, setFlipped] = React.useState(false);
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
            accessibilityLabel: I18n.t("global.buttons.close"),
            onPress: handleCloseModalPress
          }}
        />
        <View style={styles.cardContainer}>
          <ItwSkeumorphicCard
            credential={credential}
            isFlipped={isFlipped}
            orientation="landscape"
          />
        </View>
        <View style={styles.flipButton}>
          <ButtonLink
            label={I18n.t(
              `features.itWallet.presentation.credentialDetails.card.${
                isFlipped ? "showFront" : "showBack"
              }`
            )}
            onPress={() => setFlipped(_ => !_)}
            icon="switchCard"
            iconPosition="end"
          />
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
    position: "absolute",
    paddingHorizontal: 24,
    flex: 1,
    justifyContent: "center",
    width: "100%",
    height: "100%"
  },
  flipButton: {
    alignSelf: "center",
    position: "absolute",
    bottom: 32
  }
});
