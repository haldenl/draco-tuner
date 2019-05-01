import { AnyAction } from 'redux';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { createAction } from 'typesafe-actions';
import { CollectionItemFilterObject, SpecDictionaryObject } from '../model';
import { RootState } from '../reducers';
import { reloadPairsBegin } from './draco-worker-actions';

export const reloadPairsThunk = (runId: number): ThunkAction<void, {}, {}, AnyAction> => {
  return (dispatch: ThunkDispatch<{}, {}, AnyAction>, getState: () => RootState) => {
    const pairs = getState().pairCollection.pairs;
    dispatch(reloadPairsBegin(pairs, runId));
  };
};

export const setPairs = createAction('pairs-collection/SET_PAIRS', action => {
  return (specDict: SpecDictionaryObject, runId: number) => action({ specDict, runId });
});

export const toggleFocusPair = createAction('pair-collection/TOGGLE_FOCUS_PAIR', action => {
  return (id: string, on: boolean) => action({ id, on });
});

export const setPairFilters = createAction('pair-collection/SET_PAIR_FILTERS', action => {
  return (filterTypes: CollectionItemFilterObject[]) => action(filterTypes);
});

export const addPairFilters = createAction('pair-collection/ADD_PAIR_FILTERS', action => {
  return (filterTypes: CollectionItemFilterObject[]) => action(filterTypes);
});

export const removePairFilters = createAction('chart-collection/REMOVE_PAIR_FILTERS', action => {
  return (filterTypes: CollectionItemFilterObject[]) => action(filterTypes);
});

export const toggleHoverPair = createAction('pair-collection/TOGGLE_HOVER_PAIR', action => {
  return (id: string, on: boolean) => action({ id, on });
});

export const addEmptyPair = createAction('pair-collection/ADD_EMPTY_PAIR', action => {
  return () => action();
});

export const toggleFocusPairItem = createAction('pair-collection/TOGGLE_FOCUS_PAIR_ITEM', action => {
  return (pairId: string, position: string, on: boolean) => action({ pairId, position, on });
});
