# Cocos Creator 3.x 钓鱼 V0.1 场景说明

本项目是一个竖屏 2D 钓鱼原型，目标版本为 V0.1。当前仓库已经包含 `assets/Main.scene`，脚本也会在运行时为缺失的基础 UI 控件创建默认节点，因此可以直接打开主场景预览。

## 项目设置

- Cocos Creator：3.8.8
- 语言：TypeScript
- 设计分辨率：`720 x 1280`
- 屏幕方向：竖屏

## 推荐节点结构

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

`FishingDialPanel`、`ResultPanel`、`CollectionPanel` 默认应为 inactive。`GameManager` 启动时也会隐藏它们。

## 运行流程

1. `GameManager` 从 `sys.localStorage` 读取金币、鱼竿等级和图鉴记录。
2. 玩家点击 `抛竿`。
3. 主按钮禁用，状态显示 `等待鱼儿咬钩...`。
4. 等待 `1.5` 到 `3` 秒后，根据权重随机选择一条鱼。
5. `FishingDialUI` 显示判定盘、安全区域和旋转指针。
6. 点击 `点击判定` 或判定盘区域进行命中判断。
7. 命中会增加进度；未命中会关闭判定盘并显示 `鱼跑了！`。
8. 达成所需命中次数后显示结果面板。
9. 结果面板展示鱼类、稀有度、重量、价值和纪录状态。
10. `出售` 增加金币并保存；`继续钓鱼` 只关闭结果面板。
11. `升级鱼竿` 消耗 `rodLevel * 100` 金币，并让之后的安全区每级增加 `2` 度，最高 `120` 度。
12. `图鉴` 展示 5 种鱼的解锁、捕获次数和最大重量记录。

## 调试重置

`GameManager` 暴露了 `resetGameForDebug()`。临时从按钮或代码调用后会清空本地存档，并恢复：

- `gold = 0`
- `rodLevel = 1`
- 全部鱼类未解锁，捕获数为 0，最大重量为 0

## V0.1 验收清单

- 主场景以竖屏分辨率打开。
- `抛竿` 会等待 1.5 到 3 秒，然后打开判定盘。
- 判定盘显示安全区域和旋转指针。
- 指针落在安全区域内点击会推进挑战进度。
- 未命中会关闭判定盘并显示 `鱼跑了！`。
- 成功捕获会显示鱼类数据、重量、价值和纪录状态。
- `出售` 会增加金币并保存。
- `升级鱼竿` 会消耗金币并提升后续安全区角度。
- `图鉴` 会显示 5 种鱼，并在预览重启后保留捕获记录。
