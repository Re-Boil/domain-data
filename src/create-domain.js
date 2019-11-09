// @flow

import { handleActions } from 'redux-actions'

import get from 'lodash/get'

import createMetaReducer from 'utils/create-meta-reducer'

const Join(...args) => args.filter(arg => Boolean(arg)).join('.')

type DomainNode<State, Actions> = {
  reducers: {
    [$ElementType<Actions, 'type'>]: (State, Actions) => State,
  },
  initialState: State,
  selectors: {
    [string]: State => any,
  }
}

type DomainNodes<State, Actions> = {
  [node: string]: DomainNode<State, Actions>,
}

const glueNodes = <State, Actions>(nodes: DomainNodes<State, Actions>, domainSelector: any => State) =>
  Object.keys(nodes).reduce(
    (result, name) => {
      const { reducers = {}, initialState = {}, selectors } = nodes[name]

      const mappedSelectors = Object.keys(selectors).reduce((acc, selector) => ({
        ...acc,
        [selector]: (state: State) => selectors[selector](domainSelector(state))
      }), {})

      return {
        reducers: {
          ...result.reducers,
          ...reducers,
        },
        initialState: {
          ...result.initialState,
          ...initialState,
        },
        selectors: {
          ...result.selectors,
          [name]: mappedSelectors,
        },
      }
    },
    { reducers: {}, initialState: {}, selectors: {} },
  )

export const createDomain = <State, DomainState, Actions>(domain: string, nodes: DomainNodes<DomainState, Actions>, prefix?: string) => {
  const domainPath = Join(prefix, domain)
  const selector = (state: State): DomainState => get(state,  domainPath, {})
  const { reducers, initialState, selectors } = glueNodes<DomainState, Actions>(nodes, selector)

  const reducer = createMetaReducer<State, Actions>(
    handleActions<State, Actions>(
      {
        ...reducers,
        ...domainActionsHandlers(initialState),
      },
      initialState,
    ),
    domain,
  )

  return {
    reducer, initialState, selectors
  }
}
