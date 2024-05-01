import { ListItemNav, VSpacer } from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/core";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { View } from "react-native";
import { InitiativeDTO } from "../../../../../definitions/idpay/InitiativeDTO";
import { H3 } from "../../../../components/core/typography/H3";
import I18n from "../../../../i18n";
import { IOStackNavigationProp } from "../../../../navigation/params/AppParamsList";
import { Skeleton } from "../../common/components/Skeleton";
import { IdPayConfigurationParamsList } from "../../configuration/navigation/params";
import { IdPayConfigurationRoutes } from "../../configuration/navigation/routes";

type Props = {
  initiative: InitiativeDTO;
};

const InitiativeDiscountSettingsComponent = (props: Props) => {
  const { initiative } = props;

  const navigation =
    useNavigation<IOStackNavigationProp<IdPayConfigurationParamsList>>();

  const navigateToInstrumentsConfiguration = (initiative: InitiativeDTO) => {
    navigation.navigate(
      IdPayConfigurationRoutes.IDPAY_CONFIGURATION_NAVIGATOR,
      {
        screen:
          IdPayConfigurationRoutes.IDPAY_CONFIGURATION_DISCOUNT_INSTRUMENTS,
        params: {
          initiativeId: initiative.initiativeId,
          initiativeName: initiative.initiativeName
        },
        initiativeId: initiative.initiativeId
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
          description={<Skeleton width={100} height={21} />}
          onPress={() => null}
        />
      ),
      initiative => {
        const methodCountString = I18n.t(
          `idpay.initiative.details.initiativeDetailsScreen.configured.settings.methods`,
          {
            defaultValue: I18n.t(
              `idpay.initiative.details.initiativeDetailsScreen.configured.settings.methods.other`,
              { count: initiative.nInstr }
            ),
            count: initiative.nInstr
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
