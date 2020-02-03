// @flow

import { type Action } from 'redux'

export const noop = () => {}

type NestedObject = {
  [string]: NestedObject,
}

export const get = (path: string) => {
  const keys = path.split('.')

  return keys.length === 1
    ? (obj: NestedObject) => obj[path]
    : (obj: NestedObject) => keys.reduce((result, key) => (result && result[key] ? result[key] : undefined), obj)
}

// eslint-disable-next-line no-unused-vars
export const woTransform = <T>(data: T, ...rest: any[]): T => data

export const JoinPaths = (...args: string[]) => args.filter(arg => Boolean(arg)).join('.')

export const reduceWith = (mapped: { [string]: any }, func: any => any) =>
  Object.keys(mapped).reduce(
    (acc, key) => ({
      ...acc,
      [key]: func(mapped[key]),
    }),
    {},
  )

export const createAction = (type: string) => {
  const action = (rest: any): Action<typeof type> => ({
    type,
    ...rest,
  })

  // eslint-disable-next-line flowtype-errors/show-errors
  action.toString = () => type

  return action
}
