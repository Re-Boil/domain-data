// @flow

type MetaInfo = {|
  domain: string,
|}

export type MetaAction<Type, Payload, Additional> = {
  ...Additional,
  type: Type,
  payload: Payload,
  error?: boolean,
  meta: MetaInfo,
}

const createMetaAction = <Type, Payload>(
  domain: string,
  type: Type,
): ({
  (payload: Payload, additionals?: { [string]: any }): MetaAction<Type, Payload, *>,
  +toString: () => Type,
}) => {
  const action = (payload, additionals?: { [string]: any }) => ({
    ...(additionals ? additionals : {}),
    type,
    payload,
    meta: {
      domain,
    },
  })

  // eslint-disable-next-line flowtype-errors/show-errors
  action.toString = () => type
  return action
}

export default createMetaAction
