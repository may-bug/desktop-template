<template>
  <div class="wechat-menu-container">
    <!-- 右上角菜单按钮 -->
    <van-icon
        name="ellipsis"
        class="menu-icon"
        size="20"
        @click="showMenu = !showMenu"
    />

    <!-- 弹出菜单 -->
    <van-popup
        v-model:show="showMenu"
        position="top-right"
        :style="{ width: '150px', height: 'auto',borderRadius: '10px' }"
        :overlay="false"
        round
    >
      <div class="menu-content">
        <div
            v-for="(item, index) in menuItems"
            :key="index"
            class="menu-item"
            @click="handleMenuItemClick(item)"
        >
          <van-icon :name="item.icon" size="16" />
          <span>{{ item.text }}</span>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import {router} from "../../router/index.js";

const showMenu = ref(false);

const menuItems = [
  { text: '扫一扫', icon: 'scan', action: 'scan' },
  { text: '文件快传', icon: 'friends-o', action: 'addFriend' },
];

const handleMenuItemClick = (item) => {
  console.log(`执行操作: ${item.action}`);
  showMenu.value = false;
  switch (item.action) {
    case 'scan':
      router.push('/scan');
      break
    default:
      break;
  }
};
</script>

<style lang="scss" scoped>
.wechat-menu-container {
  position: relative;

  .menu-icon {
    padding: 12px;
    color: #333;
    cursor: pointer;
  }

  .menu-content {
    padding: 8px 0;

    .menu-item {
      display: flex;
      align-items: center;
      padding: 10px 16px;
      font-size: 14px;
      color: #333;

      &:active {
        background-color: #f2f2f2;
      }

      .van-icon {
        margin-right: 8px;
      }
    }
  }

  :deep(.van-popup--top-right) {
    top: 50px;
    right: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

    &::before {
      content: '';
      position: absolute;
      top: -8px;
      right: 15px;
      width: 0;
      height: 0;
      border-left: 8px solid transparent;
      border-right: 8px solid transparent;
      border-bottom: 8px solid white;
    }
  }
}
</style>