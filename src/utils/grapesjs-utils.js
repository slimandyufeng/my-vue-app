/**
 * 将 HTML 字符串转换为 GrapesJS JSON 格式
 * @param editor GrapesJS 编辑器实例
 * @param html HTML 字符串
 * @returns GrapesJS JSON 对象
 */
export const htmlToGrapesJson = (editor, html) => {
  try {
    // 清除现有组件
    editor.DomComponents.clear();
    
    // 创建临时组件
    const component = editor.DomComponents.addComponent(html);
    
    // 确保组件被正确添加到编辑器中
    const parsedComp = Array.isArray(component) ? component : [component];
    
    // 将组件转换为 JSON
    const json = editor.getComponents().toJSON();
    
    // 清理临时组件
    editor.DomComponents.clear();
    console.log(json);
    
    return json;
  } catch (error) {
    console.error('转换 HTML 到 GrapesJS JSON 时出错:', error);
    // 确保清理临时组件
    editor.DomComponents.clear();
    return null;
  }
};

/**
 * 从 GrapesJS JSON 中加载内容到编辑器
 * @param editor GrapesJS 编辑器实例
 * @param json GrapesJS JSON 对象
 */
export const loadGrapesJson = (editor, json) => {
  console.log(editor,json);
    editor.DomComponents.clear();
    editor.DomComponents.addComponent(json);
};

/**
 * 注册基本的原子组件 Block
 * @param editor GrapesJS 编辑器实例
 */
export const registerAtomicBlocks = (editor) => {
  try {
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
  } catch (error) {
    console.error('注册原子组件时出错:', error);
  }
};

/**
 * 注册自定义业务组件 Block
 * @param editor GrapesJS 编辑器实例
 */
export const registerBusinessBlocks = (editor) => {
  try {
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
  } catch (error) {
    console.error('注册业务组件时出错:', error);
  }
};

/**
 * 设置组件类型约束
 * @param editor GrapesJS 编辑器实例
 */
export const setupComponentConstraints = (editor) => {
  // 定义业务组件类型，使其内部组件可编辑但不允许拖入其他组件
  editor.DomComponents.addType('card', {
    isComponent: (el) => el.tagName === 'DIV' && el.classList.contains('card-component'),
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
    isComponent: (el) => el.tagName === 'FORM',
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
export const createTestHtml = (editor) => {
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

/**
 * 创建导入的业务组件
 * @param editor GrapesJS 编辑器实例
 * @param html HTML 字符串
 * @returns 创建的组件实例
 */
export const createImportedComponent = (editor, html) => {
  try {
    // 注册导入的业务组件类型
    editor.DomComponents.addType('imported-business', {
      model: {
        defaults: {
          name: '导入的业务组件',
          droppable: false,
          draggable: true,
          tagName: 'div',
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
        init() {
          const comps = this.components();
          const setupComponent = (component) => {
            component.set({
              draggable: {
                droppableParent: this.cid
              },
              droppable: true,
              selectable: true,
              stylable: true,
              traits: component.get('traits') || []
            });
            
            const childComps = component.components();
            if (childComps && childComps.models) {
              childComps.models.forEach(setupComponent);
            }
          };
          
          comps.on('add', setupComponent);
          if (comps.models) {
            comps.models.forEach(setupComponent);
          }
          this.trigger('change:components');
        }
      },
      view: {
        onRender() {
          const el = this.el;
          if (el) {
            el.style.padding = '10px';
            el.style.border = '2px dashed #28a745';
            el.style.borderRadius = '4px';
            el.style.position = 'relative';
            
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
        }
      }
    });
    
    const component = editor.DomComponents.addComponent({
      type: 'imported-business',
      content: html,
      classes: ['imported-business-component']
    });
    
    const result = Array.isArray(component) ? component[0] : component;
    
    editor.trigger('component:update');
    editor.trigger('component:add');
    editor.trigger('change');
    editor.trigger('canvas:update');
    
    return result;
  } catch (error) {
    console.error('创建导入业务组件时出错:', error);
    throw error;
  }
}; 