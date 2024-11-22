import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { HeaderSecondLevel } from "@pagopa/io-app-design-system";
import React from "react";
import { StyleSheet, View } from "react-native";
import I18n from "../../../../i18n";
import { ItwSkeumorphicCard } from "../../common/components/ItwSkeumorphicCard";
import {
  ItwCredentialStatus,
  StoredCredential
} from "../../common/utils/itwTypesUtils";
import { ItwPresentationCredentialCardFlipButton } from "../components/ItwPresentationCredentialCardFlipButton";
import { useMaxBrightness } from "../../../../utils/brightness";

type UseCredentialFullScreenCardModalProps = {
  credential: StoredCredential;
  status: ItwCredentialStatus;
};

export const useCredentialFullScreenCardModal = ({
  credential,
  status
}: UseCredentialFullScreenCardModalProps) => {
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
      <CredentialFullScreenCardModal
        credential={credential}
        status={status}
        handleCloseModalPress={handleCloseModalPress}
      />
    </BottomSheetModal>
  );

  return {
    present: handlePresentModalPress,
    close: handleCloseModalPress,
    content: modal
  };
};

type CredentialFullScreenCardModalProps = {
  credential: StoredCredential;
  status: ItwCredentialStatus;
  handleCloseModalPress: () => void;
};

const CredentialFullScreenCardModal = ({
  credential,
  status,
  handleCloseModalPress
}: CredentialFullScreenCardModalProps) => {
  const [isFlipped, setFlipped] = React.useState(false);

  useMaxBrightness();

  return (
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
          status={status}
          isFlipped={isFlipped}
          orientation="landscape"
        />
      </View>
      <View style={styles.flipButtonContainer}>
        <ItwPresentationCredentialCardFlipButton
          isFlipped={isFlipped}
          handleOnPress={() => setFlipped(_ => !_)}
        />
      </View>
    </BottomSheetView>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1
  },
  cardContainer: {
    position: "absolute",
    paddingHorizontal: 24,
    justifyContent: "center",
    width: "100%",
    height: "100%"
  },
  flipButtonContainer: {
    position: "absolute",
    bottom: 32,
    left: 0,
    right: 0
  }
});
