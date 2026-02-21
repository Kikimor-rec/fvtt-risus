export interface CharacterSheetData {
  showPump: boolean;
  cliches: Array<any>;
  gear: Array<any>;
  [key: string]: any;
}

export class RisusCharacterSheet extends ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['risus', 'sheet', 'actor'],
      width: 600,
      height: 500,
      tabs: [{
        navSelector: ".sheet-tabs",
        contentSelector: ".tab-body",
        initial: "cliche"
      }]
    });
  }

  get template() {
    // V13: actor.type instead of actor.data.type
    const type = this.actor.type;
    return `systems/risus/templates/actor/${type}-sheet.html`;
  }

  getData(): CharacterSheetData {
    const data = super.getData() as CharacterSheetData;

    const { actor } = this;

    data.showPump = game.settings.get('risus', 'showPump') as boolean;

    data.cliches = actor.itemTypes['cliche'] || [];
    data.gear = actor.itemTypes['gear'] || [];

    return data;
  }

  activateListeners(html: JQuery) {
    super.activateListeners(html);

    // V13: actor.type instead of actor.data.type
    const type = this.actor.type;

    const window = html.closest('.window-app');
    window.addClass(type);

    // Cliche listeners
    const clicheTab = html.find('.tab.cliche');

    // Prevent the default behavior as it will refresh the form
    // before the user can save their changes.
    clicheTab.find('input').on('change', async (evt) => {
      evt.stopPropagation();
      evt.preventDefault();

      const elRow = evt.currentTarget.closest('.cliche') as HTMLElement;
      const $row = $(elRow);
      const clicheId = elRow.dataset.clicheId;

      const clicheNameInput = $row.find('input[name="clicheName"]');
      const clicheDiceInput = $row.find('input[name="clicheDice"]');

      // V13: actor.items.get() instead of actor.getOwnedItem()
      const cliche = this.actor.items.get(clicheId) as any;

      const oldName = cliche.name;
      // V13: item.system instead of item.data.data
      const oldDice = parseInt((cliche.system as any).dice, 10);

      const newName = clicheNameInput.val();
      const newDice = parseInt(String(clicheDiceInput.val()), 10);

      let doModify = true;

      if (cliche.getFlag('risus', 'modified')) {
        if (newName === oldName && newDice === oldDice) {
          doModify = false;

          await cliche.unsetFlag('risus', 'name');
          await cliche.unsetFlag('risus', 'dice');
          await cliche.unsetFlag('risus', 'modified');
        }
      }

      if (doModify) {
        await cliche.setFlag('risus', 'name', newName);
        await cliche.setFlag('risus', 'dice', newDice);
        await cliche.setFlag('risus', 'modified', true);
      }
    });

    clicheTab.find('.add-cliche').on('click', async (evt) => {
      const { actor } = this;

      // V13: createEmbeddedDocuments() instead of createOwnedItem()
      await actor.createEmbeddedDocuments('Item', [{
        name: 'New Cliche',
        type: 'cliche',
        system: {}
      }]);
    });

    clicheTab.find('.roll-cliche').on('click', async (evt) => {
      evt.preventDefault();

      const { actor } = this;
      let el = evt.currentTarget;
      let clicheId = (el as any).dataset.clicheId;
      while (!clicheId) {
        el = el.parentElement;
        clicheId = (el as any).dataset.clicheId;
      }
      // V13: actor.items.get() instead of actor.getOwnedItem()
      const cliche = actor.items.get(clicheId) as any;

      // V13: item.system instead of item.data.data
      const numDice = (cliche.system as any).dice;
      const roll = new Roll(`${numDice}d6`);

      await roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor }),
        flavor: game.i18n.localize('risus.roll.cliche.flavor')
          .replace('##ACTOR##', actor.name)
          .replace('##CLICHE##', cliche.name)
      });
    });

    clicheTab.find('.save-cliche').on('click', async (evt) => {
      evt.preventDefault();

      const { actor } = this;
      let el = evt.currentTarget;
      let clicheId = (el as any).dataset.clicheId;
      while (!clicheId) {
        el = el.parentElement;
        clicheId = (el as any).dataset.clicheId;
      }
      const $row = $(el.closest('.cliche') as HTMLElement);
      // V13: actor.items.get() instead of actor.getOwnedItem()
      const cliche = actor.items.get(clicheId) as any;

      const updatedName = $row.find('input[name="clicheName"]').val();
      const updatedDice = $row.find('input[name="clicheDice"]').val();

      await cliche.unsetFlag('risus', 'name');
      await cliche.unsetFlag('risus', 'dice');
      await cliche.unsetFlag('risus', 'modified');

      await cliche.update({
        name: updatedName,
        // V13: system.dice instead of data.dice
        'system.dice': updatedDice
      });
    });

    clicheTab.find('.delete-cliche').on('click', async (evt) => {
      evt.preventDefault();

      const { actor } = this;
      let el = evt.currentTarget;
      let clicheId = (el as any).dataset.clicheId;
      while (!clicheId) {
        el = el.parentElement;
        clicheId = (el as any).dataset.clicheId;
      }

      // V13: deleteEmbeddedDocuments() instead of deleteOwnedItem()
      await actor.deleteEmbeddedDocuments('Item', [clicheId]);
    });

    // Gear listeners
    const gearTab = html.find('.tab.gear');

    // Prevent the default behavior as it will refresh the form
    // before the user can save their changes.
    gearTab.find('input').on('change', async (evt) => {
      evt.stopPropagation();
      evt.preventDefault();

      const elRow = evt.currentTarget.closest('.gear') as HTMLElement;
      const $row = $(elRow);
      const gearId = elRow.dataset.gearId;

      const gearNameInput = $row.find('input[name="gearName"]');
      const gearQuantityInput = $row.find('input[name="gearQuantity"]');

      // V13: actor.items.get() instead of actor.getOwnedItem()
      const gear = this.actor.items.get(gearId) as any;

      const oldName = gear.name;
      // V13: item.system instead of item.data.data
      const oldQuantity = parseInt((gear.system as any).quantity, 10);

      const newName = gearNameInput.val();
      const newQuantity = parseInt(String(gearQuantityInput.val()), 10);

      let doModify = true;

      if (gear.getFlag('risus', 'modified')) {
        if (newName === oldName && newQuantity === oldQuantity) {
          doModify = false;

          await gear.unsetFlag('risus', 'name');
          await gear.unsetFlag('risus', 'quantity');
          await gear.unsetFlag('risus', 'modified');
        }
      }

      if (doModify) {
        await gear.setFlag('risus', 'name', newName);
        await gear.setFlag('risus', 'quantity', newQuantity);
        await gear.setFlag('risus', 'modified', true);
      }
    });

    gearTab.find('.add-gear').on('click', async (evt) => {
      const { actor } = this;

      // V13: createEmbeddedDocuments() instead of createOwnedItem()
      await actor.createEmbeddedDocuments('Item', [{
        name: 'New Gear',
        type: 'gear',
        system: {}
      }]);
    });

    gearTab.find('.save-gear').on('click', async (evt) => {
      evt.preventDefault();

      const { actor } = this;
      let el = evt.currentTarget;
      let gearId = (el as any).dataset.gearId;
      while (!gearId) {
        el = el.parentElement;
        gearId = (el as any).dataset.gearId;
      }
      const $row = $(el.closest('.gear') as HTMLElement);
      // V13: actor.items.get() instead of actor.getOwnedItem()
      const gear = actor.items.get(gearId) as any;

      const updatedName = $row.find('input[name="gearName"]').val();
      const updatedQuantity = $row.find('input[name="gearQuantity"]').val();

      await gear.unsetFlag('risus', 'name');
      await gear.unsetFlag('risus', 'quantity');
      await gear.unsetFlag('risus', 'modified');

      await gear.update({
        name: updatedName,
        // V13: system.quantity instead of data.quantity
        'system.quantity': updatedQuantity
      });
    });

    gearTab.find('.edit-gear').on('click', async (evt) => {
      evt.preventDefault();

      const { actor } = this;
      let el = evt.currentTarget;
      let gearId = (el as any).dataset.gearId;
      while (!gearId) {
        el = el.parentElement;
        gearId = (el as any).dataset.gearId;
      }

      // V13: actor.items.get() instead of actor.getOwnedItem()
      const gear = actor.items.get(gearId) as any;
      if (gear) {
        gear.sheet.render(true);
      }
    });

    gearTab.find('.delete-gear').on('click', async (evt) => {
      evt.preventDefault();

      const { actor } = this;
      let el = evt.currentTarget;
      let gearId = (el as any).dataset.gearId;
      while (!gearId) {
        el = el.parentElement;
        gearId = (el as any).dataset.gearId;
      }

      // V13: deleteEmbeddedDocuments() instead of deleteOwnedItem()
      await actor.deleteEmbeddedDocuments('Item', [gearId]);
    });
  }

  async close(options?: any): Promise<void> {
    await super.close(options);

    const allCliches = this.actor.itemTypes['cliche'] as any[];
    for (let i = 0; i < allCliches.length; i++) {
      const cliche = allCliches[i];

      if (cliche.getFlag('risus', 'modified')) {
        await cliche.unsetFlag('risus', 'name');
        await cliche.unsetFlag('risus', 'dice');
        await cliche.unsetFlag('risus', 'modified');
      }
    }

    const allGear = this.actor.itemTypes['gear'] as any[];
    for (let i = 0; i < allGear.length; i++) {
      const gear = allGear[i];

      if (gear.getFlag('risus', 'modified')) {
        await gear.unsetFlag('risus', 'name');
        await gear.unsetFlag('risus', 'quantity');
        await gear.unsetFlag('risus', 'modified');
      }
    }
  }
}
