import _ from "lodash";
import * as React from "react";
import { Col, Grid, Row } from "react-native-easy-grid";

type Props = Readonly<{
  cols: number;
  items: ReadonlyArray<React.ReactNode>;
}>;

export default class WrappedGrid extends React.Component<Props> {
  public render() {
    const { cols, items } = this.props;
    return (
      <Grid style={{ alignItems: "flex-start", flexWrap: "wrap" }}>
        {_
          .range(_.ceil(items.length / cols))
          .map(i => (
            <Row>
              {_.range(cols).map(j => <Col>{items[i * cols + j]}</Col>)}
            </Row>
          ))}
      </Grid>
    );
  }
}
