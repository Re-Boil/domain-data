// @flow

import get from 'lodash/get'

type Reducer<State, Actions> = (state: State | void, action: Actions) => State

export const createMetaReducer = <State, Actions>(reducer: Reducer<State, Actions>, name: string) => (
  state: State | void,
  action: Actions,
): State => get(action, 'meta.name') !== name && state !== undefined
    ? state
    : reducer(state, action)
