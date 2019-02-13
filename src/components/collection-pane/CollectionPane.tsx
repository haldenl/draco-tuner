import * as d3 from 'd3';
import { Constraint, vl2asp } from 'draco-core';
import { ConstraintSet, Violation } from 'draco-vis';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { none, Option, some } from 'ts-option';
import { getType } from 'typesafe-actions';
import { collectionActions, RootAction } from '../../actions';
import { loadCollection, saveCollection } from '../../actions/collection-actions';
import { getConstraintSet, runDraco } from '../../actions/draco-actions';
import { RootState } from '../../reducers';
import { CollectionState, Pair, PairItem } from '../../reducers/collection';
import './collection-pane.css';
import PairCard, { Vector, VectorUnit } from './pairs/PairCard';

interface StateProps {
  constraintSetOpt: Option<ConstraintSet>,
  collection: CollectionState;
}

interface DispatchProps {
  updatePairItem: (pairItem: PairItem) => void;
  getConstraintSet: () => void;
  loadCollection: () => void;
  saveCollection: () => void;
}

interface Props extends StateProps, DispatchProps {}

interface State {
  open: boolean[];
}

class CollectionPane extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const open = props.collection.pairs.map(() => false);
    this.state = {
      open,
    };

    this.expandAll = this.expandAll.bind(this);
    this.collapseAll = this.collapseAll.bind(this);
    this.reload = this.reload.bind(this);
    this.save = this.save.bind(this);
    this.expand = this.expand.bind(this);
  }

  componentDidMount() {
    this.props.getConstraintSet();
    this.props.loadCollection();
  }

  render() {
    const vectorPairs = this.props.collection.pairs.map((pair) => {
      return this.getVectorsFromPair(pair);
    });

    let maxWeight = 0;

    const diffVectorOpts = vectorPairs.map((vectorPairOpt): Option<number[]> => {
      return vectorPairOpt.map((vectors): number[] => {
        const left = vectors[0];
        const right = vectors[1];
      
        const diff = left.map((vectorUnit: VectorUnit, i: number) => {
          const leftWeight = vectorUnit.weight;
          const rightWeight = right[i].weight;

          maxWeight = Math.max(leftWeight, rightWeight, maxWeight);
          return leftWeight - rightWeight;
        });

        return diff;
      });
    });

    const diffExtent = d3.extent([-maxWeight, maxWeight]);
    const colorScale = d3.scaleSequential(d3.interpolateRdBu).domain(diffExtent);

    return (
      <div styleName="collection-pane">
        <div styleName="collection">
          <div styleName="controls">
            <button styleName="button" onClick={this.reload}>reload</button>
            <button styleName="button" onClick={this.expandAll}>expand all</button>
            <button styleName="button" onClick={this.collapseAll}>collapse all</button>
            <button styleName="button" onClick={this.save}>save</button>
          </div>
          {
            this.props.collection.pairs.map((pair, i) => {
              return <PairCard
                vectorsOpt={vectorPairs[i]}
                diffVectorOpt={diffVectorOpts[i]}
                colorScale={colorScale}
                key={i} pair={pair} open={this.state.open[i]}
                expandFunction={this.expand} />
            })
          }
        </div>
      </div>
    );
  }

  expand(pairIndex: number) {
    const open = this.state.open.slice();
    open[pairIndex] = !open[pairIndex];
    this.setState({ open });
  }

  expandAll() {
    const open = this.state.open.map(() => true);
    this.setState({ open });
  }

  collapseAll() {
    const open = this.state.open.map(() => false);
    this.setState({ open });
  }

  reload() {
    this.props.collection.pairs.forEach((pair) => {
      this.props.updatePairItem(pair.left);
      this.props.updatePairItem(pair.right);
    });
  }

  save() {
    this.props.saveCollection();
  }

  private getVectorsFromPair(pair: Pair): Option<Vector[]> {
    if (pair.left.solutionOpt.isDefined && pair.right.solutionOpt.isDefined) {
      const leftViolations = pair.left.solutionOpt.get.models[0].violations;
      const rightViolations = pair.right.solutionOpt.get.models[0].violations;

      const leftVector = this.getVectorFromFacts(leftViolations);
      const rightVector = this.getVectorFromFacts(rightViolations);

      if (leftVector.isDefined && rightVector.isDefined) {
        return some([leftVector.get, rightVector.get]);
      }
    }

    return none;
  }

  private getVectorFromFacts(violations: Violation[]): Option<Vector> {
    const dict = violations.reduce((dict: any, violation: Violation) => {
      if (!dict.hasOwnProperty(violation.name)) {
        dict[violation.name] = { count: 0, weight: 0 };
      }
      dict[violation.name].count += 1;
      dict[violation.name].weight += violation.weight;

      return dict;
    }, {});

    if (this.props.constraintSetOpt.isDefined) {
      const v = this.props.constraintSetOpt.get.soft.map((constraint: Constraint) => {
        if (typeof dict[constraint.name] !== 'undefined') {
          return dict[constraint.name];
        } else {
          return { count: 0, weight: 0 };
        }
      });

      return some(v);
    }

    return none;
  }
}

const mapStateToProps = (state: RootState): StateProps => {
  return {
    constraintSetOpt: state.collection.dracoConstraintSetOpt,
    collection: state.collection,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<RootAction>): DispatchProps => {
  return {
    updatePairItem: (pairItem: PairItem) => {
      dispatch(
        runDraco(
          vl2asp(pairItem.vlSpec).join('\n'),
          getType(collectionActions.updatePairItem),
          pairItem,
        ),
      );
    },
    getConstraintSet: () => {
      dispatch(
        getConstraintSet(getType(collectionActions.setDracoConstraintSet)),
      );
    },
    loadCollection: () => {
      dispatch(loadCollection());
    },
    saveCollection: () => {
      dispatch(saveCollection());
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(CollectionPane);
