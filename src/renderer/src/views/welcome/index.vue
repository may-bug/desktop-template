<template>
  <Header window-id="welcome" :is-fixed="true" :is-min-max="false"></Header>
  <a-carousel
    class="carousel"
    show-arrow="hover"
    :default-current="1"
    indicator-type="slider"
    auto-play
    @change="handleChange"
  >
    <a-carousel-item v-for="(image, index) in images" :key="index">
      <img
        :src="image"
        :style="{
          width: '100%'
        }"
        alt="img"
      />
    </a-carousel-item>
  </a-carousel>
  <div class="content">
    <div class="detail" v-html="description"></div>
    <a-button class="start" type="primary" @click="handleStart">立即体验</a-button>
  </div>
  <div class="logo">
    <div class="title">TG</div>
  </div>
</template>

<script setup lang="ts">
import Header from '../../components/Header.vue'
import { closeWindow, createWindow, setConfig } from '../../utils/windows'
const images = [
  'https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/cd7a1aaea8e1c5e3d26fe2591e561798.png~tplv-uwbnlip3yd-webp.webp',
  'https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/6480dbc69be1b5de95010289787d64f1.png~tplv-uwbnlip3yd-webp.webp',
  'https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/0265a04fddbd77a19602a15d9d55d797.png~tplv-uwbnlip3yd-webp.webp'
]
const description =
  '<div style="max-width: 800px; margin: 0 auto; background: #fff; padding: 20px; border-radius: 8px;">\n' +
  '        <li><strong style="color: #333;">多模态交互：</strong>无论是文字、语音还是图像，通义都能理解并回应您的需求。</li>\n' +
  '        <li><strong style="color: #333;">个性化推荐：</strong>基于深度学习算法，提供定制化的信息和服务建议。</li>\n' +
  '        <li><strong style="color: #333;">实时更新：</strong>获取最新资讯，掌握行业动态，让决策更加明智。</li>\n' +
  '        <li><strong style="color: #333;">安全保障：</strong>严格的数据保护措施，确保您的信息安全无忧。</li>\n' +
  '    </ul>\n' +
  '</div>'
const handleChange = (value) => {
  console.log(value)
}
const handleStart = () => {
  setConfig('welcome', true)
  createWindow('login', '登录', 321, 450, '/login', false, undefined)
  closeWindow('welcome')
}
</script>

<style lang="scss" scoped>
.carousel {
  width: 100vw;
  height: 60vh;
}
.header {
  ::v-deep(.icon:not(.close)) {
    &:hover {
      background: transparent;
    }
  }
}
.content {
  .detail {
    width: 100%;
    height: 120px;
  }
  .start {
    width: 20%;
    margin: 20px 40%;
  }
}
.logo {
  position: fixed;
  top: 0;
  left: 0;
  width: 100px;
  z-index: 2001;
  padding: 20px;
  font-size: var(--font-size-lg);
}
</style>
