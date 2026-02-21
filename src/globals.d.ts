/**
 * FoundryVTT V13 global type declarations.
 * Replaces the legacy foundry-pc-types package.
 * These declarations allow TypeScript to compile without errors
 * while still providing basic type safety for the Foundry API.
 */

// Core game object
declare const game: {
  risus?: any;
  settings: {
    register(namespace: string, key: string, data: object): void;
    get(namespace: string, key: string): any;
  };
  i18n: {
    localize(key: string): string;
  };
};

// Foundry utility namespace
declare namespace foundry {
  namespace utils {
    function mergeObject(original: object, other: object, options?: object): object;
  }
  namespace abstract {
    class Document {}
  }
}

// CONFIG global
declare const CONFIG: {
  Actor: { documentClass: any };
  Item: { documentClass: any };
  [key: string]: any;
};

// Hooks system
declare const Hooks: {
  once(event: string, fn: (...args: any[]) => any): void;
  on(event: string, fn: (...args: any[]) => any): void;
  off(event: string, id: number): void;
  call(event: string, ...args: any[]): boolean;
};

// Sheet registries
declare const Actors: {
  registerSheet(scope: string, sheetClass: any, options?: object): void;
  unregisterSheet(scope: string, sheetClass: any, options?: object): void;
};
declare const Items: {
  registerSheet(scope: string, sheetClass: any, options?: object): void;
  unregisterSheet(scope: string, sheetClass: any, options?: object): void;
};

// Base document classes
declare class Actor {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly system: Record<string, any>;
  readonly itemTypes: Record<string, Item[]>;
  readonly items: { get(id: string): Item | undefined };
  readonly isOwner: boolean;

  static create(data: object, options?: object): Promise<Actor>;

  createEmbeddedDocuments(type: string, data: object[], options?: object): Promise<any[]>;
  deleteEmbeddedDocuments(type: string, ids: string[], options?: object): Promise<any[]>;
  update(data: object, options?: object): Promise<this>;
  getFlag(scope: string, key: string): any;
  setFlag(scope: string, key: string, value: any): Promise<this>;
  unsetFlag(scope: string, key: string): Promise<this>;
}

declare class Item {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly system: Record<string, any>;
  readonly sheet: ItemSheet;

  update(data: object, options?: object): Promise<this>;
  getFlag(scope: string, key: string): any;
  setFlag(scope: string, key: string, value: any): Promise<this>;
  unsetFlag(scope: string, key: string): Promise<this>;
}

// Sheet base classes
declare class ActorSheet {
  static get defaultOptions(): object;
  readonly actor: Actor;
  readonly isEditable: boolean;

  getData(): object;
  activateListeners(html: JQuery): void;
  close(options?: object): Promise<void>;
  render(force?: boolean, options?: object): this;
}

declare class ItemSheet {
  static get defaultOptions(): object;
  readonly item: Item;
  readonly isEditable: boolean;

  getData(): object;
  activateListeners(html: JQuery): void;
  render(force?: boolean, options?: object): this;
}

// Dice rolling
declare class Roll {
  constructor(formula: string, data?: object);
  evaluate(options?: object): Promise<this>;
  toMessage(data?: object, options?: object): Promise<any>;
}

// Chat
declare const ChatMessage: {
  getSpeaker(options?: { actor?: Actor }): object;
};

// Handlebars
declare const Handlebars: {
  registerHelper(name: string, fn: (...args: any[]) => any): void;
  registerPartial(name: string, partial: string): void;
};

// Template loading
declare function loadTemplates(paths: string[]): Promise<Function[]>;

// jQuery
declare const $: any;
declare function $(selector: any): JQuery;
declare interface JQuery {
  find(selector: string): JQuery;
  on(event: string, handler: (evt: any) => any): JQuery;
  addClass(cls: string): JQuery;
  val(): string | number | string[];
  closest(selector: string): JQuery;
}
