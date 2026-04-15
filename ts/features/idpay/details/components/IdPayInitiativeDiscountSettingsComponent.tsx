import {
  IOSkeleton,
  ListItemHeader,
  ListItemNav
} from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/core";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { View } from "react-native";
import I18n from "i18next";
import { InitiativeDTO } from "../../../../../definitions/idpay/InitiativeDTO";
import { IOStackNavigationProp } from "../../../../navigation/params/AppParamsList";
import { IdPayConfigurationParamsList } from "../../configuration/navigation/params";
import { IdPayConfigurationRoutes } from "../../configuration/navigation/routes";
import { useIOSelector } from "../../../../store/hooks";
import { isIdPayCiePaymentCodeEnabledSelector } from "../../../../store/reducers/backendStatus/remoteConfig";

type Props = {
  initiative: InitiativeDTO;
};

const IdPayInitiativeDiscountSettingsComponent = (props: Props) => {
  const { initiative } = props;

  const navigation =
    useNavigation<IOStackNavigationProp<IdPayConfigurationParamsList>>();

  const isIdPayCodeCieEnabled = useIOSelector(
    isIdPayCiePaymentCodeEnabledSelector
  );

  const navigateToInstrumentsConfiguration = ({
    initiativeId,
    initiativeName
  }: InitiativeDTO) => {
    navigation.navigate(
      IdPayConfigurationRoutes.IDPAY_CONFIGURATION_NAVIGATOR,
      {
        screen:
          IdPayConfigurationRoutes.IDPAY_CONFIGURATION_DISCOUNT_INSTRUMENTS,
        params: {
          initiativeId,
          initiativeName
        }
      }
    );
  };

  const instrumentsSettingsButton = pipe(
    initiative,
    O.fromNullable,
    O.fold(
      () => (
        <ListItemNav
          value={I18n.t(
            "idpay.initiative.details.initiativeDetailsScreen.configured.settings.associatedPaymentMethods"
          )}
          accessibilityLabel={I18n.t(
            "idpay.initiative.details.initiativeDetailsScreen.configured.settings.associatedPaymentMethods"
          )}
          description={
            <IOSkeleton shape="rectangle" width={100} height={21} radius={4} />
          }
          onPress={() => null}
        />
      ),
      ({ nInstr }) => {
        const methodCountString = I18n.t(
          `idpay.initiative.details.initiativeDetailsScreen.configured.settings.methods`,
          {
            count: nInstr
          }
        );
        return (
          <ListItemNav
            value={I18n.t(
              "idpay.initiative.details.initiativeDetailsScreen.configured.settings.associatedPaymentMethods"
            )}
            description={methodCountString}
            onPress={() => navigateToInstrumentsConfiguration(initiative)}
            accessibilityLabel={`${I18n.t(
              "idpay.initiative.details.initiativeDetailsScreen.configured.settings.associatedPaymentMethods"
            )}
         ${methodCountString}`}
          />
        );
      }
    )
  );

  if (!isIdPayCodeCieEnabled) {
    return undefined;
  }

  return (
    <View testID={"IDPayDetailsSettingsTestID"}>
      <ListItemHeader
        label={I18n.t(
          "idpay.initiative.details.initiativeDetailsScreen.configured.settings.header"
        )}
      />
      {instrumentsSettingsButton}
    </View>
  );
};

export { IdPayInitiativeDiscountSettingsComponent };
