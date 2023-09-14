import { useNavigation } from "@react-navigation/core";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { View } from "react-native";
import { InitiativeDTO } from "../../../../../../definitions/idpay/InitiativeDTO";
import { VSpacer } from "../../../../../components/core/spacer/Spacer";
import { H3 } from "../../../../../components/core/typography/H3";
import ListItemNav from "../../../../../components/ui/ListItemNav";
import I18n from "../../../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../../navigation/params/AppParamsList";
import { IDPayConfigurationRoutes } from "../../configuration/navigation/navigator";
import { Skeleton } from "../../../common/components/Skeleton";

type Props = {
  initiative?: InitiativeDTO;
};

const InitiativeDiscountSettingsComponent = (props: Props) => {
  const { initiative } = props;

  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();

  const navigateToInstrumentsConfiguration = (initiative: InitiativeDTO) => {
    navigation.navigate(IDPayConfigurationRoutes.IDPAY_CONFIGURATION_MAIN, {
      screen:
        IDPayConfigurationRoutes.IDPAY_CONFIGURATION_INSTRUMENTS_PAYMENT_METHODS,
      params: {
        initiative
      }
    });
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
          description={<Skeleton width={100} height={21} />}
          onPress={() => null}
        />
      ),
      initiative => (
        <ListItemNav
          value={I18n.t(
            "idpay.initiative.details.initiativeDetailsScreen.configured.settings.associatedPaymentMethods"
          )}
          description={I18n.t(
            `idpay.initiative.details.initiativeDetailsScreen.configured.settings.methods`,
            {
              defaultValue: I18n.t(
                `idpay.initiative.details.initiativeDetailsScreen.configured.settings.methods.other`,
                { count: initiative.nInstr }
              ),
              count: initiative.nInstr
            }
          )}
          onPress={() => navigateToInstrumentsConfiguration(initiative)}
          accessibilityLabel={I18n.t(
            "idpay.initiative.details.initiativeDetailsScreen.configured.settings.associatedPaymentMethods"
          )}
        />
      )
    )
  );

  return (
    <View testID={"IDPayDetailsSettingsTestID"}>
      <H3>
        {I18n.t(
          "idpay.initiative.details.initiativeDetailsScreen.configured.settings.header"
        )}
      </H3>
      <VSpacer size={8} />
      {instrumentsSettingsButton}
    </View>
  );
};

export { InitiativeDiscountSettingsComponent };
