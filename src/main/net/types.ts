export interface NetOptions {
  url: string
  method: 'POST' | 'PUT' | 'DELETE' | 'GET'
  headers: Record<string, string | string[]>
  session: never
}
