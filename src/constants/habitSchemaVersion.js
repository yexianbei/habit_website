/**
 * H5 习惯配置版本（仅用于内部迁移判断，不影响业务展示）。
 * 规则：
 * 1) 新创建习惯写入当前版本；
 * 2) 未来如需补丁迁移，按版本号执行并在方法注释中注明「from -> to」。
 */

export const HABIT_SCHEMA_VERSION = Object.freeze({
  // 当前线上创建版本（按你要求，现阶段统一保持 v1）
  PERIOD: 1,
  COUNTER: 1,
})

// 目标版本（仅用于迁移工具，不会自动生效）
export const HABIT_SCHEMA_LATEST = Object.freeze({
  PERIOD: 2,
  COUNTER: 2,
})

