<template>
  <div class="log-viewer">
    <!-- 过滤控制区 -->
    <div class="controls">
      <div class="filter-group">
        <label for="log-level">日志级别：</label>
        <select id="log-level" v-model="queryParams.type" @change="refreshLogs">
          <option value="">全部</option>
          <option v-for="level in availableLevels" :key="level" :value="level">
            {{ level }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label>时间范围：</label>
        <input v-model="startTimeStr" type="datetime-local" @change="handleDateChange" />
        <span class="separator">至</span>
        <input v-model="endTimeStr" type="datetime-local" @change="handleDateChange" />
      </div>

      <div class="filter-group">
        <button :disabled="loading" @click="toggleSort">
          {{ sortButtonText }}
        </button>
      </div>

      <div class="filter-group">
        <label for="page-size">每页显示：</label>
        <select id="page-size" v-model="queryParams.size" @change="refreshLogs">
          <option value="20">20条</option>
          <option value="50">50条</option>
          <option value="100">100条</option>
        </select>
      </div>

      <button class="refresh-btn" :disabled="loading" @click="refreshLogs">
        <span v-if="!loading">刷新</span>
        <span v-else class="spinner"></span>
      </button>
    </div>

    <!-- 日志内容区 -->
    <div class="log-content">
      <div v-if="loading" class="loading-indicator">
        <div class="spinner"></div>
        <span>加载中...</span>
      </div>

      <div v-else-if="logs.length === 0" class="empty-message">没有找到匹配的日志</div>

      <div v-else class="log-entries">
        <div v-for="(log, index) in logs" :key="index" class="log-entry" :class="log.level">
          <div class="log-meta">
            <span class="timestamp">{{ formatDateTime(log.timestamp) }}</span>
            <span class="level-badge" :class="log.level">{{ log.level }}</span>
            <span v-if="log.scope" class="scope">{{ log.scope }}</span>
          </div>
          <div class="message">{{ log.message }}</div>
        </div>
      </div>
    </div>

    <!-- 分页控制 -->
    <div v-if="total > 0" class="pagination">
      <button :disabled="queryParams.page <= 1 || loading" @click="prevPage">上一页</button>
      <span class="page-info">
        第 {{ queryParams.page }} 页 / 共 {{ totalPages }} 页 (共 {{ total }} 条)
      </span>
      <button :disabled="queryParams.page >= totalPages || loading" @click="nextPage">
        下一页
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, computed, onMounted } from 'vue'
import { readLogs, getLogLevels, type LogEntry, type LogQueryParams } from '../../utils/log'
// 响应式数据
const logs = ref<LogEntry[]>([])
const total = ref(0)
const availableLevels = ref<string[]>([])
const loading = ref(false)
const startTimeStr = ref('')
const endTimeStr = ref('')

// 查询参数
const queryParams = ref<LogQueryParams>({
  page: 1,
  size: 20,
  sort: 'desc'
})

// 计算属性
const totalPages = computed(() => Math.ceil(total.value / queryParams.value.size))
const sortButtonText = computed(() =>
  queryParams.value.sort === 'desc' ? '最新优先 ↓' : '最旧优先 ↑'
)

// 方法
const formatDateTime = (date: Date): string => {
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const fetchLogs = async () => {
  loading.value = true
  try {
    const result = await readLogs(queryParams.value)
    logs.value = result.logs
    total.value = result.total
  } catch (error) {
    console.error('获取日志失败:', error)
    logs.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const fetchLogLevels = async () => {
  try {
    availableLevels.value = await getLogLevels()
  } catch (error) {
    console.error('获取日志级别失败:', error)
    availableLevels.value = []
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const refreshLogs = () => {
  queryParams.value.page = 1
  fetchLogs()
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const toggleSort = () => {
  queryParams.value.sort = queryParams.value.sort === 'desc' ? 'asc' : 'desc'
  refreshLogs()
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const handleDateChange = () => {
  queryParams.value.startDateTime = startTimeStr.value ? new Date(startTimeStr.value) : undefined
  queryParams.value.endDateTime = endTimeStr.value ? new Date(endTimeStr.value) : undefined
  refreshLogs()
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const nextPage = () => {
  if (queryParams.value.page < totalPages.value) {
    queryParams.value.page++
    fetchLogs()
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const prevPage = () => {
  if (queryParams.value.page > 1) {
    queryParams.value.page--
    fetchLogs()
  }
}

// 初始化
onMounted(() => {
  fetchLogLevels()
  fetchLogs()
})
</script>

<style scoped>
.log-viewer {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #ffffff;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

label {
  font-size: 14px;
  color: #4a5568;
  font-weight: 500;
}

select,
input[type='datetime-local'] {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 14px;
  background-color: #fff;
  transition: border-color 0.2s;
}

select:focus,
input[type='datetime-local']:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
}

.separator {
  color: #718096;
  padding: 0 5px;
}

button {
  padding: 8px 16px;
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 80px;
}

button:hover:not(:disabled) {
  background-color: #3182ce;
}

button:disabled {
  background-color: #a0aec0;
  cursor: not-allowed;
  opacity: 0.7;
}

.refresh-btn {
  background-color: #48bb78;
  margin-left: auto;
}

.refresh-btn:hover:not(:disabled) {
  background-color: #38a169;
}

.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
  margin-right: 8px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #4a5568;
}

.empty-message {
  text-align: center;
  padding: 40px;
  color: #718096;
  font-size: 16px;
}

.log-content {
  background-color: #ffffff;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  min-height: 400px;
  margin-bottom: 20px;
}

.log-entries {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 15px;
}

.log-entry {
  padding: 12px 15px;
  border-radius: 6px;
  background-color: #ffffff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border-left: 4px solid #a0aec0;
}

.log-entry .error {
  border-left-color: #f56565;
  background-color: #fff5f5;
}

.log-entry .warn {
  border-left-color: #f6ad55;
  background-color: #fffaf0;
}

.log-entry .info {
  border-left-color: #4299e1;
  background-color: #ebf8ff;
}

.log-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
  font-size: 13px;
  color: #4a5568;
}

.timestamp {
  color: #718096;
}

.level-badge {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.level-badge.error {
  background-color: #fed7d7;
  color: #c53030;
}

.level-badge.warn {
  background-color: #feebc8;
  color: #b7791f;
}

.level-badge.info {
  background-color: #bee3f8;
  color: #2b6cb0;
}

.scope {
  color: #718096;
  font-style: italic;
}

.message {
  font-size: 14px;
  line-height: 1.5;
  color: #2d3748;
  word-break: break-word;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 15px;
  background-color: #ffffff;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.page-info {
  color: #4a5568;
  font-size: 14px;
}
</style>
