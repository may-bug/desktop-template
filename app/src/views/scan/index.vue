<template>
  <div class="scan-page">
    <van-nav-bar
        title="扫一扫"
        left-text="返回"
        left-arrow
        @click-left="onClickLeft"
    />

    <!-- 权限提示 -->
    <div v-if="!permissionGranted" class="permission-prompt">
      <van-icon name="camera-o" size="48" />
      <p class="title">需要相机权限</p>
      <p class="desc">请允许访问相机以使用扫码功能</p>
      <van-button
          type="primary"
          round
          @click="requestCameraPermission"
      >
        允许使用相机
      </van-button>

      <div v-if="showPermissionHelp" class="help-text">
        <p>相机权限被拒绝，请前往设置开启权限</p>
        <van-button
            plain
            type="primary"
            size="small"
            @click="openAppSetting"
        >
          打开应用设置
        </van-button>
      </div>
    </div>

    <!-- 扫码界面 -->
    <div v-show="permissionGranted" class="scan-container">
      <div class="scan-frame">
        <div class="corner top-left"></div>
        <div class="corner top-right"></div>
        <div class="corner bottom-left"></div>
        <div class="corner bottom-right"></div>
      </div>
      <p class="scan-tip">将二维码放入框内，即可自动扫描</p>

      <div class="action-bar">
        <van-button icon="photo" type="default" @click="openAlbum">
          相册
        </van-button>
      </div>
    </div>

    <!-- 错误提示 -->
    <van-dialog
        v-model:show="showErrorDialog"
        title="提示"
        show-cancel-button
        @confirm="retryScan"
    >
      {{ errorMessage }}
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { Dialog, Notify } from 'vant';
import { scan, Format, openAppSettings, checkPermissions, requestPermissions } from '@tauri-apps/plugin-barcode-scanner';

const router = useRouter();

// 状态管理
const permissionGranted = ref(false);
const showPermissionHelp = ref(false);
const showErrorDialog = ref(false);
const errorMessage = ref('');
const scanActive = ref(false);

// 检查相机权限
const checkCameraPermission = async () => {
  try {
    const hasPermission = await checkPermissions();
    permissionGranted.value = hasPermission;
    return hasPermission;
  } catch (error) {
    console.error('检查权限失败:', error);
    return false;
  }
};

// 请求相机权限
const requestCameraPermission = async () => {
  try {
    const granted = await requestPermissions();
    if (granted) {
      permissionGranted.value = true;
      startScan();
    } else {
      showPermissionHelp.value = true;
      Notify({type: 'danger', message: '相机权限被拒绝'});
    }
  } catch (error) {
    console.error('请求权限失败:', error);
    showPermissionHelp.value = true;
    Notify({type: 'danger', message: '获取相机权限失败'});
  }
};

// 打开应用设置
const openAppSetting = async () => {
  try {
    await openAppSettings();
  } catch (error) {
    console.error('打开设置失败:', error);
    Notify({type: 'danger', message: '无法打开应用设置'});
  }
};

// 开始扫码
const startScan = async () => {
  if (scanActive.value) return;

  try {
    scanActive.value = true;
    const result = await scan({
      windowed: true,
      formats: [Format.QRCode]
    });

    if (result) {
      handleScanResult(result);
    }
  } catch (error) {
    console.error('扫码失败:', error);
    errorMessage.value = error.message || '扫码失败，请重试';
    showErrorDialog.value = true;
  } finally {
    scanActive.value = false;
  }
};

// 处理扫码结果
const handleScanResult = (result) => {
  console.log('扫码结果:', result);
  Dialog.alert({
    title: '扫码结果',
    message: result,
  }).then(() => {
    // 扫码成功后继续扫码
    startScan();
  });
};

// 重试扫码
const retryScan = () => {
  startScan();
};

// 打开相册
const openAlbum = () => {
  Notify('相册功能暂未实现');
};

// 返回
const onClickLeft = () => {
  router.back();
};

// 生命周期
onMounted(async () => {
  const hasPermission = await checkCameraPermission();
  if (hasPermission) {
    startScan();
  }
});

onBeforeUnmount(() => {
  scanActive.value = false;
});
</script>

<style lang="scss" scoped>
.scan-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #000;

  .permission-prompt {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    color: white;
    text-align: center;

    .title {
      font-size: 18px;
      margin: 16px 0 8px;
    }

    .desc {
      font-size: 14px;
      color: #ccc;
      margin-bottom: 24px;
    }

    .help-text {
      margin-top: 24px;
      font-size: 12px;
      color: #999;
      line-height: 1.6;

      .van-button {
        margin-top: 10px;
      }
    }
  }

  .scan-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;

    .scan-frame {
      width: 250px;
      height: 250px;
      border: 1px solid rgba(255, 255, 255, 0.3);
      position: relative;

      .corner {
        position: absolute;
        width: 20px;
        height: 20px;
        border-color: #07C160;
        border-style: solid;
        border-width: 0;

        &.top-left {
          top: 0;
          left: 0;
          border-top-width: 4px;
          border-left-width: 4px;
        }

        &.top-right {
          top: 0;
          right: 0;
          border-top-width: 4px;
          border-right-width: 4px;
        }

        &.bottom-left {
          bottom: 0;
          left: 0;
          border-bottom-width: 4px;
          border-left-width: 4px;
        }

        &.bottom-right {
          bottom: 0;
          right: 0;
          border-bottom-width: 4px;
          border-right-width: 4px;
        }
      }
    }

    .scan-tip {
      color: #fff;
      margin-top: 20px;
      font-size: 14px;
    }

    .action-bar {
      position: absolute;
      bottom: 30px;
      left: 0;
      right: 0;
      display: flex;
      justify-content: center;

      :deep(.van-button) {
        width: 120px;
      }
    }
  }
}
</style>