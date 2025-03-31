import type { Editor, Component } from 'grapesjs';

/**
 * 将 HTML 字符串转换为 GrapesJS JSON 格式
 * @param editor GrapesJS 编辑器实例
 * @param html HTML 字符串
 * @returns GrapesJS JSON 对象
 */
export const htmlToGrapesJson = (editor: Editor, html: string): object => {
  // 创建临时组件
  const component = editor.DomComponents.addComponent(html);
  
  // 确保组件被正确添加到编辑器中
  const parsedComp = Array.isArray(component) ? component : [component];
  
  // 将组件转换为 JSON
  const json = editor.Components.toJSON(parsedComp);
  
  // 清理临时组件
  editor.DomComponents.clear();
  
  return json;
};

/**
 * 从 GrapesJS JSON 中加载内容到编辑器
 * @param editor GrapesJS 编辑器实例
 * @param json GrapesJS JSON 对象
 */
export const loadGrapesJson = (editor: Editor, json: object): void => {
  editor.DomComponents.clear();
  editor.DomComponents.addComponent(json);
};

/**
 * 注册基本的原子组件 Block
 * @param editor GrapesJS 编辑器实例
 */
export const registerAtomicBlocks = (editor: Editor): void => {
  const blockManager = editor.BlockManager;
  
  // 文本块
  blockManager.add('text', {
    label: '文本',
    category: '原子组件',
    content: {
      type: 'text',
      content: '编辑这个文本...',
      style: { padding: '10px 0', 'min-height': '30px' }
    },
    attributes: { class: 'gjs-block-text fa fa-text-width' }
  });
  
  // 图片块
  blockManager.add('image', {
    label: '图片',
    category: '原子组件',
    content: {
      type: 'image',
      style: { padding: '10px', 'min-height': '100px' },
      attributes: { src: 'https://via.placeholder.com/350x250', alt: '图片' }
    },
    attributes: { class: 'gjs-block-image fa fa-image' }
  });
  
  // 按钮块
  blockManager.add('button', {
    label: '按钮',
    category: '原子组件',
    content: `<a class="button" style="display:inline-block; padding:10px 20px; margin:10px 0; background-color:#4CAF50; color:white; text-align:center; text-decoration:none; border-radius:4px; cursor:pointer;">按钮</a>`,
    attributes: { class: 'gjs-block-button fa fa-square' }
  });
  
  // 容器块
  blockManager.add('container', {
    label: '容器',
    category: '原子组件',
    content: `<div class="container" style="padding:20px; margin:0 auto; max-width:1200px; border:1px dashed #ccc; min-height:100px;"></div>`,
    attributes: { class: 'gjs-block-container fa fa-square-o' }
  });
  
  // 行块（用于布局）
  blockManager.add('row', {
    label: '行',
    category: '原子组件',
    content: `<div class="row" style="display:flex; flex-wrap:wrap; margin:0 -15px; min-height:50px; border:1px dashed #ddd;"></div>`,
    attributes: { class: 'gjs-block-row fa fa-bars' }
  });
  
  // 列块（用于布局）
  blockManager.add('column', {
    label: '列',
    category: '原子组件',
    content: `<div class="column" style="flex:0 0 50%; padding:0 15px; min-height:50px; border:1px dashed #ddd;"></div>`,
    attributes: { class: 'gjs-block-column fa fa-columns' }
  });
};

/**
 * 注册自定义业务组件 Block
 * @param editor GrapesJS 编辑器实例
 */
export const registerBusinessBlocks = (editor: Editor): void => {
  const blockManager = editor.BlockManager;
  
  // 注册卡片组件
  blockManager.add('card', {
    label: '卡片',
    category: '业务组件',
    content: `
      <div class="card-component" style="border:1px solid #ddd; border-radius:8px; padding:15px; box-shadow:0 2px 8px rgba(0,0,0,0.1); max-width:300px; margin:15px;">
        <img src="https://via.placeholder.com/300x200" alt="卡片图片" style="width:100%; height:auto;">
        <h3>卡片标题</h3>
        <p>卡片描述文本，可以编辑此内容...</p>
        <a href="#" style="display:inline-block; padding:8px 16px; background-color:#007BFF; color:white; text-decoration:none; border-radius:4px; margin:10px 0;">了解更多</a>
      </div>
    `,
    attributes: { class: 'gjs-block-card fa fa-id-card' }
  });
  
  // 注册表单组件
  blockManager.add('form', {
    label: '表单',
    category: '业务组件',
    content: `
      <form style="border:1px solid #ddd; border-radius:8px; padding:20px; max-width:500px; margin:15px auto;">
        <h2>联系表单</h2>
        <div style="margin:10px 0;">
          <label style="display:block; margin-bottom:5px;">姓名</label>
          <input type="text" placeholder="请输入您的姓名" style="display:block; width:100%; padding:8px; border:1px solid #ddd; border-radius:4px;">
        </div>
        <div style="margin:10px 0;">
          <label style="display:block; margin-bottom:5px;">邮箱</label>
          <input type="email" placeholder="请输入您的邮箱" style="display:block; width:100%; padding:8px; border:1px solid #ddd; border-radius:4px;">
        </div>
        <div style="margin:10px 0;">
          <label style="display:block; margin-bottom:5px;">留言</label>
          <textarea placeholder="请输入您的留言" style="display:block; width:100%; padding:8px; border:1px solid #ddd; border-radius:4px; min-height:100px;"></textarea>
        </div>
        <button type="submit" style="display:inline-block; padding:10px 20px; background-color:#4CAF50; color:white; border:none; border-radius:4px; cursor:pointer; margin-top:10px;">提交</button>
      </form>
    `,
    attributes: { class: 'gjs-block-form fa fa-wpforms' }
  });
};

