<template>
  <div class="room-list-container">
    <div class="header">
      <h1>视频会议房间</h1>
      <button @click="showCreateModal = true" class="create-button">
        <span class="desktop-text">创建房间</span>
        <span class="mobile-icon">+</span>
      </button>
    </div>

    <div class="room-grid">
      <div v-for="room in rooms" :key="room.id" class="room-card">
        <div class="room-info">
          <h3>{{ room.name }}</h3>
          <p>创建者: {{ room.creator }}</p>
          <p>人数: {{ room.userCount }}/{{ room.maxUsers }}</p>
        </div>
        <button @click="joinRoom(room.id)" class="join-button">
          <span class="desktop-text">加入</span>
          <span class="mobile-icon">→</span>
        </button>
      </div>
    </div>

    <!-- 创建房间模态框 -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
      <div class="modal">
        <h2>创建新房间</h2>
        <div class="form-group">
          <label for="roomName">房间名称</label>
          <input
              id="roomName"
              v-model="newRoom.name"
              type="text"
              placeholder="输入房间名称"
          />
        </div>
        <div class="form-group">
          <label for="maxUsers">最大人数</label>
          <input
              id="maxUsers"
              v-model="newRoom.maxUsers"
              type="number"
              min="2"
              max="20"
              placeholder="输入最大人数"
          />
        </div>
        <div class="form-group checkbox-group">
          <label>
            <input
                v-model="newRoom.isPrivate"
                type="checkbox"
                class="checkbox-input"
            />
            <span class="checkbox-custom"></span>
            私有房间
          </label>
        </div>
        <div v-if="newRoom.isPrivate" class="form-group">
          <label for="password">密码</label>
          <input
              id="password"
              v-model="newRoom.password"
              type="password"
              placeholder="设置房间密码"
          />
        </div>
        <div class="modal-buttons">
          <button @click="createRoom" class="confirm-button">创建</button>
          <button @click="showCreateModal = false" class="cancel-button">取消</button>
        </div>
      </div>
    </div>

    <!-- 加入密码房间模态框 -->
    <div v-if="showPasswordModal" class="modal-overlay" @click.self="showPasswordModal = false">
      <div class="modal">
        <h2>请输入房间密码</h2>
        <div class="form-group">
          <input
              v-model="roomPassword"
              type="password"
              placeholder="输入房间密码"
              @keyup.enter="confirmJoinRoom"
          />
        </div>
        <div class="modal-buttons">
          <button @click="confirmJoinRoom" class="confirm-button">确定</button>
          <button @click="showPasswordModal = false" class="cancel-button">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted} from 'vue'
import {useRouter} from 'vue-router'
import {roomCreate, roomJoin, roomList} from "../api/room.js";

const router = useRouter()
const rooms = ref([])
const showCreateModal = ref(false)
const showPasswordModal = ref(false)
const selectedRoomId = ref('')
const roomPassword = ref('')

const newRoom = ref({
  name: '',
  maxUsers: 10,
  isPrivate: false,
  password: ''
})

// 获取房间列表
const fetchRooms = async () => {
  roomList().then(response => {
    if (response.code === 200) {
      rooms.value = response.data
    } else {
      alert("获取房间失败")
    }
  }).catch(err => {
    alert("服务器错误")
  })
}

// 创建房间
const createRoom = async () => {
  try {
    if(newRoom.value.name==='') {
      alert("请填写房间名称")
      return
    }
    const response = await roomCreate(newRoom.value)
    rooms.value.push(response.data)
    showCreateModal.value = false
    newRoom.value = {
      name: '',
      maxUsers: 10,
      isPrivate: false,
      password: ''
    }

    // 自动加入新创建的房间
    joinRoom(response.data.id)
  } catch (error) {
    console.error('创建房间失败:', error)
  }
}

// 加入房间
const joinRoom = (roomId) => {
  const room = rooms.value.find(r => r.id === roomId)

  if (room.isPrivate && !room.joined) {
    selectedRoomId.value = roomId
    showPasswordModal.value = true
  } else {
    router.push(`/room/${roomId}`)
  }
}

// 确认加入密码房间
const confirmJoinRoom = async () => {
  roomJoin(selectedRoomId.value, {
    password: roomPassword.value
  }).then(async response => {
        if (response.code === 200) {
          await router.push(`/room/${selectedRoomId.value}`)
          showPasswordModal.value = false
          roomPassword.value = ''
        } else {
          alert("密码错误")
        }
      }
  ).catch(err => {
    alert("加入房间失败" + err.message)
  })
}

onMounted(()=>{
  fetchRooms()
  setInterval(()=>{
    fetchRooms()
  },5000)
})
</script>

<style scoped>
.room-list-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 15px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h1 {
  font-size: 1.5rem;
  margin: 0;
}

.create-button {
  padding: 10px 15px;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 5px;
}

.create-button:hover {
  background: #4338ca;
}

.mobile-icon {
  display: none;
}

.room-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 15px;
}

.room-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: box-shadow 0.2s;
  background: white;
}

.room-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.room-info h3 {
  margin: 0 0 8px;
  color: #111827;
  font-size: 1.1rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.room-info p {
  margin: 4px 0;
  color: #6b7280;
  font-size: 0.9rem;
}

.join-button {
  margin-top: 12px;
  padding: 8px 12px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.join-button:hover {
  background: #059669;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 15px;
}

.modal {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal h2 {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 1.3rem;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 1rem;
}

.checkbox-group {
  display: flex;
  align-items: center;
}

.checkbox-input {
  opacity: 0;
  position: absolute;
}

.checkbox-custom {
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid #d1d5db;
  border-radius: 3px;
  margin-right: 8px;
  position: relative;
  vertical-align: middle;
}

.checkbox-input:checked + .checkbox-custom {
  background-color: #4f46e5;
  border-color: #4f46e5;
}

.checkbox-input:checked + .checkbox-custom::after {
  content: "";
  position: absolute;
  left: 5px;
  top: 1px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.confirm-button {
  padding: 10px 20px;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-button {
  padding: 10px 20px;
  background: #f3f4f6;
  color: #111827;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* 移动端样式 */
@media (max-width: 768px) {
  .room-list-container {
    padding: 10px;
  }

  .header h1 {
    font-size: 1.3rem;
  }

  .room-grid {
    grid-template-columns: 1fr;
  }

  .desktop-text {
    display: none;
  }

  .mobile-icon {
    display: inline;
    font-size: 1.2rem;
  }

  .create-button, .join-button {
    padding: 8px 12px;
    min-width: 40px;
    justify-content: center;
  }

  .modal {
    padding: 15px;
  }

  .modal h2 {
    font-size: 1.2rem;
    margin-bottom: 15px;
  }

  .form-group input {
    padding: 8px;
  }

  .modal-buttons button {
    padding: 8px 15px;
  }
}

/* 横屏样式 */
@media (orientation: landscape) and (max-width: 768px) {
  .room-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}
</style>