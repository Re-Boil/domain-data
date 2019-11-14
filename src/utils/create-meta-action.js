// @flow
import { createAction } from 'redux-actions'

type MetaInfo = {|
  name: string,
|}

type MetaAction<Type, Payload> = {
  (
    payload: Payload,
    ...rest: any[]
  ): {
    type: Type,
    payload: Payload,
    error?: boolean,
    meta: MetaInfo,
  },
  +toString: () => Type,
}

export default <Type, Payload>(name: string, type: Type): MetaAction<Type, Payload> =>
  createAction<Type, Payload, MetaInfo>(type, null, (): MetaInfo => ({ name }))
