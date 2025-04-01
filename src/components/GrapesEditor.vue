<template>
  <div class="grapesjs-container">
    <div class="editor-header">
      <div class="logo">GrapesJS 编辑器</div>
      <div class="main-actions">
        <button @click="undoAction" class="action-btn"><i class="fa fa-undo"></i> 撤销</button>
        <button @click="redoAction" class="action-btn"><i class="fa fa-redo"></i> 恢复</button>
        <button @click="importHtml" class="action-btn"><i class="fa fa-download"></i> 导入HTML</button>
        <button @click="exportJson" class="action-btn"><i class="fa fa-code"></i> 导出JSON</button>
        <button @click="clearCanvas" class="action-btn danger"><i class="fa fa-trash"></i> 清空画布</button>
        <button @click="previewHtml" class="action-btn primary"><i class="fa fa-eye"></i> 预览</button>
      </div>
      <div class="device-controls">
        <button @click="setDevice('桌面端')" :class="{ active: currentDevice === '桌面端' }">
          <i class="fa fa-desktop"></i>
        </button>
        <button @click="setDevice('平板端')" :class="{ active: currentDevice === '平板端' }">
          <i class="fa fa-tablet"></i>
        </button>
        <button @click="setDevice('移动端')" :class="{ active: currentDevice === '移动端' }">
          <i class="fa fa-mobile"></i>
        </button>
      </div>
    </div>

    <div class="editor-main">
      <!-- 左侧面板 -->
      <div class="left-panel">
        <div class="panel-section blocks-panel">
          <div class="panel-header">
            <h3>组件库</h3>
          </div>
          <div id="blocks" class="panel-content"></div>
        </div>
      </div>

      <!-- 中间画布 -->
      <div class="canvas-container">
        <div id="gjs"></div>
      </div>

      <!-- 右侧面板 -->
      <div class="right-panel">
        <div class="panel-tabs">
          <button class="tab-btn" :class="{ active: activeTab === 'layers' }" @click="switchTab('layers')">
            <i class="fa fa-layer-group"></i> 层级
          </button>
          <button class="tab-btn" :class="{ active: activeTab === 'styles' }" @click="switchTab('styles')">
            <i class="fa fa-paint-brush"></i> 样式
          </button>
          <button class="tab-btn" :class="{ active: activeTab === 'traits' }" @click="switchTab('traits')">
            <i class="fa fa-sliders"></i> 属性
          </button>
        </div>

        <div class="panel-content">
          <div id="layers-manager" v-show="activeTab === 'layers'"></div>
          <div id="styles-manager" v-show="activeTab === 'styles'"></div>
          <div id="traits-manager" v-show="activeTab === 'traits'"></div>
        </div>
      </div>
    </div>

    <!-- HTML 导入弹窗 -->
    <div v-if="showImportDialog" class="dialog">
      <div class="dialog-content">
        <div class="dialog-header">
          <h3>导入 HTML</h3>
          <button class="close-btn" @click="cancelImport"><i class="fa fa-times"></i></button>
        </div>
        <textarea v-model="importHtmlText" placeholder="请粘贴 HTML 代码..." rows="10"></textarea>
        <div class="dialog-buttons">
          <button @click="confirmImport" class="primary-btn">导入</button>
          <button @click="cancelImport">取消</button>
        </div>
      </div>
    </div>

    <!-- 预览弹窗 -->
    <div v-if="showPreviewDialog" class="dialog">
      <div class="dialog-content preview-content">
        <div class="dialog-header">
          <h3>{{ previewType === 'html' ? 'HTML 预览' : 'JSON 预览' }}</h3>

          <!-- HTML 预览时添加代码/预览切换按钮 -->
          <div v-if="previewType === 'html'" class="preview-mode-switch">
            <button :class="{ active: previewMode === 'visual' }" @click="previewMode = 'visual'">
              <i class="fa fa-eye"></i> 可视化
            </button>
            <button :class="{ active: previewMode === 'code' }" @click="previewMode = 'code'">
              <i class="fa fa-code"></i> 代码
            </button>
          </div>

          <button class="close-btn" @click="closePreview"><i class="fa fa-times"></i></button>
        </div>

        <!-- HTML 预览 -->
        <div v-if="previewType === 'html'" class="preview-container">
          <!-- 可视化预览 -->
          <div v-show="previewMode === 'visual'" class="preview-frame-container">
            <iframe ref="previewFrame" class="preview-frame"></iframe>
          </div>

          <!-- 代码预览 -->
          <pre v-show="previewMode === 'code'" class="preview-code"><code>{{ previewContent }}</code></pre>
        </div>

        <!-- JSON 预览 -->
        <div v-else class="preview-json-container">
          <pre class="preview-json" v-html="previewContent"></pre>
        </div>

        <div class="dialog-buttons">
          <button @click="exportPreview" class="primary-btn"><i class="fa fa-download"></i> 导出</button>
          <button @click="closePreview">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, onMounted, onBeforeUnmount, ref } from 'vue';
