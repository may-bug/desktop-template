<template>
  <div class="sidebar">
    <div class="sidebar-item title" @click="handleClick('profile')">
      <div>TG</div>
    </div>
    <div class="sidebar-item avatar" @click="handleClick('avatar')">
      <img class="avatar" src="@renderer/assets/icons/menu/avatar.svg" alt="More" />
    </div>
    <div class="space"></div>
    <div
      v-for="(item, index) in bottomMenus"
      :key="index"
      :class="`sidebar-item icon ${item.value}`"
      @click="handleClick(item.value)"
    >
      <Icon :name="item.name" :size="20" alt="More" />
    </div>
  </div>
  <MoreMenu v-if="showMore" v-model:show="showMore" class="more-menu"></MoreMenu>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Icon from './Icon.vue'
import { createWindow } from '../utils/windows'
import MoreMenu from './MoreMenu.vue'
import { router } from '../router'
const active = ref('')
const showMore = ref<boolean>(false)

const bottomMenus = ref([
  {
    name: 'menu-more',
    value: 'app'
  },
  {
    name: 'menu-messages',
    value: 'message'
  },
  {
    name: 'menu-file',
    value: 'file'
  },
  {
    name: 'menu-menu',
    value: 'menu'
  }
])
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const handleClick = (item: string) => {
  console.log(`Clicked on ${item}`)
  active.value = item
  switch (item) {
    case 'more':
      showMore.value = false
      createWindow('setting', '设置', 400, 400, '/setting', false, undefined)
      break
    case 'file':
      showMore.value = false
      createWindow('file', '文件', 900, 600, '/file', false, undefined)
      break
    case 'menu':
      showMore.value = true
      break
    case 'app':
      showMore.value = false
      createWindow('app', '应用', 900, 600, '/app', false, undefined)
      break
    default:
      break
  }
}
</script>

<style scoped lang="scss">
.sidebar {
  position: relative;
  padding: 5px 10px;
  border-right: 1px solid var(--color-border-1);
  display: flex;
  flex-direction: column;
  height: 100%;
  :last-child {
    margin-bottom: 5px;
  }
}

.space {
  flex-grow: 1;
}

.sidebar-item {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  cursor: pointer;
  border-radius: 5px;
  &:not(.title):hover {
    color: var(--color-primary);
  }
}

.title {
  padding: 15px 0 5px 0;
}

.avatar {
  height: 30px;
  width: 30px;
  border-radius: 50%;
  margin: auto;
}

.icon {
  margin: 6px 0;
}

.more-menu {
  position: fixed;
  bottom: 5px;
  left: 62px;
}
</style>
