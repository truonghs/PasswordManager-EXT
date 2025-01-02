type Options = Partial<{
  signal: AbortSignal
}>

type QueryFnProps<TQueryKeyObj, TOptions> = {
  queryKeyObj: TQueryKeyObj
  options?: TOptions
}

export const defineQuery = <
  TQueryKeyObj,
  TQueryFunc extends (props: QueryFnProps<TQueryKeyObj, TOptions>) => ReturnType<TQueryFunc>,
  TOptions = Options
>(
  queryKeyObj: TQueryKeyObj,
  queryFn: TQueryFunc
) => {
  return {
    queryKey: queryKeyObj,
    queryFn: (options?: TOptions) =>
      queryFn({
        queryKeyObj,
        options
      })
  }
}
