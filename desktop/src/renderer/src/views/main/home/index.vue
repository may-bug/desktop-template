<script setup lang="ts">
// 引入three.js
import * as THREE from 'three'
// 引入轨道控制器扩展库OrbitControls.js
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
// 引入gltf模型加载库GLTFLoader.js
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
//引入性能监视器stats.js
import Stats from 'three/addons/libs/stats.module.js'
import MODEL from '../../../assets/model/test/hei.gltf'
import { onMounted, useTemplateRef } from 'vue'

const container = useTemplateRef<Element | null>('container')
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const initThree = () => {
  // 创建3D场景对象Scene
  const scene = new THREE.Scene()
  //设置背景为空
  scene.background = null
  //创建一个长方体几何对象Geometry
  const geometry = new THREE.BoxGeometry(100, 100, 100)
  //创建一个材质对象Material
  const material = new THREE.MeshLambertMaterial({
    color: 0xff0000 //0xff0000设置材质颜色为红色
  })
  //点光源：两个参数分别表示光源颜色和光照强度
  // 参数1：0xffffff是纯白光,表示光源颜色
  // 参数2：1.0,表示光照强度，可以根据需要调整
  // const pointLight = new THREE.PointLight(0xffffff, 1.0)
  // pointLight.intensity = 1.0 //光照强度
  // pointLight.decay = 1.0 //设置光源不随距离衰减
  // //点光源位置
  // pointLight.position.set(400, 0, 0) //点光源放在x轴上
  // scene.add(pointLight) //点光源添加到场景中
  const pointLight = new THREE.PointLight( 0xff0000, 1, 100 );
  pointLight.position.set( 10, 10, 10 );
  scene.add( pointLight );
  // 两个参数分别为几何体geometry、材质material
  const mesh = new THREE.Mesh(geometry, material) //网格模型对象Mesh
  //设置网格模型在三维空间中的位置坐标，默认是坐标原点
  mesh.position.set(0, 10, 0)
  // scene.add(mesh)
  // 创建GLTF加载器对象
  const loader = new GLTFLoader()
  // 单独.gltf文件
  loader.load(MODEL, function (gltf) {
    const model = gltf.scene;
    // 修改模型的缩放
    model.scale.set(10, 10, 10); // 设置缩放比例 (x, y, z)
    // 查看gltf所有颜色贴图的.encoding值
    model.traverse(function(obj) {
      if (obj.isMesh) {
        obj.material.emissive =  obj.material.color;
        obj.material.emissiveMap = obj.material.map ;
        if(obj.material.map){//判断是否存在贴图
          console.log('.encoding',obj.material.map.colorSpace);
        }
      }
    })
    // .encoding显示3001，说明是THREE.sRGBEncoding
    console.log('mesh .encoding',mesh.material.map);
    scene.add(model)
  })
  //点光源辅助
  const sphereSize = 1;
  const pointLightHelper = new THREE.PointLightHelper(pointLight, sphereSize);
  scene.add(pointLightHelper)
  // 实例化一个透视投影相机对象
  const camera = new THREE.PerspectiveCamera()
  //相机在Three.js三维坐标系中的位置
  //根据需要设置相机位置具体值
  camera.position.set(200, 200, 200)
  //指向mesh对应的位置
  camera.lookAt(loader)
  // 创建渲染器对象
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  })
  // //解决加载gltf格式模型纹理贴图和原图不一样问题
  renderer.outputEncoding = THREE.sRGBEncoding;
  // //新版本，加载gltf，不需要执行下面代码解决颜色偏差
  renderer.outputColorSpace = THREE.SRGBColorSpace;//设置为SRGB颜色空间

  // width和height用来设置Three.js输出的Canvas画布尺寸(像素px)
  const width = window.innerWidth - 60 //窗口文档显示区的宽度作为画布宽度
  const height = window.innerHeight - 30 //窗口文档显示区的高度作为画布高度
  renderer.setSize(width, height) //设置three.js渲染区域的尺寸(像素px)
  renderer.render(scene, camera) //执行渲染操作
  container.value?.appendChild(renderer.domElement)
  // 设置相机控件轨道控制器OrbitControls
  const controls = new OrbitControls(camera, renderer.domElement)
  // 如果OrbitControls改变了相机参数，重新调用渲染器渲染三维场景
  controls.addEventListener('change', function () {
    renderer.render(scene, camera) //执行渲染操作
  }) //监听鼠标、键盘事件
  controls.addEventListener('change', function () {
    // 浏览器控制台查看相机位置变化
    console.log('camera.position', camera.position)
  })
  // onresize 事件会在窗口被调整大小时发生
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  window.onresize = function () {
    // 重置渲染器输出画布canvas尺寸
    renderer.setSize(window.innerWidth - 60, window.innerHeight - 30)
    // 全屏情况下：设置观察范围长宽比aspect为窗口宽高比
    camera.aspect = window.innerWidth / window.innerHeight
    // 渲染器执行render方法的时候会读取相机对象的投影矩阵属性projectionMatrix
    // 但是不会每渲染一帧，就通过相机的属性计算投影矩阵(节约计算资源)
    // 如果相机的一些属性发生了变化，需要执行updateProjectionMatrix ()方法更新相机的投影矩阵
    camera.updateProjectionMatrix()
  }
  //创建stats对象
  const stats = new Stats()
  //stats.domElement:web页面上输出计算结果,一个div元素，
  document.body.appendChild(stats.domElement)
  // 渲染函数
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  function render() {
    //requestAnimationFrame循环调用的函数中调用方法update(),来刷新时间
    stats.update()
    renderer.render(scene, camera) //执行渲染操作
    requestAnimationFrame(render) //请求再次执行渲染函数render，渲染下一帧
  }
  render()
  return null
}

onMounted(() => {
  initThree()
})
</script>

<template>
  <div ref="container"></div>
</template>

<style scoped lang="scss"></style>
