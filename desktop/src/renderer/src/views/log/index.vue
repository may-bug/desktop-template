<template>
  <Header window-id="log" window-title="日志" :is-resize="true"></Header>
  <a-card class="log-container" :bordered="false">
    <div class="header">
      <a-space size="large">
        <a-typography-title :heading="6">操作日志</a-typography-title>
        <a-space>
          <a-button :loading="loading" @click="handleRefresh">
            <template #icon>
              <icon-refresh />
            </template>
            刷新
          </a-button>
          <a-button type="primary" @click="handleExport">
            <template #icon>
              <icon-download />
            </template>
            导出日志
          </a-button>
        </a-space>
      </a-space>
    </div>

    <!-- 筛选表单 -->
    <a-form :model="queryParams" layout="inline" class="filter-form">
      <a-form-item label="日志级别">
        <a-select
          v-model="queryParams.type"
          placeholder="请选择日志级别"
          allow-clear
          style="width: 180px"
        >
          <a-option v-for="level in logLevels" :key="level" :value="level">
            {{ level }}
          </a-option>
        </a-select>
      </a-form-item>

      <a-form-item label="时间范围">
        <a-range-picker
          v-model="dateRange"
          show-time
          style="width: 320px"
          @change="handleDateChange"
        />
      </a-form-item>

      <a-form-item label="日志内容">
        <a-input-search
          v-model="queryParams.keyword"
          placeholder="请输入搜索内容"
          allow-clear
          style="width: 240px"
          @search="handleSearch"
        />
      </a-form-item>

      <a-form-item>
        <a-button type="primary" @click="fetchLogs">
          <template #icon>
            <icon-search />
          </template>
          查询
        </a-button>
      </a-form-item>
    </a-form>

    <!-- 日志表格 -->
    <a-table
      :columns="columns"
      :data="logData"
      :pagination="pagination"
      :loading="loading"
      row-key="raw"
      style="margin-top: 16px"
      @page-change="handlePageChange"
      @page-size-change="handlePageSizeChange"
    >
      <template #level="{ record }">
        <a-tag :color="getLevelColor(record.level)">
          {{ record.level.toUpperCase() }}
        </a-tag>
      </template>

      <template #timestamp="{ record }">
        {{ formatDate(record.timestamp) }}
      </template>

      <template #scope="{ record }">
        {{ record.scope || '-' }}
      </template>
    </a-table>
  </a-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Message, PaginationProps, TableColumnData } from '@arco-design/web-vue'
import { getLogLevels, type LogEntry, type LogQueryParams, readLogs } from '../../utils/log/reader'
import dayjs from 'dayjs'
import Header from '../../components/Header.vue'
import { logger } from '../../utils/log'

// 表格列定义
const columns: TableColumnData[] = [
  {
    title: '时间',
    dataIndex: 'timestamp',
    slotName: 'timestamp',
    width: 180,
    sortable: {
      sortDirections: ['ascend', 'descend']
    }
  },
  {
    title: '级别',
    dataIndex: 'level',
    slotName: 'level',
    width: 100,
    filterable: {
      filters: [
        { text: 'INFO', value: 'info' },
        { text: 'WARN', value: 'warn' },
        { text: 'ERROR', value: 'error' }
      ],
      filter: (value, row) => row.level === value
    }
  },
  {
    title: '模块',
    dataIndex: 'scope',
    slotName: 'scope',
    width: 150
  },
  {
    title: '内容',
    dataIndex: 'message',
    ellipsis: true,
    tooltip: true
  }
]

// 状态管理
const loading = ref(false)
const logData = ref<LogEntry[]>([])
const logLevels = ref<string[]>([])
const dateRange = ref<string[]>([])

// 查询参数
const queryParams = ref<LogQueryParams>({
  page: 1,
  size: 20,
  sort: 'desc'
})

// 分页信息
const pagination = ref<PaginationProps>({
  current: 1,
  pageSize: 20,
  total: 0,
  showTotal: true,
  showJumper: true,
  showPageSize: true
})

// 获取日志级别
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const fetchLogLevels = async () => {
  try {
    logLevels.value = await getLogLevels()
  } catch (error) {
    Message.error('获取日志级别失败')
    logger.error('info', 'log', `获取日志级别失败 cause ${error.message}`)
  }
}

// 获取日志数据
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const fetchLogs = async () => {
  loading.value = true
  try {
    const { logs, total, page, size } = await readLogs(queryParams.value)
    logData.value = logs
    pagination.value = {
      ...pagination.value,
      current: page,
      pageSize: size,
      total
    }
  } catch (error) {
    Message.error('获取日志级别失败')
    logger('info', 'log', `获取日志级别失败 cause ${error.message}`)
  } finally {
    loading.value = false
  }
}

// 日期变化处理
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const handleDateChange = (dates: string[]) => {
  if (dates && dates.length === 2) {
    queryParams.value.startDateTime = new Date(dates[0])
    queryParams.value.endDateTime = new Date(dates[1])
  } else {
    queryParams.value.startDateTime = undefined
    queryParams.value.endDateTime = undefined
  }
}

// 页码变化
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const handlePageChange = (page: number) => {
  queryParams.value.page = page
  fetchLogs()
}

// 每页条数变化
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const handlePageSizeChange = (size: number) => {
  queryParams.value.size = size
  queryParams.value.page = 1
  fetchLogs()
}

// 搜索处理
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const handleSearch = () => {
  queryParams.value.page = 1
  fetchLogs()
}

// 刷新
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const handleRefresh = () => {
  fetchLogs()
  fetchLogLevels()
}

// 导出日志
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const handleExport = () => {
  Message.info('导出功能待实现')
  Message.error('获取日志级别失败')
  logger('info', 'log', `获取日志级别失败`)
}

// 根据日志级别获取颜色
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const getLevelColor = (level: string) => {
  switch (level.toLowerCase()) {
    case 'error':
      return 'red'
    case 'warn':
      return 'orange'
    case 'info':
      return 'blue'
    default:
      return 'gray'
  }
}

// 格式化日期
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const formatDate = (date: Date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

// 初始化
onMounted(() => {
  fetchLogLevels()
  fetchLogs()
})
</script>

<style scoped>
.log-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.filter-form {
  margin-bottom: 16px;
}
</style>
