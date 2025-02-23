!include nsDialogs.nsh
!include LogicLib.nsh

Name "MyApp Installer"
OutFile "ModernInstaller.exe"
RequestExecutionLevel admin

; 自定义界面资源
!define /GLOBAL COLOR_BKGND 0xFFFFFF
!define /GLOBAL COLOR_PRIMARY 0x169AFA

Var Dialog
Var HeaderIcon
Var SidebarPanel
Var ProgressBar
Var CurrentPage

; 分页定义
Page custom WelcomePage
Page directory
Page instfiles
Page custom FinishPage

; 欢迎页面
Function WelcomePage
  nsDialogs::Create 1018
  Pop $Dialog

  ; 设置主窗口样式
  SetCtlColors $Dialog ${COLOR_BKGND} transparent
  nsDialogs::CreateControl STATIC ${WS_VISIBLE}|${SS_BITMAP} 0 0 0 150u 100% ""
  Pop $SidebarPanel

  ; 加载侧边栏图片
  File "/oname=$PLUGINSDIR\sidebar.bmp" "sidebar_image.bmp"
  ${NSD_SetImage} $SidebarPanel "$PLUGINSDIR\sidebar.bmp" $HeaderIcon

  ; 主内容区域
  nsDialogs::CreateControl STATIC ${WS_VISIBLE}|${SS_LEFT} 0 150u 50u 70% 50u "欢迎安装 MyApp"
  Pop $0
  SetCtlColors $0 ${COLOR_PRIMARY} transparent
  CreateFont $1 "微软雅黑" 18 700
  SendMessage $0 ${WM_SETFONT} $1 0

  ; 进度条样式
  ${NSD_CreateProgressBar} 150u 120u 70% 8u
  Pop $ProgressBar
  SendMessage $ProgressBar ${PBM_SETBARCOLOR} 0 ${COLOR_PRIMARY}

  ; 安装按钮
  ${NSD_CreateButton} 150u 200u 120u 40u "立即安装"
  Pop $1
  SetCtlColors $1 ${COLOR_BKGND} ${COLOR_PRIMARY}
  nsDialogs::SetUserData $1 "next" ; 绑定页面跳转

  nsDialogs::Show
FunctionEnd

; 安装完成页面
Function FinishPage
  nsDialogs::Create 1018
  Pop $Dialog

  ; 完成图标
  File "/oname=$PLUGINSDIR\success.ico" "success_icon.ico"
  ${NSD_CreateIcon} 200u 100u 32u 32u ""
  Pop $0
  SendMessage $0 ${STM_SETIMAGE} ${IMAGE_ICON} "$PLUGINSDIR\success.ico"

  ; 完成文本
  ${NSD_CreateLabel} 150u 150u 70% 50u "安装已完成，感谢您选择 MyApp！"
  Pop $0
  SetCtlColors $0 0x333333 transparent

  nsDialogs::Show
FunctionEnd

; 自定义进度条动画
Section
  GetDlgItem $0 $HWNDPARENT 1
  EnableWindow $0 0 ; 禁用下一步按钮

  ; 模拟安装过程
  StrCpy $1 0
  ${While} $1 < 100
    IntOp $1 $1 + 5
    ${NSD_SetProgress} $ProgressBar $1
    Sleep 200
  ${EndWhile}

  EnableWindow $0 1
SectionEnd

; 界面初始化回调
Function .onGUIInit
  ; 隐藏默认控件
  GetDlgItem $0 $HWNDPARENT 1037
  ShowWindow $0 ${SW_HIDE}
  GetDlgItem $0 $HWNDPARENT 1038
  ShowWindow $0 ${SW_HIDE}

  ; 设置窗口尺寸
  System::Call "user32::SetWindowPos(i $HWNDPARENT, i 0, i 0, i 0, i 600, i 400, i 0x0400)"
FunctionEnd
