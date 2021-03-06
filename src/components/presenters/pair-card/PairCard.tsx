import classnames from 'classnames';
import _ from 'lodash';
import * as React from 'react';
import VisibilitySensor from 'react-visibility-sensor';
import { TopLevelUnitSpec } from 'vega-lite/build/src/spec/unit';
import {
  CollectionItem,
  CollectionItemComparator,
  CollectionItemComparatorType,
  CollectionItemEval,
  CollectionItemEvalType,
  Pair,
  PairObject,
} from '../../../model';
import { Editor, EditorType } from '../../../reducers/text-editor-reducer';
import VegaLiteChart from '../vega-lite-chart';
import './pair-card.css';

export interface PairCardStoreProps {
  left?: PairCardItem;
  right?: PairCardItem;
  comparator?: CollectionItemComparatorType;
  diffVector?: number[];
  evalType?: CollectionItemEvalType;
  focused?: boolean;
  finishedRunIds?: Set<number>;
  focusItem?: string;
}

export interface PairCardDispatchProps {
  solvePair: (pair: PairObject, runId: number) => void;
  toggleFocusPair: (id: string, on: boolean) => void;
  setVegaLiteEditorCode: (code: string) => void;
  toggleFocusPairItem: (pairId: string, position: string, on: boolean) => void;
  toggleShowEditor: (show: boolean) => void;
  setEditorType: (type: EditorType) => void;
  updatePair: (pair: Pair) => void;
  deletePair: (pairId: string) => void;
}

export interface PairCardOwnProps {
  open: boolean;
  id?: string;
  selectPair?: (id: string, on: boolean) => void;
}

export interface PairCardProps extends PairCardStoreProps, PairCardDispatchProps, PairCardOwnProps {}

export interface PairCardState {
  runId?: number;
  visible: boolean;
}

export interface PairCardItem {
  vlSpec: TopLevelUnitSpec;
  cost?: number;
}

class PairCard extends React.PureComponent<PairCardProps, PairCardState> {
  constructor(props: PairCardProps) {
    super(props);

    this.state = {
      visible: false,
    };
  }

  static getDerivedStateFromProps(props: PairCardProps, state: PairCardState) {
    if (!props.open && state.visible) {
      return {
        visible: false,
      };
    }

    return state;
  }

