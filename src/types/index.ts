// 销售人员数据接口
export interface SalesPersonData {
  id: string
  name: string
  newContractAmount: number // 新签合同额（万元）
  paymentAmount: number // 回款额（万元）
  avatar?: string
}

// 每日销售数据
export interface DailySalesData {
  date: string
  salesData: SalesPersonData[]
  totalNewContract: number
  totalPayment: number
}

// 海报模板类型
export type PosterTemplate = 'business' | 'tech' | 'minimal' | 'gradient' | 'celebration'

// 海报配置接口
export interface PosterConfig {
  template: PosterTemplate
  title: string
  subtitle: string
  motivationalText: string
  showLogo: boolean
  logoUrl?: string
  companyName: string
  backgroundColor: string
  primaryColor: string
  secondaryColor: string
  fontFamily: string
  width: number
  height: number
}

// 模板样式配置
export interface TemplateStyle {
  name: string
  displayName: string
  preview: string
  backgroundColor: string
  primaryColor: string
  secondaryColor: string
  textColor: string
  gradient?: string
  description: string
}

// 导出格式
export type ExportFormat = 'png' | 'jpg' | 'pdf'

// 导出选项
export interface ExportOptions {
  format: ExportFormat
  quality: number
  width: number
  height: number
  dpi: number
}

// 应用状态接口
export interface AppState {
  currentDate: string
  salesData: SalesPersonData[]
  posterConfig: PosterConfig
  selectedTemplate: PosterTemplate
  isPreviewVisible: boolean
  isExporting: boolean
}

// 表单验证规则
export interface ValidationRule {
  required?: boolean
  min?: number
  max?: number
  pattern?: RegExp
  message: string
  trigger?: string[]
}

// 统计数据
export interface StatisticsData {
  totalNewContract: number
  totalPayment: number
  averageNewContract: number
  averagePayment: number
  topPerformer: SalesPersonData | null
  performanceRate: number
} 