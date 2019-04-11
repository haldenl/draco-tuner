import _ from 'lodash';
import { PairCardItem } from '../components/presenters/pair-card/index';
import { ConstraintMapObject } from './constraints';
import { Spec, SpecObject } from './spec';

export interface PairObject {
  id: number;
  comparator: string;
  left: SpecObject;
  right: SpecObject;
}

export class Pair {
  static getPairCardItems(pair: PairObject, constraintMap: ConstraintMapObject): PairCardItem[] {
    const items: PairCardItem[] = [pair.left, pair.right].map(spec => {
      const cost = Spec.getCost(spec, constraintMap);

      return {
        cost,
        vlSpec: spec.vlSpec,
      };
    });

    return items;
  }

  static getEval(pair: PairObject, constraintMap: ConstraintMapObject): PairEvalType {
    const leftCost = Spec.getCost(pair.left, constraintMap);
    const rightCost = Spec.getCost(pair.right, constraintMap);

    if (_.isUndefined(leftCost) || _.isUndefined(rightCost)) {
      return undefined;
    }

    if (leftCost === Infinity || rightCost === Infinity) {
      return PairEval.UNSAT;
    }

    if (pair.comparator === '<') {
      return PairEval.fromBoolean(leftCost < rightCost);
    }
    return PairEval.fromBoolean(leftCost === rightCost);
  }
}

export class PairEval {
  static PASS: 'pass' = 'pass';
  static FAIL: 'fail' = 'fail';
  static UNSAT: 'unsat' = 'unsat';

  static fromBoolean(bool: boolean): PairEvalType {
    switch (bool) {
      case true:
        return PairEval.PASS;
      case false:
        return PairEval.FAIL;
      default:
        return PairEval.UNSAT;
    }
  }
}

export type PairEvalType = typeof PairEval.PASS | typeof PairEval.FAIL | typeof PairEval.UNSAT;
