import * as React from "react";

import { NavigationScreenProp, NavigationState } from "react-navigation";

import { CreditCard } from "../../types/CreditCard";
import { CreditCardComponent } from "./CreditCardComponent";
import {View} from "react-native";

export enum LogoPosition {
  TOP,
  CENTER
}

type Props = Readonly<{
  cards: ReadonlyArray<CreditCard>;
  navigation: NavigationScreenProp<NavigationState>;
}>;

/**
 * Credit card component
 */
export class CreditCardsFan extends React.Component<Props> {
  public render(): React.ReactNode {
    return this.props.cards
      .slice(0, 1)
      .reverse()
      .map((card, pos) => (
        <View key={`view${pos}`} style={{flex:1,justifyContent:"flex-end",flexDirection:"row",width:"100%",borderWidth:0}}>
        <CreditCardComponent
          item={card}
          navigation={this.props.navigation}
          lastUsage={false}
          logoPosition={LogoPosition.TOP}
          rotated={true}
          customStyle={{
            position: "absolute",
            bottom: -75 +10*(pos),
            width: "100%",
            overflow:"visible",
            backgroundColor:"white"
          }}
        />
        </View>
      ));
  }
}
