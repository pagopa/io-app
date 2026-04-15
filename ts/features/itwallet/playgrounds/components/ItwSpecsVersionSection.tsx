import {
  BodySmall,
  HStack,
  ListItemHeader,
  RadioButtonLabel,
  VSpacer,
  VStack
} from "@pagopa/io-app-design-system";
import { Alert, View } from "react-native";
import { type ItwVersion } from "@pagopa/io-react-native-wallet";
import I18n from "i18next";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import {
  selectItwEnv,
  selectItwSpecsVersion
} from "../../common/store/selectors/environment";
import { itwSetSpecsVersion } from "../../common/store/actions/environment";
import { itwLifecycleWalletReset } from "../../lifecycle/store/actions";

const itwVersions: ReadonlyArray<ItwVersion> = ["1.0.0", "1.3.3"];

export const ItwSpecsVersionSection = () => {
  const itwVersion = useIOSelector(selectItwSpecsVersion);
  const selectedEnv = useIOSelector(selectItwEnv);
  const dispatch = useIODispatch();

  if (selectedEnv !== "pre") {
    return null;
  }

  const setItwSpecsVersionWithAlert = (version: ItwVersion) => {
    Alert.alert(
      I18n.t("features.itWallet.playgrounds.itwSpecsVersion.alert.title", {
        itwVersion: version
      }),
      I18n.t("features.itWallet.playgrounds.itwSpecsVersion.alert.content"),
      [
        {
          text: I18n.t("global.buttons.cancel"),
          style: "cancel"
        },
        {
          text: I18n.t("global.buttons.confirm"),
          style: "destructive",
          onPress: () => {
            dispatch(itwLifecycleWalletReset());
            dispatch(itwSetSpecsVersion(version));
          }
        }
      ],
      { cancelable: true }
    );
  };

  return (
    <View>
      <VSpacer />
      <ListItemHeader label="IT-Wallet Specifications" />
      <VStack space={16}>
        <BodySmall>
          {I18n.t("features.itWallet.playgrounds.itwSpecsVersion.description")}
        </BodySmall>
        <HStack space={24}>
          {itwVersions.map(version => (
            <RadioButtonLabel
              key={version}
              label={`v${version}`}
              checked={version === itwVersion}
              onValueChange={() => setItwSpecsVersionWithAlert(version)}
            />
          ))}
        </HStack>
      </VStack>
    </View>
  );
};
