<script setup lang="ts">
import Header from '../../components/Header.vue'
import { computed, ref } from 'vue'
import Icon from '../../components/Icon.vue'
import { router } from '../../router'

const active = ref('/setting')
const pages = ref([
  {
    text: '通用',
    icon: 'setting-setting',
    value: '/setting'
  },
  {
    text: '其它',
    icon: 'setting-other',
    value: '/setting/other'
  }
])
/**
 * 点击菜单项事件
 * @param value
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const handleClick = (value) => {
  active.value = value
  router.push(value)
}
const currentTitle = computed(() => {
  return router.currentRoute.value.meta.title
})
</script>

<template>
  <div class="setting">
    <div class="container">
      <div class="sidebar">
        <div class="drag"></div>
        <div
          v-for="(item, index) in pages"
          :key="index"
          class="sidebar-item"
          :id="item.value == active ? 'active' : ''"
          @click="handleClick(item.value)"
        >
          <div class="icon">
            <Icon :name="item.icon" :size="20" :alt="item.icon" />
          </div>
          <div class="text">
            {{ item.text }}
          </div>
        </div>
      </div>
      <div class="content">
        <Header window-id="setting"></Header>
        <div class="title">{{ currentTitle }}</div>
        <RouterView></RouterView>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.setting {
  height: 100vh;
  width: 100%;
  .container {
    display: flex;
    height: 100%;
    .sidebar {
      height: 100%;
      width: 240px;
      padding: 0 5px 5px 5px;
      border-right: 1px solid var(--color-border-1);
      .drag {
        height: 40px;
      }
      .sidebar-item {
        width: 100%;
        display: flex;
        padding: 5px 10px;
        margin-bottom: 5px;
        border-radius: 10px;
        align-items: center;
        cursor: default;
        &:hover {
          background: var(--color-fill-2);
        }
        .icon {
          margin: 0 10px;
        }
      }
      #active {
        background: var(--color-fill-3);
      }
    }
    .content {
      width: 100%;
      background: var(--color-fill-1);
      .title {
        width: 100%;
        padding: 10px 10px;
        font-size: var(--font-size-xl);
        border-bottom: 1px solid var(--color-border-2);
        font-weight: 500;
      }
    }
  }
}
</style>
