import {
  HeaderSecondLevel,
  useIOTheme,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import I18n from "i18next";
import { memo, useCallback, useLayoutEffect, useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IOStackNavigationRouteProps } from "../../../../../navigation/params/AppParamsList.ts";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks.ts";
import { useMaxBrightness } from "../../../../../utils/brightness.ts";
import { usePreventScreenCapture } from "../../../../../utils/hooks/usePreventScreenCapture.ts";
import { getMixPanelCredential } from "../../../analytics/utils";
import {
  ItwSkeumorphicCard,
  SKEUMORPHIC_CARD_ASPECT_RATIO
} from "../../../common/components/ItwSkeumorphicCard";
import { FlipGestureDetector } from "../../../common/components/ItwSkeumorphicCard/FlipGestureDetector.tsx";
import { itwSetClaimValuesHidden } from "../../../common/store/actions/preferences.ts";
import { itwIsClaimValueHiddenSelector } from "../../../common/store/selectors/preferences.ts";
import {
  ItwCredentialStatus,
  StoredCredential
} from "../../../common/utils/itwTypesUtils.ts";
import { itwLifecycleIsITWalletValidSelector } from "../../../lifecycle/store/selectors";
import { ItwParamsList } from "../../../navigation/ItwParamsList.ts";
import { trackCredentialCardModal } from "../analytics";
import { ItwPresentationCredentialCardFlipButton } from "../components/ItwPresentationCredentialCardFlipButton.tsx";
import { ItwPresentationCredentialCardHideValuesButton } from "../components/ItwPresentationCredentialCardHideValuesButton.tsx";

export type ItwPresentationCredentialCardModalNavigationParams = {
  credential: StoredCredential;
  status: ItwCredentialStatus;
};

type Props = IOStackNavigationRouteProps<
  ItwParamsList,
  "ITW_PRESENTATION_CREDENTIAL_CARD_MODAL"
>;

/**
 * Dispalys a full screen modal with the credential card.
 */
const ItwPresentationCredentialCardModal = ({ route, navigation }: Props) => {
  const { credential, status } = route.params;
  const safeAreaInsets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  // cardAreaHeight is measured via onLayout so we can clamp cardPreRotationWidth
  // on small devices: after rotate("90deg"), the visual card height = cardPreRotationWidth,
  // so we cap it to the available area height to prevent overlap with the footer.
  const [cardAreaHeight, setCardAreaHeight] = useState(0);
  const cardPreRotationWidth = Math.min(
    (screenWidth - 48) * SKEUMORPHIC_CARD_ASPECT_RATIO,
    cardAreaHeight
  );
  const [isFlipped, setFlipped] = useState(false);
  const theme = useIOTheme();
  const valuesHidden = useIOSelector(itwIsClaimValueHiddenSelector);
  const isItwL3 = useIOSelector(itwLifecycleIsITWalletValidSelector);
  const dispatch = useIODispatch();

  usePreventScreenCapture();
  useMaxBrightness({ useSmoothTransition: true });

  useFocusEffect(
    useCallback(() => {
      trackCredentialCardModal(
        getMixPanelCredential(credential.credentialType, isItwL3)
      );
    }, [credential.credentialType, isItwL3])
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <HeaderSecondLevel
          title={""}
          type="singleAction"
          firstAction={{
            icon: "closeLarge",
            accessibilityLabel: I18n.t("global.buttons.close"),
            onPress: () => navigation.goBack()
          }}
        />
      )
    });
  }, [navigation]);

  const handleClaimVisibility = useCallback(() => {
    dispatch(itwSetClaimValuesHidden(!valuesHidden));
  }, [valuesHidden, dispatch]);

  return (
    <View
      style={[
        styles.contentContainer,
        {
          paddingBottom: safeAreaInsets.bottom,
          backgroundColor: theme["appBackground-primary"]
        }
      ]}
    >
      {/* Card area fills the space between header and footer, centering the card */}
      <View
        style={styles.cardArea}
        onLayout={e => setCardAreaHeight(e.nativeEvent.layout.height)}
      >
        {cardAreaHeight > 0 && (
          <View
            style={{
              width: cardPreRotationWidth,
              transform: [{ rotate: "90deg" }]
            }}
          >
            <FlipGestureDetector
              isFlipped={isFlipped}
              setIsFlipped={setFlipped}
              direction={"leftright"}
            >
              <ItwSkeumorphicCard
                credential={credential}
                status={status}
                isFlipped={isFlipped}
                valuesHidden={valuesHidden}
              />
            </FlipGestureDetector>
          </View>
        )}
      </View>
      <ItwPresentationCredentialCardFlipButton
        isFlipped={isFlipped}
        handleOnPress={() => setFlipped(_ => !_)}
        fullScreen={true}
      />
      <VSpacer size={12} />
      <ItwPresentationCredentialCardHideValuesButton
        handleOnPress={handleClaimVisibility}
        valuesHidden={valuesHidden}
      />
      <VSpacer size={16} />
    </View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1
  },
  cardArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  }
});

const MemoizedItwPresentationCredentialCardModal = memo(
  ItwPresentationCredentialCardModal
);

export { MemoizedItwPresentationCredentialCardModal as ItwPresentationCredentialCardModal };
