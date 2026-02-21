export const registerHandlebars = () => {
  Handlebars.registerHelper('repeat', (times, block) => {
    const out = [];
    const data = {
      index: 0
    };

    for (let i = 0; i < times; i++) {
      data.index = i;

      out.push(
        block.fn(this, {
          data
        })
      );
    }

    return out.join('');
  });

  Handlebars.registerHelper('withSign', val => {
    const sign = val > 0 ? '+' : '';
    return `${sign}${val}`;
  });

  Handlebars.registerHelper('concat', (v1, v2) => `${v1}${v2}`);

  Handlebars.registerHelper('add', (lhs, rhs) => {
    return parseInt(lhs) + rhs;
  });

  Handlebars.registerHelper('lt', (lhs, rhs) => {
    return lhs < rhs;
  });

  Handlebars.registerHelper('lte', (lhs, rhs) => {
    return lhs <= rhs;
  });

  Handlebars.registerHelper('ge', (lhs, rhs) => {
    return lhs > rhs;
  });

  Handlebars.registerHelper('gte', (lhs, rhs) => {
    return lhs >= rhs;
  });

  // V13: Item document instead of legacy Entity; system data at item.system
  Handlebars.registerHelper('clicheName', (cliche: any) => {
    if (cliche.getFlag('risus', 'modified')) {
      return cliche.getFlag('risus', 'name');
    }

    return cliche.name;
  });

  Handlebars.registerHelper('clicheDice', (cliche: any) => {
    if (cliche.getFlag('risus', 'modified')) {
      return cliche.getFlag('risus', 'dice');
    }

    // V13: item.system instead of item.data.data
    return (cliche.system as any).dice;
  });

  Handlebars.registerHelper('clicheModified', (cliche: any) => {
    return cliche.getFlag('risus', 'modified');
  });

  Handlebars.registerHelper('gearName', (gear: any) => {
    if (gear.getFlag('risus', 'modified')) {
      return gear.getFlag('risus', 'name');
    }

    return gear.name;
  });

  Handlebars.registerHelper('gearQuantity', (gear: any) => {
    if (gear.getFlag('risus', 'modified')) {
      return gear.getFlag('risus', 'quantity');
    }

    // V13: item.system instead of item.data.data
    return (gear.system as any).quantity;
  });

  Handlebars.registerHelper('gearModified', (gear: any) => {
    return gear.getFlag('risus', 'modified');
  });
}
