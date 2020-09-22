import { View } from "native-base";
import * as React from "react";
import { getServiceCTA } from "../../utils/messages";
import { MessageNestedCTABar } from "../messages/MessageNestedCTABar";

type Props = {
  cta: string;
};

const ServiceDetailCTABar: React.FunctionComponent<Props> = (props: Props) => {
  const maybeCtas = getServiceCTA(props.cta);

  return (
    maybeCtas.isSome() && (
      <View footer={true} style={styles.row}>
        <MessageNestedCTABar
          ctas={maybeCtas.value}
          dispatch={props.dispatch}
          xsmall={false}
        />
      </View>
    )
  );
};

export default ServiceDetailCTABar;
