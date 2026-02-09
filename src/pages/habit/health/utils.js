/**
 * 健康数据工具函数和常量
 */

export const METRIC_TYPES = {
  GLUCOSE: 'glucose',
  BLOOD_PRESSURE: 'bp',
  LIPID: 'lipid',
}

export const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`
}

export const formatTime = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export const parseDetails = (raw) => {
  if (!raw) return {}
  try {
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

/**
 * 渲染记录摘要信息
 */
export const renderRecordSummary = (record) => {
  const { createTime, detailsRaw } = record
  const details = parseDetails(detailsRaw)
  const timeLabel = formatTime(createTime)
  const metricType = details.metricType || 'glucose'

  if (metricType === METRIC_TYPES.GLUCOSE) {
    const value = typeof details.value === 'number' ? details.value : null
    const sceneMap = {
      fasting: '空腹',
      before_meal: '餐前',
      after_meal: '餐后',
    }
    const mealMap = {
      breakfast: '早餐',
      lunch: '午餐',
      dinner: '晚餐',
      snack: '加餐',
    }
    const scene = sceneMap[details.scene] || '血糖'
    const meal = mealMap[details.meal] || ''
    const main = value != null ? `${value.toFixed(1)} mmol/L` : '血糖'
    const status =
      typeof value === 'number'
        ? value < 3.9
          ? '偏低'
          : value > 10
            ? '偏高'
            : '理想'
        : ''
    const descParts = [scene, meal, status].filter(Boolean)

    return {
      icon: '🩸',
      title: `${timeLabel} ${main}`,
      desc: descParts.join(' · ') || '已记录血糖',
      badgeColor:
        status === '偏高'
          ? 'bg-red-100 text-red-600'
          : status === '偏低'
            ? 'bg-amber-100 text-amber-700'
            : 'bg-emerald-100 text-emerald-600',
      badgeLabel: '血糖',
    }
  }

  if (metricType === METRIC_TYPES.BLOOD_PRESSURE) {
    const systolic = typeof details.systolic === 'number' ? details.systolic : null
    const diastolic = typeof details.diastolic === 'number' ? details.diastolic : null
    const heartRate = typeof details.heartRate === 'number' ? details.heartRate : null
    const bpSceneMap = {
      rest: '静息',
      morning: '晨起',
      evening: '睡前',
      after_exercise: '运动后',
    }
    const scene = bpSceneMap[details.bpScene] || '血压'
    const main =
      systolic != null && diastolic != null ? `${systolic}/${diastolic} mmHg` : '血压'
    const descParts = [scene, heartRate != null ? `心率 ${heartRate}` : null].filter(Boolean)

    // 判断血压状态：正常 <120/80，偏高 >=140/90
    let status = '正常'
    if (systolic != null && diastolic != null) {
      if (systolic >= 140 || diastolic >= 90) {
        status = '偏高'
      } else if (systolic < 90 || diastolic < 60) {
        status = '偏低'
      }
    }

    return {
      icon: '💓',
      title: `${timeLabel} ${main}`,
      desc: descParts.join(' · ') || '已记录血压',
      badgeColor:
        status === '偏高'
          ? 'bg-red-100 text-red-600'
          : status === '偏低'
            ? 'bg-amber-100 text-amber-700'
            : 'bg-emerald-100 text-emerald-600',
      badgeLabel: '血压',
    }
  }

  if (metricType === METRIC_TYPES.LIPID) {
    const tc = typeof details.tc === 'number' ? details.tc : null
    const tg = typeof details.tg === 'number' ? details.tg : null
    const hdl = typeof details.hdl === 'number' ? details.hdl : null
    const ldl = typeof details.ldl === 'number' ? details.ldl : null
    const lipidSceneMap = {
      fasting: '空腹',
      random: '随机',
    }
    const scene = lipidSceneMap[details.lipidScene] || '血脂'
    const parts = []
    if (tc != null) parts.push(`TC ${tc.toFixed(2)}`)
    if (tg != null) parts.push(`TG ${tg.toFixed(2)}`)
    if (ldl != null) parts.push(`LDL ${ldl.toFixed(2)}`)
    if (hdl != null) parts.push(`HDL ${hdl.toFixed(2)}`)
    const main = parts.length > 0 ? parts.join(' / ') : '血脂'

    return {
      icon: '🧬',
      title: `${timeLabel} ${scene}`,
      desc: main || '已记录血脂',
      badgeColor: 'bg-blue-100 text-blue-600',
      badgeLabel: '血脂',
    }
  }

  // 默认
  return {
    icon: '📌',
    title: timeLabel,
    desc: '已记录',
    badgeColor: 'bg-gray-100 text-gray-500',
    badgeLabel: '健康数据',
  }
}

/**
 * 计算今日摘要
 */
export const calculateTodaySummary = (records) => {
  if (!records.length) {
    return {
      emoji: '🩸',
      main: '今日健康数据',
      sub: '还没有记录，点击下方按钮开始',
    }
  }

  const latest = records[0]
  const details = parseDetails(latest.detailsRaw)
  const metricType = details.metricType || 'glucose'

  if (metricType === METRIC_TYPES.GLUCOSE) {
    const value = typeof details.value === 'number' ? details.value : null
    if (value == null) {
      return {
        emoji: '📊',
        main: '今日有记录',
        sub: `共 ${records.length} 条血糖记录`,
      }
    }
    const status = value < 3.9 ? '偏低' : value > 10 ? '偏高' : '在目标范围内'
    return {
      emoji: '📊',
      main: `${value.toFixed(1)} mmol/L`,
      sub: `最近一次血糖 · ${status}`,
    }
  }

  if (metricType === METRIC_TYPES.BLOOD_PRESSURE) {
    const systolic = typeof details.systolic === 'number' ? details.systolic : null
    const diastolic = typeof details.diastolic === 'number' ? details.diastolic : null
    if (systolic == null || diastolic == null) {
      return {
        emoji: '💓',
        main: '今日有记录',
        sub: `共 ${records.length} 条血压记录`,
      }
    }
    return {
      emoji: '💓',
      main: `${systolic}/${diastolic} mmHg`,
      sub: `最近一次血压`,
    }
  }

  if (metricType === METRIC_TYPES.LIPID) {
    return {
      emoji: '🧬',
      main: '今日有记录',
      sub: `共 ${records.length} 条血脂记录`,
    }
  }

  return {
    emoji: '📊',
    main: '今日有记录',
    sub: `共 ${records.length} 条健康数据`,
  }
}