/**
 * 设置组件类型约束
 * @param editor GrapesJS 编辑器实例
 */
export const setupComponentConstraints = (editor: Editor): void => {
  // 定义业务组件类型，使其内部组件可编辑但不允许拖入其他组件
  editor.DomComponents.addType('card', {
    isComponent: (el: HTMLElement) => el.tagName === 'DIV' && el.classList.contains('card-component'),
    model: {
      defaults: {
        name: '卡片组件',
        tagName: 'div',
        classes: ['card-component'],
        droppable: false, // 不允许其他组件拖入
        draggable: true,  // 允许被拖动
        // 设置允许编辑哪些属性
        traits: [
          {
            type: 'select',
            label: '卡片风格',
            name: 'cardStyle',
            options: [
              { id: 'default', name: '默认风格' },
              { id: 'dark', name: '深色风格' },
              { id: 'light', name: '浅色风格' },
            ],
            changeProp: true,
          }
        ],
      },
    }
  });
  
  // 同样为表单组件添加类型约束
  editor.DomComponents.addType('form', {
    isComponent: (el: HTMLElement) => el.tagName === 'FORM',
    model: {
      defaults: {
        name: '表单组件',
        tagName: 'form',
        droppable: false,
        draggable: true,
        traits: [
          {
            type: 'text',
            label: '表单标题',
            name: 'formTitle',
            changeProp: true,
          },
          {
            type: 'select',
            label: '提交方法',
            name: 'method',
            options: [
              { id: 'get', name: 'GET' },
              { id: 'post', name: 'POST' },
            ],
          },
          {
            type: 'text',
            label: '提交地址',
            name: 'action',
            placeholder: '输入表单提交的URL',
          }
        ],
      }
    }
  });
};

/**
 * 创建极其简单的测试HTML示例，确保不会引起卡死
 * @param editor GrapesJS 编辑器实例
 * @returns GrapesJS JSON 对象
 */
export const createTestHtml = (editor: Editor): object => {
  try {
    // 使用最简单的HTML结构，避免复杂嵌套和样式
    const simpleHtml = `<div style="padding: 20px; text-align: center;">
      <h2 style="color: #333;">简单示例页面</h2>
      <p>这是一个基础示例，您可以添加更多内容</p>
      <button style="padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 4px; margin-top: 10px;">
        点击我
      </button>
    </div>`;

    // 直接使用Components API创建组件
    // 避免使用DomParser或复杂的DOM操作
    editor.DomComponents.clear();
    const wrapper = editor.DomComponents.addComponent({
      type: 'wrapper',
      tagName: 'div',
      components: [
        {
          tagName: 'div',
          attributes: { style: 'padding: 20px; text-align: center;' },
          components: [
            {
              tagName: 'h2',
              attributes: { style: 'color: #333;' },
              content: '简单示例页面'
            },
            {
              tagName: 'p',
              content: '这是一个基础示例，您可以添加更多内容'
            },
            {
              tagName: 'button',
              attributes: { style: 'padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 4px; margin-top: 10px;' },
              content: '点击我'
            }
          ]
        }
      ]
    });
    
    // 转换为JSON
    const json = editor.Components.toJSON(Array.isArray(wrapper) ? wrapper : [wrapper]);
    
    // 不要忘记清理
    editor.DomComponents.clear();
    
    return json;
  } catch (error) {
    console.error('创建测试HTML时出错:', error);
    // 返回一个绝对最小化的内容作为后备
    try {
      editor.DomComponents.clear();
      const fallbackWrapper = editor.DomComponents.addComponent({
        type: 'wrapper',
        tagName: 'div',
        attributes: { style: 'padding: 20px; text-align: center;' },
        content: '<p>示例内容</p>'
      });
      const json = editor.Components.toJSON(Array.isArray(fallbackWrapper) ? fallbackWrapper : [fallbackWrapper]);
      editor.DomComponents.clear();
      return json;
    } catch (fallbackError) {
      console.error('创建备用内容也失败了:', fallbackError);
      // 如果一切都失败了，返回一个空对象
      return { type: 'wrapper', components: [] };
    }
  }
};

