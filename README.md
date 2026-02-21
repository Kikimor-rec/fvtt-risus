# Risus: The Anything RPG — FoundryVTT V13

> Система [Risus: The Anything RPG](https://www.risusiverse.com/) для [Foundry Virtual Tabletop](https://foundryvtt.com/), обновлённая для совместимости с **FoundryVTT V13**.
>
> Основана на оригинальной работе [bojjenclon](https://github.com/bojjenclon/FoundryVTT-Risus), поддерживается [Kikimor-rec](https://github.com/Kikimor-rec).

## Установка в Foundry VTT

### Через менеджер пакетов (рекомендуется)

1. Открой Foundry VTT → **Setup** → **Game Systems**
2. Нажми **Install System**
3. Вставь ссылку на манифест:

```
https://github.com/Kikimor-rec/FoundryVTT-Risus/releases/latest/download/system.json
```

4. Нажми **Install**

### Вручную

1. Скачай `risus-vX.Y.Z.zip` со страницы [Releases](https://github.com/Kikimor-rec/FoundryVTT-Risus/releases)
2. Распакуй в папку `{FoundryData}/Data/systems/risus/`
3. Перезапусти Foundry

## Совместимость

| Foundry VTT | Статус |
|---|---|
| V13 | ✅ Поддерживается |
| V12 и ниже | ❌ Не поддерживается |

## Разработка

### Требования

- Node.js 18+
- npm

### Установка зависимостей

```bash
npm install
```

### Сборка

```bash
npm run build         # Однократная сборка
npm run build:watch   # Сборка с отслеживанием изменений
```

### Создание установочного пакета (локально)

```bash
npm run package       # Создаёт package/risus-vX.Y.Z.zip
```

### Релиз на GitHub (создаёт GitHub Release автоматически)

```bash
git tag v0.2.0
git push && git push --tags
```

GitHub Actions автоматически:
1. Собирает проект
2. Создаёт ZIP-архив
3. Публикует **GitHub Release** с файлами `risus-v0.2.0.zip` и `system.json`

### Локальное подключение к Foundry

Скопируй `foundryconfig.json.example` в `foundryconfig.json` и укажи путь к данным Foundry:

```json
{
  "dataPath": "/absolute/path/to/your/FoundryData",
  "repository": "https://github.com/Kikimor-rec/FoundryVTT-Risus"
}
```

Затем:

```bash
npm run link   # Создаёт символическую ссылку dist/ → FoundryData/systems/risus
npm run build:watch   # Автоматическая пересборка при изменении файлов
```

## Лицензия

MIT
