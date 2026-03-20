/**
 * 习惯「展示语义」枚举 — 与原生 conditionValue.presentationKind、habit-attribute-spec.md §4.c.2 一致。
 * 值统一为 snake_case 字符串，禁止魔法字符串散落业务代码。
 *
 * 分类说明（产品常用子集）：
 * - 打卡型 → CHECK_IN
 * - 计数型 → COUNTER
 * - 连续型 → STREAK（如戒烟连续天数）
 * - 记录型 → RECORD（如经期，无完成/未完成）
 * - 时长型 → DURATION
 * - 时段型 → TIME_WINDOW
 * - 反向型 → AVOIDANCE（没做某事算正向）
 */

/** @enum {string} */
export const PresentationKind = Object.freeze({
  /** 打卡型：做了/没做 */
  CHECK_IN: 'check_in',
  /** 计数型：做了多少、有目标量 */
  COUNTER: 'counter',
  /** 连续型：连续天数，中断归零 */
  STREAK: 'streak',
  /** 记录型：发生了什么，无完成概念 */
  RECORD: 'record',
  /** 时长型：花了多少时间、有目标时长 */
  DURATION: 'duration',
  /** 评级型：等级/分数描述状态 */
  RATING: 'rating',
  /** 时间点型：记录「几点发生」 */
  TIME_POINT: 'time_point',
  /** 时段型：固定时间段内完成 */
  TIME_WINDOW: 'time_window',
  /** 反向型（避免型）：今天没做某事算完成 */
  AVOIDANCE: 'avoidance',
  /** 周期型：非每日、按周期 */
  CYCLE: 'cycle',
  /** 结果型：测得值与趋势 */
  OUTCOME: 'outcome',
})

/** 所有合法取值（校验、下拉用） */
export const PRESENTATION_KIND_VALUES = Object.freeze(Object.values(PresentationKind))

/** 中文分类 → 枚举值（常用映射，供习惯库/运营配置） */
export const PRESENTATION_KIND_BY_CATEGORY_ZH = Object.freeze({
  打卡型: PresentationKind.CHECK_IN,
  计数型: PresentationKind.COUNTER,
  连续型: PresentationKind.STREAK,
  记录型: PresentationKind.RECORD,
  时长型: PresentationKind.DURATION,
  评级型: PresentationKind.RATING,
  时间点型: PresentationKind.TIME_POINT,
  时段型: PresentationKind.TIME_WINDOW,
  反向型: PresentationKind.AVOIDANCE,
  避免型: PresentationKind.AVOIDANCE,
  周期型: PresentationKind.CYCLE,
  结果型: PresentationKind.OUTCOME,
})

/** 枚举值 → 简短中文说明（调试/文档） */
export const PRESENTATION_KIND_LABEL_ZH = Object.freeze({
  [PresentationKind.CHECK_IN]: '打卡型',
  [PresentationKind.COUNTER]: '计数型',
  [PresentationKind.STREAK]: '连续型',
  [PresentationKind.RECORD]: '记录型',
  [PresentationKind.DURATION]: '时长型',
  [PresentationKind.RATING]: '评级型',
  [PresentationKind.TIME_POINT]: '时间点型',
  [PresentationKind.TIME_WINDOW]: '时段型',
  [PresentationKind.AVOIDANCE]: '反向型',
  [PresentationKind.CYCLE]: '周期型',
  [PresentationKind.OUTCOME]: '结果型',
})

/**
 * @param {string} [value]
 * @returns {boolean}
 */
export function isValidPresentationKind(value) {
  return typeof value === 'string' && PRESENTATION_KIND_VALUES.includes(value)
}

/**
 * habit.create / 配置 JSON 用的 presentationKind 字段
 * @param {keyof typeof PresentationKind} key
 * @returns {string}
 */
export function presentationKindOf(key) {
  return PresentationKind[key]
}
