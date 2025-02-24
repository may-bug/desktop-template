// src/sqlite/types.ts
export interface queryParam {
  sql: string
  params?: never[]
}

export interface insertParam {
  table: string
  data: { [key: string]: never }
}

export interface updateParam {
  table: string
  data: { [key: string]: never }
  condition: string
}

export interface deleteParam {
  table: string
  condition: string
}
