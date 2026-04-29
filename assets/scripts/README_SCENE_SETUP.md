# Cocos Creator 3.x Fishing V0.1 Scene Setup

This workspace contains the TypeScript scripts for a vertical 2D fishing prototype. It does not include a serialized `.scene` file, so create the scene manually in Cocos Creator and bind the Inspector properties as described below.

## Project Settings

- Cocos Creator: 3.7 or 3.8+
- Language: TypeScript
- Design resolution: `720 x 1280`
- Orientation: Portrait

## Recommended Node Tree

Create one scene with this hierarchy:

```text
Canvas
  GameRoot
  MainUI
    TopBar
      GoldLabel
      RodLevelLabel
    FishingArea
      Background
      StatusLabel
    BottomBar
      CastButton
      UpgradeButton
      CollectionButton
  FishingDialPanel
    DialGraphics
    Pointer
    ProgressLabel
    JudgeButton
  ResultPanel
    FishNameLabel
    RarityLabel
    WeightLabel
    SellPriceLabel
    RecordLabel
    SellButton
    ContinueButton
  CollectionPanel
    EntryLabel1
    EntryLabel2
    EntryLabel3
    EntryLabel4
    EntryLabel5
    CloseButton
```

Set `FishingDialPanel`, `ResultPanel`, and `CollectionPanel` inactive in the editor by default. `GameManager` also hides them during startup, so accidental active panels will be closed when preview begins.

## GameRoot

Attach `assets/scripts/managers/GameManager.ts` to `GameRoot`.

Bind these Inspector properties:

- `Main UI`: drag the `MainUI` component from the `MainUI` node.
- `Fishing Dial UI`: drag the `FishingDialUI` component from the `FishingDialPanel` node.
- `Result Panel`: drag the `ResultPanel` component from the `ResultPanel` node.
- `Collection Panel`: drag the `CollectionPanel` component from the `CollectionPanel` node.

## MainUI

Attach `assets/scripts/ui/MainUI.ts` to the `MainUI` node.

Create these child nodes:

- `GoldLabel`: add a `Label` component.
- `RodLevelLabel`: add a `Label` component.
- `StatusLabel`: add a `Label` component.
- `CastButton`: add a `Button` component and a child label with text `抛竿`.
- `UpgradeButton`: add a `Button` component and a child label with text `升级鱼竿`.
- `CollectionButton`: add a `Button` component and a child label with text `图鉴`.

Bind these Inspector properties:

- `Gold Label`: drag `GoldLabel`.
- `Rod Level Label`: drag `RodLevelLabel`.
- `Status Label`: drag `StatusLabel`.
- `Cast Button`: drag the `Button` component on `CastButton`.
- `Upgrade Button`: drag the `Button` component on `UpgradeButton`.
- `Collection Button`: drag the `Button` component on `CollectionButton`.

Optional manual Button Click Events:

- `CastButton`: target `GameRoot`, component `GameManager`, handler `onCastButtonClicked`.
- `UpgradeButton`: target `GameRoot`, component `GameManager`, handler `onUpgradeButtonClicked`.
- `CollectionButton`: target `GameRoot`, component `GameManager`, handler `onCollectionButtonClicked`.

The scripts also register these button callbacks automatically through the `MainUI` component, so do not bind both automatic and manual click paths at the same time unless you remove one path in code.

Recommended layout:

- `TopBar`: height about `100`, aligned to the top.
- `FishingArea`: center area, full width, with a simple blue-green `Sprite` or color block as `Background`.
- `StatusLabel`: centered inside `FishingArea`.
- `BottomBar`: height about `180`, aligned to the bottom, containing the three buttons.

## FishingDialPanel

Attach `assets/scripts/ui/FishingDialUI.ts` to `FishingDialPanel`.

Create these child nodes:

- `DialGraphics`: add `UITransform` and `Graphics`.
- `Pointer`: create a thin rectangle `Sprite`, size about `8 x 180`, placed at the dial center.
- `ProgressLabel`: add a `Label` component.
- `JudgeButton`: add a `Button` component and a child label with text `点击判定`.

Bind these Inspector properties:

