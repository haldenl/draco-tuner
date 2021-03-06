import _ from 'lodash';
import { ChartDictionary, CollectionItem, CollectionItemComparator } from '../model';

export const EXAMPLE_PAIRS = require('./pairs.json');

let chartId = 0;
export const EXAMPLE_CHARTS = _.uniqBy(
  Object.keys(EXAMPLE_PAIRS).reduce((list, pairId) => {
    const pair = EXAMPLE_PAIRS[pairId];
    const left = pair.left;
    const right = pair.right;

    const leftId = chartId.toString();
    list.push({
      type: CollectionItem.CHART,
      id: leftId,
      comparator: CollectionItemComparator.LESS_THAN,
      vlSpec: left.vlSpec,
    });
    chartId += 1;

    const rightId = chartId.toString();
    list.push({
      type: CollectionItem.CHART,
      id: rightId,
      comparator: CollectionItemComparator.LESS_THAN,
      vlSpec: right.vlSpec,
    });
    chartId += 1;

    return list;
  }, []),
  c => JSON.stringify(c.vlSpec)
).reduce(
  (dict, chart) => {
    dict[chart.id] = chart;
    return dict;
  },
  {} as ChartDictionary
);

export const SCATTER: string = `data("cars.json").

encoding(e0).
:- not field(e0,"acceleration").

encoding(e1).
:- not field(e1,"horsepower").
`;

export const VL_HISTOGRAM: string = `{
  "data": {"url": "cars.json"},
  "mark": "bar",
  "encoding": {
    "x": {
      "bin": true,
      "field": "horsepower",
      "type": "quantitative"
    },
    "y": {
      "aggregate": "count",
      "type": "quantitative"
    }
  }
}`;

export const PAIR: string = `transform('swap', 'encoding.x', 'encoding.y');

modification('encoding.x.zero', true);

basespec({
    mark: 'point',
    encoding: { x: q1, y: q2 }
});
basespec({
    mark: 'bar',
    encoding: {
        x: { ...q1, bin: true }, y: q2
    }
});
basespec({
    mark: 'bar',
    encoding: {
        x: o1, y: { q1, aggregate: 'mean' }
    }
});
basespec({
    mark: 'bar',
    encoding: {
        x: n1, y: { q1, aggregate: 'mean' }
    }
});
basespec({
    mark: 'point',
    encoding: {
        x: o1, y: { q1, bin: true }
    }
});
basespec({
    mark: 'point',
    encoding: {
        x: n1, y: o1
    }
});`;
