import classnames from 'classnames';
import * as React from 'react';
import { TopLevelUnitSpec } from 'vega-lite/build/src/spec/unit';
import { Pair } from '../../../reducers/pair-collection-reducer';
import VegaLiteChart from '../vega-lite-chart';
import './pair-card.css';

export interface PairCardStoreProps {
  left?: PairCardItem;
  right?: PairCardItem;
  comparator?: string;
  diffVector?: number[];
  pass?: boolean;
  focused?: boolean;
}

export interface PairCardDispatchProps {
  solvePair?: (pair: Pair) => void;
  toggleFocusPair?: (id: string, on: boolean) => void;
}

export interface PairCardOwnProps {
  open: boolean;
  id?: string;
  selectPair?: (id: string) => void;
}

export interface PairCardProps extends PairCardStoreProps, PairCardDispatchProps, PairCardOwnProps {}

export interface PairCardState {}

export interface PairCardItem {
  vlSpec: TopLevelUnitSpec;
  cost?: number;
}

class PairCard extends React.PureComponent<PairCardProps, PairCardState> {
  render() {
    let populated;
    const style: any = { 'pair-card': true };
    if (this.props.open) {
      style['open'] = true;

      populated = (
        <div styleName="info">
          <div styleName="charts">
            <div styleName="item">
              <div styleName="chart-container">
                <VegaLiteChart spec={this.props.left.vlSpec} />
              </div>
              <div style={{ paddingTop: '16px' }}>{this.props.left.cost}</div>
            </div>
            <div styleName="comparator">{this.props.comparator}</div>
            <div styleName="item">
              <div styleName="chart-container">
                <VegaLiteChart spec={this.props.right.vlSpec} />
              </div>
              <div style={{ paddingTop: '16px' }}>{this.props.right.cost}</div>
            </div>
          </div>
          <div styleName="controls">
            <button
              onClick={() => {
                const pair: Pair = {
                  id: +this.props.id,
                  comparator: this.props.comparator,
                  left: {
                    vlSpec: this.props.left.vlSpec,
                  },
                  right: {
                    vlSpec: this.props.right.vlSpec,
                  },
                };

                this.props.solvePair(pair);
              }}
            >
              reload
            </button>
          </div>
        </div>
      );
    }

    return (
      <div
        styleName={classnames(style)}
        style={{
          borderColor: this.props.focused ? Splinter.BLUE : this.props.pass ? Splinter.GREEN : Splinter.RED,
          backgroundColor: this.props.focused ? Splinter.LIGHTBLUE : undefined,
        }}
      >
        <Splinter
          onClick={() => {
            this.props.selectPair(this.props.id);
            this.props.toggleFocusPair(this.props.id, !this.props.open);
          }}
          pass={this.props.pass}
          vector={this.props.diffVector}
        />
        {populated}
      </div>
    );
  }
}

interface SplinterProps {
  onClick: (...args: any[]) => void;
  vector?: number[];
  pass?: boolean;
}

interface SplinterState {}

export class Splinter extends React.PureComponent<SplinterProps, SplinterState> {
  static BLUE = '#75a8f9';
  static RED = '#f97486';
  static WHITE = '#fff';
  static GREEN = '#aff7b3';
  static ORANGE = '#ffcd51';
  static LIGHTBLUE = '#eaf4ff';

  render() {
    let diffViz;

    if (this.props.vector) {
      diffViz = this.props.vector.map((val, i) => {
        const color = val === -1 ? Splinter.BLUE : val === 1 ? Splinter.RED : Splinter.WHITE;
        return <div key={i} styleName="cell" style={{ backgroundColor: color }} />;
      });
    }

    let splinterColor = Splinter.WHITE;
    if (typeof this.props.pass !== 'undefined') {
      splinterColor = this.props.pass ? Splinter.GREEN : Splinter.RED;
    }
    return (
      <div styleName="splinter" style={{ backgroundColor: splinterColor }} onClick={this.props.onClick}>
        {diffViz}
      </div>
    );
  }
}

export default PairCard;