  render() {
    let populated;
    const style: any = { 'pair-card': true };
    if (this.props.open || this.props.focused) {
      style['open'] = true;
      let comp = this.props.comparator.toString();
      if (comp === '<') {
        if (this.props.left.cost >= this.props.right.cost) {
          comp = '≮';
        }
      } else if (comp === '=') {
        if (this.props.left.cost !== this.props.right.cost) {
          comp = '≠';
        }
      }

      populated = (
        <VisibilitySensor
          partialVisibility={true}
          offset={{ top: -600, bottom: -600 }}
          onChange={isVisible => {
            if (!this.state.visible && isVisible) {
              this.setState({ visible: true });
            }
          }}
        >
          <div styleName="info">
            <div styleName="charts">
              <div styleName="item">
                <div
                  styleName={classnames({
                    'chart-container': true,
                    focused: this.props.focused && this.props.focusItem === 'left',
                  })}
                  onClick={() => {
                    if (this.props.focused && this.props.focusItem === 'left') {
                      this.props.toggleFocusPairItem(this.props.id, 'left', false);
                      this.props.toggleShowEditor(false);
                    } else {
                      this.props.toggleFocusPairItem(this.props.id, 'left', true);
                      this.props.setVegaLiteEditorCode(JSON.stringify(this.props.left.vlSpec, null, 2));
                      this.props.setEditorType(Editor.VEGA_LITE);
                      this.props.toggleShowEditor(true);
                    }
                  }}
                >
                  {this.state.visible || this.props.focused ? (
                    <VegaLiteChart spec={this.props.left.vlSpec} />
                  ) : (
                    <div styleName="loading-container">
                      <div styleName="loading" />
                    </div>
                  )}
                </div>
                <div style={{ paddingTop: '16px' }}>{this.props.left.cost}</div>
              </div>
              <div styleName="modifiers">
                <div
                  styleName="comparator"
                  onClick={() => {
                    const pair = this.buildPairObject();
                    switch (pair.comparator) {
                      case CollectionItemComparator.LESS_THAN:
                        pair.comparator = CollectionItemComparator.EQUAL;
                        break;
                      case CollectionItemComparator.EQUAL:
                        pair.comparator = CollectionItemComparator.LESS_THAN;
                        break;
                      default:
                        pair.comparator = CollectionItemComparator.LESS_THAN;
                    }

                    this.props.updatePair(pair);
                  }}
                >
                  {comp}
                </div>
                <div
                  className="material-icons"
                  styleName="swap"
                  onClick={() => {
                    const pair = this.buildPairObject();
                    const temp = pair.left;
                    pair.left = pair.right;
                    pair.right = temp;

                    this.props.updatePair(pair);
                  }}
                >
                  swap_horiz
                </div>
              </div>
              <div styleName="item">
                <div
                  styleName={classnames({
                    'chart-container': true,
                    focused: this.props.focused && this.props.focusItem === 'right',
                  })}
                  onClick={() => {
                    if (this.props.focused && this.props.focusItem === 'right') {
                      this.props.toggleFocusPairItem(this.props.id, 'right', false);
                      this.props.toggleShowEditor(false);
                    } else {
                      this.props.toggleFocusPairItem(this.props.id, 'right', true);
                      this.props.setVegaLiteEditorCode(JSON.stringify(this.props.right.vlSpec, null, 2));
                      this.props.setEditorType(Editor.VEGA_LITE);
                      this.props.toggleShowEditor(true);
                    }
                  }}
                >
                  {this.state.visible ? (
                    <VegaLiteChart spec={this.props.right.vlSpec} />
                  ) : (
                    <div styleName="loading-container">
                      <div styleName="loading" />
                    </div>
                  )}
                </div>
                <div style={{ paddingTop: '16px' }}>{this.props.right.cost}</div>
              </div>
            </div>
            <div styleName="controls">
              <div styleName="button-container">
                <button
                  styleName={classnames({
                    reloading: !_.isUndefined(this.state.runId) && !this.props.finishedRunIds.has(this.state.runId),
                  })}
                  onClick={() => {
                    const pair: PairObject = {
                      type: CollectionItem.PAIR,
                      id: +this.props.id,
                      comparator: this.props.comparator,
                      left: {
                        vlSpec: this.props.left.vlSpec,
                      },
                      right: {
                        vlSpec: this.props.right.vlSpec,
                      },
                    };

                    const runId = (window as any).runId;
                    (window as any).runId += 1;
                    this.setState({
                      runId,
                    });
                    this.props.solvePair(pair, runId);
                  }}
                >
                  <span className="material-icons">refresh</span>
                  {this.props.evalType}
                </button>
              </div>
              <div styleName="button-container">
                <button
                  className="material-icons"
                  styleName="icon-button"
                  onClick={e => {
                    e.stopPropagation();
                    this.props.deletePair(this.props.id);
                  }}
                >
                  delete
                </button>
              </div>
            </div>
          </div>
        </VisibilitySensor>
      );
    }

    const evalColor = CollectionItemEval.toColor(this.props.evalType);

    const borderColor = this.props.focused
      ? CollectionItemEval.BLUE
      : evalColor === CollectionItemEval.WHITE
      ? CollectionItemEval.GREY
      : evalColor;
    return (
      <div
        styleName={classnames(style)}
        style={{
          borderColor,
        }}
      >
        <Splinter
          onClick={() => {
            this.props.selectPair(this.props.id, !(this.props.open || this.props.focused));
            this.props.toggleFocusPair(this.props.id, !(this.props.open || this.props.focused));
            if (!!this.props.focused) {
              this.props.toggleFocusPairItem(null, null, false);
            }
          }}
          evalType={this.props.evalType}
          vector={this.props.diffVector}
        />
        {populated}
      </div>
    );
  }

  private buildPairObject(): PairObject {
    return {
      type: CollectionItem.PAIR,
      id: +this.props.id,
      left: this.props.left,
      right: this.props.right,
      comparator: this.props.comparator,
    };
  }
}

interface SplinterProps {
  onClick: (...args: any[]) => void;
  vector?: number[];
  evalType?: CollectionItemEvalType;
}

interface SplinterState {}

export class Splinter extends React.PureComponent<SplinterProps, SplinterState> {
  render() {
    let diffViz;

    if (this.props.vector) {
      diffViz = this.props.vector.map((val, i) => {
        const color =
          val === -1 ? CollectionItemEval.BLUE : val === 1 ? CollectionItemEval.RED : CollectionItemEval.WHITE;
        return <div key={i} styleName="cell" style={{ backgroundColor: color }} />;
      });
    }

    const splinterColor = CollectionItemEval.toColor(this.props.evalType);

    return (
      <div styleName="splinter" style={{ backgroundColor: splinterColor }} onClick={this.props.onClick}>
        {diffViz}
      </div>
    );
  }
}

export default PairCard;
