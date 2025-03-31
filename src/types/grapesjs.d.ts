declare module 'grapesjs' {
  export interface Component {
    toJSON(): object;
    setStyle(style: object): void;
    get(property: string): any;
    set(property: string, value: any): void;
    find(selector: string): Component[];
  }
  
  export interface Editor {
    DomComponents: {
      addComponent(component: string | object): Component | Component[];
      clear(): void;
      addType(type: string, definition: object): void;
    };
    Components: {
      toJSON(component: Component | Component[]): object;
    };
    BlockManager: {
      add(id: string, config: object): void;
      get(id: string): any;
      getAll(): any[];
    };
    getHtml(): string;
    getCss(): string;
    getComponents(): object;
    setDevice(device: string): void;
    destroy(): void;
    Commands: {
      add(name: string, command: object): void;
    };
    Canvas: {
      getDocument(): Document;
      getBody(): HTMLElement;
    };
    on(event: string, callback: Function): void;
    trigger(event: string): void;
  }
  
  export type Plugin = (editor: Editor, options?: any) => void;
  
  function init(config: object): Editor;
  
  export default {
    init
  };
} 