- `Dial Graphics`: drag the `Graphics` component on `DialGraphics`.
- `Pointer Node`: drag the `Pointer` node.
- `Progress Label`: drag `ProgressLabel`.
- `Judge Button`: drag the `Button` component on `JudgeButton`.

Recommended node settings:

- `FishingDialPanel`: centered on screen, size around `720 x 720`.
- `DialGraphics`: size around `420 x 420`, position `(0, 80)`.
- `Pointer`: position `(0, 80)`, rotate around the dial center. If your rectangle appears offset, make the pointer node itself centered and put the visual rectangle as a child offset upward by about `90`.
- `ProgressLabel`: place near the dial, for example `(0, -170)`.
- `JudgeButton`: place below the dial, for example `(0, -260)`.

The panel also listens for touch end events, so tapping the dial area can trigger judgment in addition to `JudgeButton`.

## ResultPanel

Attach `assets/scripts/ui/ResultPanel.ts` to `ResultPanel`.

Create these child nodes:

- `FishNameLabel`: add `Label`.
- `RarityLabel`: add `Label`.
- `WeightLabel`: add `Label`.
- `SellPriceLabel`: add `Label`.
- `RecordLabel`: add `Label`.
- `SellButton`: add `Button` and child label text `出售`.
- `ContinueButton`: add `Button` and child label text `继续钓鱼`.

Bind these Inspector properties:

- `Fish Name Label`: drag `FishNameLabel`.
- `Rarity Label`: drag `RarityLabel`.
- `Weight Label`: drag `WeightLabel`.
- `Sell Price Label`: drag `SellPriceLabel`.
- `Record Label`: drag `RecordLabel`.
- `Sell Button`: drag the `Button` component on `SellButton`.
- `Continue Button`: drag the `Button` component on `ContinueButton`.

`出售` adds the displayed gold value. `继续钓鱼` closes the result panel without adding gold.

## CollectionPanel

Attach `assets/scripts/ui/CollectionPanel.ts` to `CollectionPanel`.

Create these child nodes:

- `EntryLabel1` to `EntryLabel5`: each has a `Label` component.
- `CloseButton`: add `Button` and child label text `关闭`.

Bind these Inspector properties:

- `Fish Entry Labels`: set array size to `5`, then drag `EntryLabel1`, `EntryLabel2`, `EntryLabel3`, `EntryLabel4`, and `EntryLabel5` in order.
- `Close Button`: drag the `Button` component on `CloseButton`.

Recommended layout:

- Use a vertical `Layout` component for the five entry labels.
- Each entry label can be about `640 x 60`.
- Use a simple semi-transparent background panel if needed for readability.

## Runtime Flow

1. `GameManager` loads saved data from `sys.localStorage`.
2. Player taps `抛竿`.
3. Main buttons become disabled and status changes to `等待鱼咬钩……`.
4. After `1.5` to `3` seconds, a weighted random fish is selected.
5. `FishingDialUI` appears and draws the safe sector using `Graphics`.
6. The pointer rotates at the selected fish's `pointerSpeed`.
7. Tapping the judge button or dial checks whether the pointer angle is in the safe sector.
8. Hit increases progress. Miss closes the dial and shows `鱼跑了！`.
9. Full success opens the result panel and records the catch in the collection.
10. `出售` adds gold and saves the game.
11. `升级鱼竿` costs `rodLevel * 100` and increases future safe zone angles by `2` degrees per rod level, capped at `120`.

## Debug Reset

`GameManager` exposes `resetGameForDebug()`. You can temporarily call it from a debug button or from code while testing. It clears local storage and restores:

- `gold = 0`
- `rodLevel = 1`
- all fish locked with zero catch count and max weight

## Acceptance Checklist

- The scene opens in portrait resolution.
- `抛竿` waits 1.5 to 3 seconds and then opens the dial.
- The dial shows a safe sector and a rotating pointer.
- Hits inside the sector progress the challenge.
- Misses close the dial and show `鱼跑了！`.
- Successful catches show fish data, weight, value, and record state.
- `出售` adds gold.
- `升级鱼竿` spends gold and increases future safe zones.
- `图鉴` shows five fish entries and persists caught fish after preview restart.
