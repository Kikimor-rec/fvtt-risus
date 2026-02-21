export class RisusActor extends Actor {
  static async create(data: any, options: any = {}) {
    // V13: system data lives under `system`, not `data.data`
    foundry.utils.mergeObject(data, {
      system: {
        pump: {
          value: game.settings.get('risus', 'defaultPump')
        }
      }
    });

    return super.create(data, options);
  }
}