import grapesjs from 'grapesjs';
import {
  htmlToGrapesJson,
  loadGrapesJson,
  registerAtomicBlocks,
  registerBusinessBlocks,
  setupComponentConstraints,
  createImportedComponent
} from '../utils/grapesjs-utils.js';

export default defineComponent({
  name: 'GrapesEditor',
  setup() {
    const editor = ref(null);
    const currentDevice = ref('桌面端');
    const showImportDialog = ref(false);
    const importHtmlText = ref('');
    const showPreviewDialog = ref(false);
    const previewType = ref('html');
    const previewContent = ref('');
    const previewFrame = ref(null);
    const activeTab = ref('layers');
    const previewMode = ref('visual');

    onMounted(() => {
      // 初始化 GrapesJS 编辑器
      editor.value = grapesjs.init({
        container: '#gjs',
        height: '100%',
        width: '100%',
        // 避免加载默认CSS
        protectedCss: '',
        // 不从元素加载组件
        fromElement: false,
        // 允许HTML内容编辑
        allowScripts: 1,
        // 禁用自动渲染，我们手动控制渲染
        autorender: true,
        // 存储管理器配置
        storageManager: {
          type: 'local',
          autosave: true,
          autoload: true,
          stepsBeforeSave: 1,
          id: 'gjs-',
        },
        // Block 管理器配置
        blockManager: {
          appendTo: '#blocks',
          blocks: [],
        },
        // 设备管理器配置 - 用于响应式设计
        deviceManager: {
          devices: [
            {
              name: '桌面端',
              width: '',
            },
            {
              name: '平板端',
              width: '768px',
              widthMedia: '768px',
            },
            {
              name: '移动端',
              width: '375px',
              widthMedia: '375px',
            },
          ],
        },
        // 样式管理器配置 - 增强版
        styleManager: {
          appendTo: '#styles-manager',
          sectors: [
            {
              name: '尺寸',
              open: true,
              properties: [
                {
                  type: 'number',
                  name: 'width',
                  property: 'width',
                  units: ['px', '%', 'vw', 'auto'],
                  defaults: 'auto',
                },
                {
                  type: 'number',
                  name: 'height',
                  property: 'height',
                  units: ['px', '%', 'vh', 'auto'],
                  defaults: 'auto',
                },
                {
                  type: 'number',
                  name: 'min-width',
                  property: 'min-width',
                  units: ['px', '%', 'vw'],
                },
                {
                  type: 'number',
                  name: 'max-width',
                  property: 'max-width',
                  units: ['px', '%', 'vw'],
                },
                {
                  type: 'number',
                  name: 'min-height',
                  property: 'min-height',
                  units: ['px', '%', 'vh'],
                },
                {
                  type: 'number',
                  name: 'max-height',
                  property: 'max-height',
                  units: ['px', '%', 'vh'],
                },
              ],
            },
            {
              name: '边距',
              open: false,
              properties: [
                {
                  property: 'margin',
                  type: 'composite',
                  properties: [
                    { property: 'margin-top', units: ['px', '%', 'vh'] },
                    { property: 'margin-right', units: ['px', '%', 'vw'] },
                    { property: 'margin-bottom', units: ['px', '%', 'vh'] },
                    { property: 'margin-left', units: ['px', '%', 'vw'] },
                  ],
                },
                {
                  property: 'padding',
                  type: 'composite',
                  properties: [
                    { property: 'padding-top', units: ['px', '%', 'vh'] },
                    { property: 'padding-right', units: ['px', '%', 'vw'] },
                    { property: 'padding-bottom', units: ['px', '%', 'vh'] },
                    { property: 'padding-left', units: ['px', '%', 'vw'] },
                  ],
                },
              ],
            },
            {
              name: '排版',
              open: false,
              properties: [
                {
                  type: 'select',
                  property: 'font-family',
                  defaults: 'Arial, Helvetica, sans-serif',
                  options: [
                    { value: 'Arial, Helvetica, sans-serif', name: 'Arial' },
                    { value: 'Georgia, serif', name: 'Georgia' },
                    { value: '"Times New Roman", Times, serif', name: '宋体' },
                    { value: '"Microsoft YaHei", "微软雅黑", sans-serif', name: '微软雅黑' },
                    { value: '"PingFang SC", "苹方", sans-serif', name: '苹方' },
                    { value: 'monospace', name: '等宽字体' },
                  ],
                },
                {
                  type: 'number',
                  property: 'font-size',
                  units: ['px', 'em', 'rem', '%'],
                  defaults: '16px',
                },
                {
                  type: 'select',
                  property: 'font-weight',
                  defaults: '400',
                  options: [
                    { value: '100', name: '极细' },
                    { value: '300', name: '细体' },
                    { value: '400', name: '常规' },
                    { value: '500', name: '中等' },
                    { value: '700', name: '粗体' },
                    { value: '900', name: '极粗' },
                  ],
                },
                {
                  type: 'select',
                  property: 'text-align',
                  defaults: 'left',
                  options: [
                    { value: 'left', name: '左对齐' },
                    { value: 'center', name: '居中' },
                    { value: 'right', name: '右对齐' },
                    { value: 'justify', name: '两端对齐' },
                  ],
                },
                {
                  type: 'number',
                  property: 'line-height',
                  defaults: '1.5',
                },
                {
                  type: 'color',
                  property: 'color',
                  defaults: '#333333',
                },
                {
                  type: 'select',
                  property: 'text-decoration',
                  defaults: 'none',
                  options: [
                    { value: 'none', name: '无' },
                    { value: 'underline', name: '下划线' },
                    { value: 'line-through', name: '删除线' },
                    { value: 'overline', name: '上划线' },
                  ],
                },
              ],
            },
            {
              name: '背景',
              open: false,
              properties: [
                {
                  type: 'color',
                  property: 'background-color',
                  defaults: 'transparent',
                },
                {
                  type: 'file',
                  property: 'background-image',
                  defaults: 'none',
                },
                {
                  type: 'select',
                  property: 'background-size',
                  defaults: 'auto',
                  options: [
                    { value: 'auto', name: '自动' },
                    { value: 'cover', name: '覆盖' },
                    { value: 'contain', name: '包含' },
                  ],
                },
                {
                  type: 'select',
                  property: 'background-repeat',
                  defaults: 'repeat',
                  options: [
                    { value: 'repeat', name: '重复' },
                    { value: 'no-repeat', name: '不重复' },
                    { value: 'repeat-x', name: '水平重复' },
                    { value: 'repeat-y', name: '垂直重复' },
                  ],
                },
                {
                  type: 'select',
                  property: 'background-position',
                  defaults: 'left top',
                  options: [
                    { value: 'left top', name: '左上' },
                    { value: 'center top', name: '中上' },
                    { value: 'right top', name: '右上' },
                    { value: 'left center', name: '左中' },
                    { value: 'center center', name: '居中' },
                    { value: 'right center', name: '右中' },
                    { value: 'left bottom', name: '左下' },
                    { value: 'center bottom', name: '中下' },
                    { value: 'right bottom', name: '右下' },
                  ],
                },
              ],
            },
            {
              name: '边框',
              open: false,
              properties: [
                {
                  type: 'composite',
                  property: 'border',
                  properties: [
                    {
                      type: 'number',
                      units: ['px', 'em'],
                      property: 'border-width',
                      defaults: '0',
                    },
                    {
                      type: 'select',
                      property: 'border-style',
                      defaults: 'solid',
                      options: [
                        { value: 'none', name: '无' },
                        { value: 'solid', name: '实线' },
                        { value: 'dashed', name: '虚线' },
                        { value: 'dotted', name: '点线' },
                        { value: 'double', name: '双线' },
                      ],
                    },
                    {
                      type: 'color',
                      property: 'border-color',
                      defaults: '#000000',
                    },
                  ],
                },
                {
                  type: 'number',
                  property: 'border-radius',
                  units: ['px', '%'],
                  defaults: '0',
                },
              ],
            },
            {
              name: '定位',
              open: false,
              properties: [
                {
                  type: 'select',
                  property: 'position',
                  defaults: 'static',
                  options: [
                    { value: 'static', name: '静态' },
                    { value: 'relative', name: '相对定位' },
                    { value: 'absolute', name: '绝对定位' },
                    { value: 'fixed', name: '固定定位' },
                    { value: 'sticky', name: '粘性定位' },
                  ],
                },
                { type: 'number', property: 'top', units: ['px', '%'] },
                { type: 'number', property: 'right', units: ['px', '%'] },
                { type: 'number', property: 'bottom', units: ['px', '%'] },
                { type: 'number', property: 'left', units: ['px', '%'] },
                { type: 'number', property: 'z-index' },
              ],
            },
            {
              name: '弹性布局',
              open: false,
              properties: [
                {
                  type: 'select',
                  property: 'display',
                  defaults: 'block',
                  options: [
                    { value: 'block', name: '块级' },
                    { value: 'inline', name: '内联' },
                    { value: 'inline-block', name: '行内块' },
                    { value: 'flex', name: '弹性布局' },
                    { value: 'none', name: '隐藏' },
                  ],
                },
                {
                  type: 'select',
                  property: 'flex-direction',
                  defaults: 'row',
                  options: [
                    { value: 'row', name: '水平(row)' },
                    { value: 'column', name: '垂直(column)' },
                    { value: 'row-reverse', name: '水平反转' },
                    { value: 'column-reverse', name: '垂直反转' },
                  ],
                },
                {
                  type: 'select',
                  property: 'justify-content',
                  defaults: 'flex-start',
                  options: [
                    { value: 'flex-start', name: '起始对齐' },
                    { value: 'flex-end', name: '末尾对齐' },
                    { value: 'center', name: '居中' },
                    { value: 'space-between', name: '两端对齐' },
                    { value: 'space-around', name: '分散对齐' },
                  ],
                },
                {
                  type: 'select',
                  property: 'align-items',
                  defaults: 'stretch',
                  options: [
                    { value: 'flex-start', name: '顶部对齐' },
                    { value: 'flex-end', name: '底部对齐' },
                    { value: 'center', name: '居中' },
                    { value: 'stretch', name: '拉伸填充' },
                    { value: 'baseline', name: '基线对齐' },
                  ],
                },
                {
                  type: 'number',
                  property: 'flex-grow',
                  defaults: '0',
                },
                {
                  type: 'number',
                  property: 'flex-shrink',
                  defaults: '1',
                },
              ],
            },
            {
              name: '效果',
              open: false,
              properties: [
                {
                  type: 'slider',
                  property: 'opacity',
                  defaults: '1',
                  min: 0,
                  max: 1,
                  step: 0.1,
                },
                {
                  type: 'stack',
                  property: 'box-shadow',
                  properties: [
                    { type: 'number', units: ['px'], property: 'h-shadow', defaults: '0' },
                    { type: 'number', units: ['px'], property: 'v-shadow', defaults: '0' },
                    { type: 'number', units: ['px'], property: 'blur', defaults: '0' },
                    { type: 'number', units: ['px'], property: 'spread', defaults: '0' },
                    { type: 'color', property: 'shadow-color', defaults: '#000000' },
                    {
                      type: 'select', property: 'shadow-type', defaults: '', options: [
                        { value: '', name: '外部阴影' },
                        { value: 'inset', name: '内部阴影' },
                      ]
                    },
                  ],
                },
                {
                  type: 'select',
                  property: 'transition',
                  defaults: 'none',
                  options: [
                    { value: 'none', name: '无' },
                    { value: 'all 0.3s ease', name: '全部属性' },
                    { value: 'opacity 0.3s ease', name: '透明度' },
                    { value: 'transform 0.3s ease', name: '变形' },
                  ],
                },
              ],
            },
          ],
        },
        // 图层管理器
        layerManager: {
          appendTo: '#layers-manager',
        },
        // 特性管理器
        traitManager: {
          appendTo: '#traits-manager',
        },
        // 画布配置
        canvas: {
          styles: [
            'https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css',
            'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css'
          ],
          scripts: [],
          frameStyle: `
            body { 
              margin: 0;
              padding: 10px;
              box-sizing: border-box;
              overflow: auto;
              background-color: #ffffff;
              color: #333333;
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }
          `
        },
        // 初始内容
        components: `
          <div style="
            padding: 30px; 
            text-align: center; 
            color: #333; 
            background-color: #f8f9fa; 
            border: 2px dashed #ccc; 
            border-radius: 8px; 
            margin: 20px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          ">
            <h2 style="color: #444; margin-bottom: 15px;">拖拽左侧组件至此区域</h2>
            <p style="color: #666;">从左侧面板中选择组件，拖放到这里开始构建页面</p>
          </div>
        `,
        // 修改面板配置
        panels: { defaults: [] },
      });

      // 在编辑器初始化完成后，添加必要的事件监听和设置
      if (editor.value) {
        // 1. 监听组件选择、添加、变更等核心事件
        // 这些事件对应不同用户操作，需要确保UI面板正确更新

        // 组件被选择时
        editor.value.on('component:selected', (component) => {
          console.log('组件被选择:', component);

          // 重要：切换到样式面板，这样用户可以立即编辑样式
          activeTab.value = 'styles';
        });

        // 组件被添加时（通过拖拽或其他方式）
        editor.value.on('component:add', () => {
          console.log('组件被添加');
        });

        // 组件更新时
        editor.value.on('component:update', () => {
          console.log('组件更新');
        });

        // 特别监听block拖拽结束事件
        editor.value.on('block:drag:stop', () => {
          console.log('拖拽组件完成');
          // 强制进行组件选择
          const lastSelected = editor.value.getSelected();
          if (lastSelected) {
            // 重选当前组件以触发面板更新
            editor.value.select(lastSelected);
          }
        });

        // 设备切换时
        editor.value.on('device:update', () => {
          console.log('设备切换');
          const device = editor.value.getDevice();
          currentDevice.value = device ? device.name : '桌面端';
        });

        // 注册原子组件 Block
        registerAtomicBlocks(editor.value);

        // 注册业务组件 Block
        registerBusinessBlocks(editor.value);

        // 设置组件约束
        setupComponentConstraints(editor.value);

        // 添加设备切换命令
        editor.value.Commands.add('set-device-desktop', {
          run: (editor) => editor.setDevice('桌面端'),
        });
        editor.value.Commands.add('set-device-tablet', {
          run: (editor) => editor.setDevice('平板端'),
        });
        editor.value.Commands.add('set-device-mobile', {
          run: (editor) => editor.setDevice('移动端'),
        });

      }
    });



    // 导入 HTML
    const importHtml = () => {
      showImportDialog.value = true;
    };

    // 确认导入
    const confirmImport = () => {
      if (!editor.value || !importHtmlText.value) {
        showImportDialog.value = false;
        importHtmlText.value = '';
        return;
      }

      // 隐藏导入对话框
      showImportDialog.value = false;
      let html = importHtmlText.value.trim();
     // 清除已有内容
     editor.value.DomComponents.clear();
      // 解析 HTML 内容并加载到编辑器中
      const json = htmlToGrapesJson(editor.value,html);
      if (json) {
        loadGrapesJson(editor.value, json);
      } else {
        console.error('无法解析 HTML 内容');
      }

      // 清空输入框
      importHtmlText.value = '';

    };

    // 取消导入
    const cancelImport = () => {
      showImportDialog.value = false;
      importHtmlText.value = '';
    };

    // 预览 HTML
    const previewHtml = () => {
      if (editor.value) {
        previewType.value = 'html';
        showPreviewDialog.value = true;
        previewMode.value = 'visual'; // 默认显示可视化预览

        // 获取 HTML 和 CSS
        const html = editor.value.getHtml();
        const css = editor.value.getCss();

        const content = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HTML 预览</title>
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">
  <style>
    body { margin: 0; padding: 10px; }
    ${css}
  </style>
</head>
<body>
  ${html}
</body>
</html>`;

        previewContent.value = content;

        // 确保 iframe 立即加载预览内容
        setTimeout(() => {
          if (previewFrame.value) {
            const iframeDoc = previewFrame.value.contentDocument ||
              (previewFrame.value.contentWindow && previewFrame.value.contentWindow.document);

            if (iframeDoc) {
              iframeDoc.open();
              iframeDoc.write(content);
              iframeDoc.close();
            }
          }
        }, 100);
      }
    };

    // 导出 JSON
    const exportJson = () => {
      if (editor.value) {
        previewType.value = 'json';
        showPreviewDialog.value = true;

        const json = editor.value.getComponents();
        const jsonString = JSON.stringify(json, null, 4); // 使用4个空格缩进

        // 添加改进的语法高亮
        const highlighted = jsonString
          .replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:') // 键名
          .replace(/: "([^"]+)"/g, ': <span class="json-string">"$1"</span>') // 字符串值
          .replace(/: ([0-9]+)/g, ': <span class="json-number">$1</span>') // 数字
          .replace(/: (true|false)/g, ': <span class="json-boolean">$1</span>') // 布尔值
          .replace(/: null/g, ': <span class="json-null">null</span>'); // null

        previewContent.value = highlighted;
      }
    };

    // 导出预览内容
    const exportPreview = () => {
      const element = document.createElement('a');
      const fileType = previewType.value === 'html' ? 'text/html' : 'application/json';
      const fileName = previewType.value === 'html' ? 'export.html' : 'export.json';

      const blob = new Blob([previewContent.value], { type: fileType });
      element.href = URL.createObjectURL(blob);
      element.download = fileName;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    };

    // 修改清空画布功能
    const clearCanvas = () => {

      // 方法2：重置画布内容（更彻底）
      editor.value.setComponents(''); // 设为空内容

      // 可选：同时清空撤销历史
      editor.value.UndoManager.clear();
    };

    // 增加撤销功能
    const undoAction = () => {
      if (editor.value) {
        editor.value.Commands.run('core:undo');
      }
    };

    // 增加恢复功能
    const redoAction = () => {
      if (editor.value) {
        editor.value.Commands.run('core:redo');
      }
    };

    // 恢复关闭预览功能（被误删除了）
    const closePreview = () => {
      showPreviewDialog.value = false;
    };

    // 组件销毁前清理资源
    onBeforeUnmount(() => {
      if (editor.value) {
        editor.value.destroy();
        editor.value = null;
      }
    });

    return {
      currentDevice,
      showImportDialog,
      importHtmlText,
      showPreviewDialog,
      previewType,
      previewContent,
      previewFrame,
      activeTab,
      previewMode,
      importHtml,
      confirmImport,
      cancelImport,
      previewHtml,
      exportJson,
      closePreview,
      exportPreview,
      clearCanvas,
      undoAction,
      redoAction,
    };
  },
});
</script>

<style>
@import 'grapesjs/dist/css/grapes.min.css';
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css');

/* 全局样式 */
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-weight: 500;
}

/* 主容器 */
.grapesjs-container {
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #f8f9fa;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

/* 顶部导航 */
.editor-header {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  background-color: #222222;
  color: #ffffff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.logo {
  font-size: 1.25rem;
  font-weight: bold;
  margin-right: 30px;
  text-shadow: 0px 0px 1px rgba(255, 255, 255, 0.5);
}

.main-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  background-color: #444444;
  color: #ffffff;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 5px;
}

.action-btn:hover {
  background-color: #5a6268;
}

.action-btn.primary {
  background-color: #28a745;
}

.action-btn.primary:hover {
  background-color: #218838;
}

.action-btn.danger {
  background-color: #dc3545;
}

.action-btn.danger:hover {
  background-color: #c82333;
}

.device-controls {
  margin-left: auto;
  display: flex;
  gap: 5px;
}

.device-controls button {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 4px;
  background-color: #444444;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.device-controls button:hover {
  background-color: #5a6268;
}

.device-controls button.active {
  background-color: #28a745;
  color: white;
}

/* 主编辑区域 */
.editor-main {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
}

/* 左侧面板 */
.left-panel {
  width: 280px;
  min-width: 280px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e9ecef;
  background-color: #f8f9fa;
  z-index: 10;
  height: 100%;
  overflow-y: auto;
}

.panel-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 12px 15px;
  background-color: #f1f3f5;
  border-bottom: 1px solid #e9ecef;
}

.panel-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #222222;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
}

/* 中间画布 */
.canvas-container {
  flex: 1;
  position: relative;
  background-color: #fff;
  display: flex;
  overflow: hidden;
}

#gjs {
  flex: 1;
  height: 100%;
  border: none;
  width: 100%;
  position: relative;
}

/* 右侧面板 */
.right-panel {
  width: 280px;
  min-width: 280px;
  display: flex;
  flex-direction: column;
  border-left: 1px solid #e9ecef;
  background-color: #f8f9fa;
  z-index: 10;
  height: 100%;
  overflow-y: auto;
}

.panel-tabs {
  display: flex;
  border-bottom: 1px solid #e9ecef;
  background-color: #f1f3f5;
}

.tab-btn {
  flex: 1;
  padding: 12px 15px;
  border: none;
  background-color: transparent;
  color: #222222;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.tab-btn:hover {
  background-color: #e9ecef;
}

.tab-btn.active {
  background-color: #fff;
  color: #343a40;
  border-bottom: 2px solid #28a745;
}

.right-panel .panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

#layers-manager,
#styles-manager,
#traits-manager {
  height: 100%;
  width: 100%;
  overflow-y: auto;
}

/* 弹窗样式 */
.dialog {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.dialog-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 700px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.dialog-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #343a40;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #6c757d;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-btn:hover {
  background-color: #e9ecef;
  color: #343a40;
}

.preview-content {
  max-width: 90%;
  width: 90%;
  height: 90vh;
  max-height: 90vh;
}

.preview-container {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
}

.preview-frame-container {
  width: 100%;
  height: 100%;
  min-height: 60vh;
  overflow: hidden;
  background-color: white;
  display: flex;
}

.preview-frame {
  width: 100%;
  height: 100%;
  min-height: 60vh;
  border: none;
}

.preview-code {
  flex: 1;
  overflow: auto;
  background-color: #1e1e1e;
  color: #d4d4d4;
  padding: 20px;
  margin: 0;
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 0.9rem;
  line-height: 1.6;
  white-space: pre-wrap;
  border-radius: 0;
  height: 100%;
  min-height: 60vh;
}

.preview-json-container {
  flex: 1;
  overflow: auto;
  background-color: #1e1e1e;
  display: flex;
  min-height: 60vh;
}

.preview-json {
  flex: 1;
  overflow: auto;
  background-color: #1e1e1e;
  color: #d4d4d4;
  padding: 30px;
  margin: 0;
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 0.9rem;
  line-height: 1.6;
  white-space: pre-wrap;
  height: 100%;
}

/* JSON 语法高亮效果改进 */
.json-key {
  color: #9cdcfe;
  margin-right: 4px;
}

.json-string {
  color: #ce9178;
}

.json-number {
  color: #b5cea8;
}

.json-boolean {
  color: #569cd6;
}

.json-null {
  color: #569cd6;
}

/* 预览模式切换按钮样式 */
.preview-mode-switch {
  display: flex;
  margin-right: 20px;
}

.preview-mode-switch button {
  padding: 5px 10px;
  background-color: #f1f1f1;
  border: 1px solid #ddd;
  color: #333;
  cursor: pointer;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 5px;
}

.preview-mode-switch button:first-child {
  border-radius: 4px 0 0 4px;
}

.preview-mode-switch button:last-child {
  border-radius: 0 4px 4px 0;
}

.preview-mode-switch button.active {
  background-color: #28a745;
  color: white;
  border-color: #28a745;
}

/* GrapesJS 自定义样式 */
.gjs-cv-canvas {
  position: relative !important;
  top: 0 !important;
  width: 100% !important;
  height: 100% !important;
  overflow: auto !important;
  background-color: #e4e4e4 !important;
}

.gjs-frame {
  position: absolute !important;
  width: 100% !important;
  height: 100% !important;
  top: 0 !important;
  left: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
  border: none !important;
  background-color: white !important;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2) !important;
}

.gjs-pn-panel {
  position: relative !important;
  padding: 0 !important;
  box-shadow: none !important;
  min-height: 100% !important;
}

.gjs-editor {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
}

.gjs-one-bg {
  background-color: #ffffff !important;
}

.gjs-two-color {
  color: #222222 !important;
}

.gjs-three-bg {
  background-color: #28a745 !important;
  color: white !important;
}

.gjs-four-color,
.gjs-four-color-h:hover {
  color: #28a745 !important;
}

.gjs-block {
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 10px;
  margin: 10px 0;
  background-color: white;
  transition: all 0.2s;
  cursor: grab;
  text-align: center;
}

.gjs-block:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #adb5bd;
}

.gjs-block-label {
  margin-top: 8px;
  font-size: 13px;
  color: #333 !important;
  font-weight: 500 !important;
}

.gjs-block svg {
  fill: #333 !important;
}

.gjs-block-categories {
  height: 100%;
  overflow-y: auto;
  padding: 0 10px;
}

.gjs-blocks-c {
  justify-content: flex-start !important;
  padding: 0 5px !important;
}

.gjs-layer {
  padding: 5px 0;
}

.gjs-layer-title {
  padding: 10px !important;
}

.gjs-layer.gjs-selected .gjs-layer-title {
  background-color: #28a745 !important;
}

.gjs-layer-name {
  padding: 5px !important;
  color: #222 !important;
}

.gjs-category-title {
  font-weight: 600;
  padding: 15px 0 8px;
  color: #222;
  font-size: 14px;
}

.gjs-sm-sector {
  margin-bottom: 10px;
  background-color: white;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  overflow: hidden;
}

.gjs-sm-sector-title {
  padding: 10px 15px !important;
  font-weight: 600 !important;
  border-bottom: 1px solid #e9ecef;
  background-color: #f8f9fa;
  font-size: 14px !important;
  color: #222 !important;
}

.gjs-sm-properties {
  padding: 10px !important;
}

.gjs-sm-label {
  font-size: 12px !important;
  color: #222 !important;
  font-weight: 500 !important;
}

.gjs-sm-field input,
.gjs-sm-field select,
.gjs-clm-select {
  border: 1px solid #ced4da !important;
  border-radius: 4px !important;
  padding: 5px 8px !important;
  color: #222 !important;
  background-color: #fff !important;
}

.gjs-clm-tags {
  border: 1px solid #ced4da !important;
  border-radius: 4px !important;
  padding: 5px 8px !important;
  color: #222 !important;
  background-color: #fff !important;
}

.gjs-field-arrow-u {
  border-bottom-color: #222 !important;
}

.gjs-field-arrow-d {
  border-top-color: #222 !important;
}

.gjs-trt-trait {
  padding: 10px;
  border-bottom: 1px solid #e9ecef;
}

.gjs-label-wrp {
  font-size: 13px;
  margin-bottom: 5px;
  color: #222 !important;
  font-weight: 500 !important;
}

.gjs-field {
  border: 1px solid #ced4da;
  border-radius: 4px;
  padding: 5px 8px;
  color: #222 !important;
  background-color: #fff !important;
}

.gjs-d-s-arrow {
  border-top-color: #222 !important;
}

.gjs-selected {
  outline: 2px solid #28a745 !important;
  outline-offset: 2px;
}

.gjs-ghost {
  background-color: rgba(40, 167, 69, 0.3) !important;
  border: 2px dashed #28a745 !important;
}

.gjs-layer-children {
  margin-left: 15px !important;
}

.gjs-layer-vis {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 3px !important;
  color: #222 !important;
}

.gjs-layer-caret {
  padding: 5px !important;
  color: #222 !important;
}

.gjs-layers {
  padding: 0 !important;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}

.gjs-field-colorp {
  border-radius: 4px !important;
  overflow: hidden !important;
}

.gjs-field-color-picker {
  width: 24px !important;
  height: 24px !important;
}

.gjs-radio-item,
.gjs-field-integer input,
.gjs-field-select select {
  border: 1px solid #ced4da !important;
  border-radius: 4px !important;
  padding: 5px 8px !important;
}

.right-panel {
  z-index: 2;
}

.gjs-frame-wrapper {
  padding: 10px !important;
}

.dialog-buttons {
  display: flex;
  justify-content: flex-end;
  padding: 15px 20px;
  background-color: #f8f9fa;
  border-top: 1px solid #e9ecef;
  gap: 10px;
}

.dialog-buttons button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.dialog-buttons .primary-btn {
  background-color: #28a745;
  color: white;
}

.dialog-buttons .primary-btn:hover {
  background-color: #218838;
}

.dialog-buttons button:last-child {
  background-color: #e9ecef;
  color: #495057;
}

.dialog-buttons button:last-child:hover {
  background-color: #dee2e6;
}

.dialog-content textarea {
  width: 100%;
  min-height: 200px;
  padding: 15px;
  border: none;
  resize: vertical;
  font-family: 'Consolas', monospace;
  font-size: 0.9rem;
  outline: none;
}
</style>