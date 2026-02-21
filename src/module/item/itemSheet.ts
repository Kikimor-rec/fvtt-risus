export class RisusItemSheet extends ItemSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["risus", "sheet", "item"],
      width: 300,
      height: 200
    });
  }

  get template() {
    const path = "systems/risus/templates/item";
    // V13: item.type instead of item.data.type
    return `${path}/${this.item.type}-sheet.html`;
  }

  getData() {
    const data = super.getData() as any;

    // V13: item.type instead of item.data.type
    const type = this.item.type;
    switch (type) {
    }

    return data;
  }

  activateListeners(html: JQuery) {
    super.activateListeners(html);

    // V13: item.type instead of item.data.type
    const type = this.item.type;

    const window = html.closest('.window-app');
    window.addClass(type);

    switch (type) {
    }
  }
}
