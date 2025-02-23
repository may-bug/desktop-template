/**
 * 引入本地图片
 * @returns
 * @param url
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const getAssetsFile = (url: string) => {
  return new URL(`@renderer/${url}`, import.meta.url).href
}
