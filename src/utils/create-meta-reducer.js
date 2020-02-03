// @flow

import type { MetaAction } from 'utils/create-meta-action'

export type MetaReducer<State, Action> = (state: State, action: Action) => State
export type ReduxReducer<State, Action> = (state: State | void, action: Action) => State

const createMetaReducer = <State, Action>(
  reducer: ReduxReducer<State, Action>,
  domain: string,
): MetaReducer<State, MetaAction<$ElementType<Action, 'type'>, $ElementType<Action, 'payload'>, Action>> => (
  state: State | void,
  action,
): State => {
  return action.meta?.domain !== domain && state !== undefined ? state : reducer(state, action)
}

export default createMetaReducer
