import { View } from "react-native";
import { Body, IOStyles } from "@pagopa/io-app-design-system";
import LoadingScreenContent from "../../../../../components/screens/LoadingScreenContent";
import I18n from "../../../../../i18n";

type Props = {
  title: string;
  message?: string;
};

export const ItwRemoteLoadingScreen = ({ title, message }: Props) => (
  <LoadingScreenContent testID="loader" contentTitle={title}>
    <View style={[IOStyles.alignCenter, IOStyles.horizontalContentPadding]}>
      <Body>
        {message ??
          I18n.t(
            "features.itWallet.presentation.remote.loadingScreen.subtitle"
          )}
      </Body>
    </View>
  </LoadingScreenContent>
);
