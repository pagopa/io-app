import _ from "lodash";
import * as React from "react";
import { Col, Grid, Row } from "react-native-easy-grid";

type Props = Readonly<{
  cols: number;
  items: ReadonlyArray<React.ReactNode>;
  keyPrefix: string;
}>;

export default class WrappedGrid extends React.Component<Props> {
  public render() {
    const { cols, items, keyPrefix } = this.props;
    return (
      <Grid style={{ alignItems: "flex-start", flexWrap: "wrap" }}>
        {_.range(_.ceil(items.length / cols)).map(i => (
          <Row key={`${keyPrefix}_row_${i}`}>
            {_.range(cols).map(j => {
              const index = i * cols + j;
              return (
                <Col key={`${keyPrefix}_col_${index}`}>
                  {index < items.length && items[index]}
                </Col>
              );
            })}
          </Row>
        ))}
      </Grid>
    );
  }
}
