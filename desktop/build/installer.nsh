!define APP_NAME "videovlc" ; 应用名称
!define APP_EXECUTABLE "videovlc.exe" ; 调用应用

!macro customHeader
  !system "echo '' > ${BUILD_RESOURCES_DIR}/customHeader"
!macroend

!macro preInit
  ; This macro is inserted at the beginning of the NSIS .OnInit callback
  !system "echo '' > ${BUILD_RESOURCES_DIR}/preInit"
!macroend

!macro customInit
  !system "echo '' > ${BUILD_RESOURCES_DIR}/customInit"
!macroend

!macro customUnInstall
  !system "echo '' > ${BUILD_RESOURCES_DIR}/customUnInstall"
  ; 卸载时删除右键菜单相关的注册表项
  DeleteRegKey HKCR "*\shell\${APP_NAME}\command"
  DeleteRegKey HKCR "*\shell\${APP_NAME}\Icon"
  DeleteRegKey HKCR "*\shell\${APP_NAME}"

  ; 从OpenWithProgids列表中移除ProgID
  DeleteRegValue HKCR "*\OpenWithProgids" " ${APP_NAME}File"

  ; 删除ProgID相关的注册表项
  DeleteRegKey HKCR "${APP_NAME}File\shell\open\command"
  DeleteRegKey HKCR "${APP_NAME}File\DefaultIcon"
  DeleteRegKey HKCR "${APP_NAME}File"
!macroend
!macro customInstall
  !system "echo '' > ${BUILD_RESOURCES_DIR}/customInstall"
  ; MessageBox MB_OK "安装路径为：$INSTDIR" IDOK
  ; This macro is inserted at the beginning of the NSIS .onInstSuccess callback
  ReadRegStr $0 HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation
  StrCmp $0 "" 0 +3
    Goto skipSaveUserLocation
    WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation "$0"
    SetRegView 64
    WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation "$0"
    SetRegView 32
    WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation "$0"
  skipSaveUserLocation:

  ; 添加注册表项到右键菜单
  WriteRegStr HKCR "*\shell\${APP_NAME}" "" "通过 ${APP_NAME} 打开"
  WriteRegStr HKCR "*\shell\${APP_NAME}\command" "" '"$INSTDIR\${APP_EXECUTABLE}" "%1"'
  ; 设置右键菜单图标
  WriteRegStr HKCR "*\shell\${APP_NAME}\Icon" "" "$INSTDIR\${APP_EXECUTABLE},0"

  ; 注意前面的空格 - 空格可以让应用排列在最前面(不生效)
  ; 创建ProgID
  WriteRegStr HKCR "${APP_NAME}File" "" "通过 ${APP_NAME} 打开"
  WriteRegStr HKCR "${APP_NAME}File\DefaultIcon" "" "$INSTDIR\${APP_EXECUTABLE},0" ; 假设图标是应用程序的第一个资源图标
  WriteRegStr HKCR "${APP_NAME}File\shell\open\command" "" '"$INSTDIR\${APP_EXECUTABLE}" "%1"'

  ; 将ProgID添加到OpenWithProgids列表中
  WriteRegStr HKCR "*\OpenWithProgids" " ${APP_NAME}File" ""
!macroend

!macro customInstallMode
  # set $isForceMachineInstall or $isForceCurrentInstall
  # to enforce one or the other modes.
!macroend

!macro customWelcomePage
  # 欢迎页面默认情况下不会添加到安装程序中。
  ; 注释掉下面一行以禁用欢迎页面
  ; !insertMacro MUI_PAGE_WELCOME
!macroend

!macro customUnWelcomePage
  ; !define MUI_WELCOMEPAGE_TITLE "custom title for uninstaller welcome page"
  ; !define MUI_WELCOMEPAGE_TEXT "custom text for uninstaller welcome page $\r$\n more"
  !insertmacro MUI_UNPAGE_WELCOME
!macroend
