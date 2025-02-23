// src/sqlite/index.ts
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
import { app } from 'electron'
import * as path from 'path'
import * as sqlite3 from 'sqlite3'
import { queryParam, insertParam, updateParam, deleteParam } from './types'
import { logger } from '../log/log'

const userDataPath = app.getPath('userData')
const dbPath = path.join(userDataPath, 'sqliteDatabase.db')

logger.info('Database path:', dbPath)

class Database {
  private db: sqlite3.Database

  constructor() {
    this.db = new sqlite3.Database(dbPath)
  }

  open(): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return new Promise<void>((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run('PRAGMA foreign_keys = ON')
        logger.info('Connected to the database.')
        resolve()
      })
    })
  }

  close(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          logger.error(err)
          reject(err)
        } else {
          logger.info('Database closed.')
          resolve()
        }
      })
    })
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  query(param: queryParam) {
    return new Promise((resolve, reject) => {
      logger.info(`sql:${param.sql} params:${param.params}`)
      this.db.all(param.sql, param.params, (err, rows) => {
        if (err) {
          logger.error(err)
          reject(err)
        } else {
          resolve(rows)
        }
      })
    })
  }

  insert(param: insertParam): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      const keys = Object.keys(param.data)
      const values = Object.values(param.data)
      const placeholders = keys.map(() => '?').join(',')
      const sql = `INSERT INTO ${param.table} (${keys.join(',')}) VALUES (${placeholders})`
      logger.info(sql, values)
      this.db.run(sql, values, function (err) {
        if (err) {
          reject(err)
        } else {
          resolve(this.lastID)
        }
      })
    })
  }

  update(param: updateParam): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      const entries = Object.entries(param.data)
        .map(([key, value]) => `${key} = ?`)
        .join(',')
      const params = Object.values(param.data)
      const sql = `UPDATE ${param.table} SET ${entries} WHERE ${param.condition}`
      logger.info(`sql: ${sql} params:${params}`)
      this.db.run(sql, params, function (err) {
        if (err) {
          reject(err)
        } else {
          resolve(this.changes)
        }
      })
    })
  }

  delete(param: deleteParam): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const sql = `DELETE FROM ${param.table} WHERE ${param.condition}`
      logger.info(sql)
      this.db.run(sql, (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }
}

const db = new Database()

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const createSqlite = async () => {
  try {
    await db.open()
    await db.query({
      sql: `
      CREATE TABLE IF NOT EXISTS sys_config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE,
        value TEXT
      );
    `
    })
    /**
     * 插入欢迎界面存储配置
     */
    await db.query({
      sql: `
      INSERT OR IGNORE INTO sys_config (id, key, value) VALUES (1, 'welcome', 0);;
      `
    })
    /**
     * 插入配置用户是否弹出关闭窗口确认
     */
    await db.query({
      sql: `
      INSERT OR IGNORE INTO sys_config (id, key, value) VALUES (2, 'closed_value', 0);;
      `
    })
    /**
     * 插入配置用户是否弹出关闭窗口确认
     */
    await db.query({
      sql: `
      INSERT OR IGNORE INTO sys_config (id, key, value) VALUES (3, 'remember_closed', 0);;
      `
    })
    logger.info('Database initialized.')
  } catch (err) {
    console.error('Error opening database:', err)
  }
}

export const sqlQuery = db.query.bind(db)
export const sqlInsert = db.insert.bind(db)
export const sqlUpdate = db.update.bind(db)
export const sqlDelete = db.delete.bind(db)
