import {
  HeaderSecondLevel,
  IOColors,
  useIOTheme
} from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import * as O from "fp-ts/Option";
import { constNull, pipe } from "fp-ts/lib/function";
import I18n from "i18next";
import { useCallback, useLayoutEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IOStackNavigationRouteProps } from "../../../../../navigation/params/AppParamsList.ts";
import { useIOSelector } from "../../../../../store/hooks.ts";
import { usePreventScreenCapture } from "../../../../../utils/hooks/usePreventScreenCapture.ts";
import { getMixPanelCredential } from "../../../analytics/utils";
import { itwCredentialSelector } from "../../../credentials/store/selectors";
import { itwLifecycleIsITWalletValidSelector } from "../../../lifecycle/store/selectors";
import { ItwParamsList } from "../../../navigation/ItwParamsList.ts";
import { trackCredentialCardModal } from "../analytics";
import { ItwPresentationCredentialCard } from "../components/ItwPresentationCredentialCard.tsx";

export type ItwPresentationCredentialCardScreenNavigationParams = {
  credentialType: string;
};

type Props = IOStackNavigationRouteProps<
  ItwParamsList,
  "ITW_PRESENTATION_CREDENTIAL_CARD_SCREEN"
>;

const ItwPresentationCredentialCardScreen = ({ route, navigation }: Props) => {
  const { credentialType } = route.params;
  const credentialOption = useIOSelector(itwCredentialSelector(credentialType));
  const theme = useIOTheme();
  const safeAreaInsets = useSafeAreaInsets();
  const isItwL3 = useIOSelector(itwLifecycleIsITWalletValidSelector);

  usePreventScreenCapture();

  useFocusEffect(
    useCallback(() => {
      trackCredentialCardModal(getMixPanelCredential(credentialType, isItwL3));
    }, [credentialType, isItwL3])
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <HeaderSecondLevel
          title=""
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

  return pipe(
    credentialOption,
    O.fold(constNull, credential => (
      <View
        style={[
          styles.container,
          {
            paddingBottom: safeAreaInsets.bottom,
            backgroundColor: IOColors[theme["appBackground-primary"]]
          }
        ]}
      >
        <ItwPresentationCredentialCard credential={credential} />
      </View>
    ))
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start"
  }
});

export { ItwPresentationCredentialCardScreen };