// 添加一个新函数，将导入的HTML转换为业务组件
export const createImportedComponent = (editor: Editor, html: string): any => {
  // 注册导入的业务组件类型
  editor.DomComponents.addType('imported-business', {
    model: {
      defaults: {
        name: '导入的业务组件',
        droppable: false,     // 不允许其他组件被拖入
        draggable: true,      // 允许组件本身被拖动
        tagName: 'div',
        
        // 添加特性管理器配置
        traits: [
          {
            type: 'text',
            name: 'id',
            label: '组件ID'
          },
          {
            type: 'text',
            name: 'title',
            label: '标题'
          },
          {
            type: 'select',
            name: 'mode',
            label: '显示模式',
            options: [
              { id: 'normal', name: '正常' },
              { id: 'expanded', name: '展开' },
              { id: 'compact', name: '紧凑' }
            ]
          }
        ],
        style: {
          padding: '10px',
          border: '1px dashed #28a745',
          borderRadius: '4px',
          position: 'relative'
        }
      },
      
      // 初始化组件
      init() {
        const comps = (this as any).components();
        
        // 创建一个集合监听函数
        const setupComponent = (component: any) => {
          // 设置子组件可编辑但不能拖出
          component.set({
            // 子组件可以在内部被拖动
            draggable: {
              // 只能在当前业务组件内拖动
              droppableParent: (this as any).cid
            },
            // 其他组件可以放入子组件中，实现内部组件嵌套
            droppable: true,
            // 子组件可以被选择并编辑样式和属性
            selectable: true,
            // 启用样式编辑
            stylable: true,
            // 启用特性编辑
            traits: component.get('traits') || []
          });
          
          // 递归处理其子组件
          const childComps = component.components();
          if (childComps && childComps.models) {
            childComps.models.forEach((childComp: any) => {
              setupComponent(childComp);
            });
          }
        };
        
        // 监听添加子组件事件
        comps.on('add', (model: any) => {
          setupComponent(model);
        });
        
        // 初始化现有子组件
        if (comps.models) {
          comps.models.forEach((comp: any) => {
            setupComponent(comp);
          });
        }
        
        // 强制触发渲染更新
        (this as any).trigger('change:components');
      },
      
      // 确保业务组件及其子组件可接收样式变更
      initClasses() {
        const classes = (this as any).get('classes') || [];
        (this as any).set('classes', classes);
        (this as any).listenTo((this as any), 'change:classes', () => {
          (this as any).trigger('change:attributes');
        });
      },
      
      // 确保特性管理器正常工作
      initTraits() {
        const traits = (this as any).get('traits');
        (this as any).set('traits', traits);
      }
    },
    view: {
      // 添加视图事件处理
      onRender() {
        const el = (this as any).el;
        if (el) {
          el.style.padding = '10px';
          el.style.border = '2px dashed #28a745';
          el.style.borderRadius = '4px';
          el.style.position = 'relative';
          
          // 添加标识提示
          const badge = document.createElement('div');
          badge.textContent = '业务组件';
          badge.style.position = 'absolute';
          badge.style.top = '0';
          badge.style.right = '0';
          badge.style.backgroundColor = '#28a745';
          badge.style.color = 'white';
          badge.style.padding = '2px 8px';
          badge.style.fontSize = '12px';
          badge.style.borderRadius = '0 0 0 4px';
          badge.style.zIndex = '1';
          el.appendChild(badge);
        }
      },
      
      // 确保子组件可以在内部自由移动
      onDragStart() {
        // 标记当前拖动的是业务组件
        const model = (this as any).model;
        model.set('dragging', true);
      },
      
      onDragEnd() {
        // 标记拖动结束
        const model = (this as any).model;
        model.set('dragging', false);
      }
    }
  });
  
  try {
    // 创建业务组件
    const component = editor.DomComponents.addComponent({
      type: 'imported-business',
      content: html,
      // 使用一个标识类，便于识别和样式设置
      classes: ['imported-business-component']
    });
    
    const result = Array.isArray(component) ? component[0] : component;
    
    // 强制重新渲染，确保组件正确显示
    editor.trigger('component:update');
    
    // 确保层级面板更新
    editor.trigger('component:add');
    
    // 触发全局变更事件
    editor.trigger('change');
    editor.trigger('canvas:update');
    
    return result;
  } catch (error) {
    console.error('创建导入业务组件时出错:', error);
    throw error;
  }
}; 