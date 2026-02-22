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
    return super.getData();
  }

  activateListeners(html: JQuery) {
    super.activateListeners(html);

    const window = html.closest('.window-app');
    window.addClass(this.item.type);
  }
}
