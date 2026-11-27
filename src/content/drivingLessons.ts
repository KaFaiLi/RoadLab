import { tr } from "./schema";
export const skillText = {
  lightWait: tr(
    "Stopped before the signal",
    "在號誌前停車",
    "信号の手前で停止",
  ),
  gapWait: tr(
    "Held back for oncoming traffic",
    "等候對向來車",
    "対向車を待った",
  ),
  walkWait: tr(
    "Waited for the pedestrian’s path to clear",
    "停車等候行人通過",
    "歩行者の進路を確保",
  ),
  queueWait: tr(
    "Waited outside the junction for exit space",
    "在路口外等待出口空間",
    "交差点の外で出口の空きを待った",
  ),
  bikeWait: tr(
    "Waited for the cyclist on the left",
    "禮讓左側自行車",
    "左側の自転車を待った",
  ),
  winterGap: tr(
    "Stopped with space behind the lead car",
    "在前車後方留距停車",
    "前車との距離を保って停止",
  ),
  arrowLane: tr(
    "Entered from the marked right-turn lane on the arrow",
    "依箭頭從右轉車道進入",
    "指定車線から矢印信号で進入",
  ),
  sideStop: tr(
    "Stopped at the stop sign",
    "在停止標誌前停車",
    "標識で一時停止",
  ),
};
export type Skill = keyof typeof skillText;
export const eventText = {
  ...skillText,
  enteredJunction: tr("Entered the junction", "進入路口", "交差点に進入"),
  lastCarWhileWalking: tr(
    "The last oncoming car cleared your turn while a pedestrian was still crossing.",
    "最後一輛對向車已通過，但仍有行人正在過街。",
    "最後の対向車が通過したとき、歩行者はまだ横断中でした。",
  ),
  lastCar: tr(
    "The last oncoming car passed the turn",
    "最後一輛對向車已通過轉彎處",
    "最後の対向車が右折地点を通過",
  ),
  lastWalker: tr(
    "The last pedestrian reached the far kerb",
    "最後一位行人已到達對側",
    "最後の歩行者が反対側に到着",
  ),
  exitClear: tr(
    "Cleared the exit crossing",
    "通過出口穿越道",
    "出口の横断歩道を通過",
  ),
  looked: tr(
    "Checked the crossing side",
    "查看出口穿越道方向",
    "出口の横断歩道側を確認",
  ),
};
export type DriveEvent = { key: keyof typeof eventText; time: number };
export const lessonText = {
  timeline: tr("Decision review", "決策回顧", "判断の振り返り"),
  skills: tr(
    "Driving skills demonstrated",
    "實際展現的駕駛技能",
    "走行で実践した技能",
  ),
  runs: tr("Completed drives", "完成駕駛次數", "走行クリア数"),
  retrySame: tr("Retry this encounter", "重試相同路況", "同じ状況で再走"),
  different: tr("Practice another variation", "練習其他變化", "別の状況で練習"),
  variant: tr("Encounter", "路況組合", "パターン"),
  riverTurn: tr(
    "Turn left along the river.",
    "沿河岸左轉。",
    "川沿いの道へ左折。",
  ),
  bikeCheck: tr(
    "Check the left mirror and shoulder before turning.",
    "轉彎前查看左後視鏡並回頭確認。",
    "左折前に左ミラーと左後方を確認。",
  ),
  selectLane: tr(
    "Choose the right-turn lane before the solid line.",
    "實線前選擇右轉車道。",
    "実線の手前で右折車線を選択。",
  ),
  inspectRight: tr(
    "Check the exit crossing · hold E or Look right",
    "查看出口穿越道・按住 E 或向右看",
    "出口の横断歩道を確認・E または右確認を長押し",
  ),
  inspectLeft: tr(
    "Check the exit crossing · hold Q or Look left",
    "查看出口穿越道・按住 Q 或向左看",
    "出口の横断歩道を確認・Q または左確認を長押し",
  ),
  queue: tr(
    "The queue left too little room beyond the crossing. Wait before entering.",
    "出口車龍後方空間不足；請在進入路口前等待。",
    "出口の車列で横断歩道の先に空きがありません。進入前に待ちましょう。",
  ),
  bike: tr(
    "Your turn crossed the cyclist’s path. Use the mirror and check over your left shoulder.",
    "轉彎切入了自行車動線，請看後視鏡並回頭確認左側。",
    "左折で自転車の進路に入りました。ミラーと左後方を確認しましょう。",
  ),
  arrow: tr(
    "Use the marked right-turn lane and wait for the right arrow.",
    "使用指定右轉車道並等候右轉箭頭。",
    "右折指定車線に入り、右矢印を待ちましょう。",
  ),
  rear: tr(
    "You reached the lead car. Leave space and brake earlier.",
    "你追上了前車。請增加車距並提早減速。",
    "前車に接触しました。車間距離を広げ、早めに減速しましょう。",
  ),
  van: tr(
    "The delivery van blocks the view. Approach slowly enough to stop before the stripes.",
    "貨車遮擋視線。減速至可在斑馬線前停車。",
    "配送車で死角があります。横断歩道の手前で止まれる速度で接近しましょう。",
  ),
  coaching: tr(
    "Practice guidance · simulated grip, gaps and visibility",
    "練習指引・模擬抓地力、車距及能見度",
    "練習の目安・摩擦、車間、視界はシミュレーション値",
  ),
  mirror: tr("Left mirror", "左後視鏡", "左ミラー"),
  arrowGreen: tr("Right arrow", "右轉箭頭", "右矢印"),
  law: tr("Road Traffic Act", "道路交通法", "道路交通法"),
  winterSource: tr(
    "Hokkaido winter driving guide",
    "北海道冬季駕駛指南",
    "北海道の冬道ガイド",
  ),
};
