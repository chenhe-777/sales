import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { format } from 'date-fns'
import type { 
  SalesPersonData, 
  PosterConfig, 
  PosterTemplate, 
  StatisticsData,
  TemplateStyle 
} from '@/types'

export const useSalesStore = defineStore('sales', () => {
  // 状态
  const currentDate = ref(format(new Date(), 'yyyy-MM-dd'))
  const salesData = ref<SalesPersonData[]>([])
  const selectedTemplate = ref<PosterTemplate>('business')
  const isPreviewVisible = ref(false)
  const isExporting = ref(false)

  // 海报配置
  const posterConfig = ref<PosterConfig>({
    template: 'business',
    title: '今日战报',
    subtitle: '团队业绩概览',
    motivationalText: '再接再厉，冲向目标！',
    showLogo: true,
    companyName: '',
    backgroundColor: '#f8fafc',
    primaryColor: '#4f46e5',
    secondaryColor: '#10b981',
    fontFamily: 'PingFang SC',
    width: 1080,
    height: 1350
  })

  // 模板样式配置
  const templateStyles: TemplateStyle[] = [
    {
      name: 'business',
      displayName: '商务风格',
      preview: '/templates/business.png',
      backgroundColor: '#f8fafc',
      primaryColor: '#4f46e5',
      secondaryColor: '#10b981',
      textColor: '#1f2937',
      description: '专业商务风格，适合正式场合'
    },
    {
      name: 'tech',
      displayName: '科技风格',
      preview: '/templates/tech.png',
      backgroundColor: '#0f172a',
      primaryColor: '#06b6d4',
      secondaryColor: '#8b5cf6',
      textColor: '#f1f5f9',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      description: '现代科技感，炫酷视觉效果'
    },
    {
      name: 'minimal',
      displayName: '简约风格',
      preview: '/templates/minimal.png',
      backgroundColor: '#ffffff',
      primaryColor: '#374151',
      secondaryColor: '#6b7280',
      textColor: '#111827',
      description: '简洁优雅，突出数据内容'
    },
    {
      name: 'gradient',
      displayName: '渐变风格',
      preview: '/templates/gradient.png',
      backgroundColor: '#fef3c7',
      primaryColor: '#f59e0b',
      secondaryColor: '#ef4444',
      textColor: '#92400e',
      gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      description: '温暖渐变色彩，活力四射'
    },
    {
      name: 'celebration',
      displayName: '庆祝风格',
      preview: '/templates/celebration.png',
      backgroundColor: '#ecfdf5',
      primaryColor: '#10b981',
      secondaryColor: '#f59e0b',
      textColor: '#064e3b',
      gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
      description: '节日庆祝，表彰优秀表现'
    }
  ]

  // 计算属性
  const totalNewContract = computed(() => {
    return salesData.value.reduce((sum: number, person: SalesPersonData) => sum + person.newContractAmount, 0)
  })

  const totalPayment = computed(() => {
    return salesData.value.reduce((sum: number, person: SalesPersonData) => sum + person.paymentAmount, 0)
  })

  const averageNewContract = computed(() => {
    return salesData.value.length > 0 ? totalNewContract.value / salesData.value.length : 0
  })

  const averagePayment = computed(() => {
    return salesData.value.length > 0 ? totalPayment.value / salesData.value.length : 0
  })

  const topPerformer = computed(() => {
    if (salesData.value.length === 0) return null
    return salesData.value.reduce((top: SalesPersonData, current: SalesPersonData) => {
      const topTotal = top.newContractAmount + top.paymentAmount
      const currentTotal = current.newContractAmount + current.paymentAmount
      return currentTotal > topTotal ? current : top
    })
  })

  const statistics = computed<StatisticsData>(() => ({
    totalNewContract: totalNewContract.value,
    totalPayment: totalPayment.value,
    averageNewContract: averageNewContract.value,
    averagePayment: averagePayment.value,
    topPerformer: topPerformer.value,
    performanceRate: totalNewContract.value > 0 ? (totalPayment.value / totalNewContract.value) * 100 : 0
  }))

  const currentTemplateStyle = computed(() => {
    return templateStyles.find(style => style.name === selectedTemplate.value) || templateStyles[0]
  })

  // 方法
  const addSalesPerson = (person: Omit<SalesPersonData, 'id'>) => {
    const newPerson: SalesPersonData = {
      ...person,
      id: Date.now().toString()
    }
    salesData.value.push(newPerson)
  }

  const updateSalesPerson = (id: string, updates: Partial<SalesPersonData>) => {
    const index = salesData.value.findIndex((person: SalesPersonData) => person.id === id)
    if (index !== -1) {
      salesData.value[index] = { ...salesData.value[index], ...updates }
    }
  }

  const removeSalesPerson = (id: string) => {
    const index = salesData.value.findIndex((person: SalesPersonData) => person.id === id)
    if (index !== -1) {
      salesData.value.splice(index, 1)
    }
  }

  const clearAllData = () => {
    salesData.value = []
  }

  const setTemplate = (template: PosterTemplate) => {
    selectedTemplate.value = template
    posterConfig.value.template = template
    
    // 更新海报配置以匹配模板样式
    const style = templateStyles.find(s => s.name === template)
    if (style) {
      posterConfig.value.backgroundColor = style.backgroundColor
      posterConfig.value.primaryColor = style.primaryColor
      posterConfig.value.secondaryColor = style.secondaryColor
    }
  }

  const updatePosterConfig = (updates: Partial<PosterConfig>) => {
    posterConfig.value = { ...posterConfig.value, ...updates }
  }

  const setCurrentDate = (date: string) => {
    currentDate.value = date
  }

  const togglePreview = () => {
    isPreviewVisible.value = !isPreviewVisible.value
  }

  const setExporting = (status: boolean) => {
    isExporting.value = status
  }

  // 保存数据到本地存储
  const saveToLocalStorage = () => {
    const data = {
      currentDate: currentDate.value,
      salesData: salesData.value,
      posterConfig: posterConfig.value,
      selectedTemplate: selectedTemplate.value
    }
    localStorage.setItem('salesPosterData', JSON.stringify(data))
  }

  // 从本地存储加载数据
  const loadFromLocalStorage = () => {
    const saved = localStorage.getItem('salesPosterData')
    if (saved) {
      try {
        const data = JSON.parse(saved)
        currentDate.value = data.currentDate || format(new Date(), 'yyyy-MM-dd')
        salesData.value = data.salesData || []
        posterConfig.value = { ...posterConfig.value, ...data.posterConfig }
        selectedTemplate.value = data.selectedTemplate || 'business'
      } catch (error) {
        console.error('加载本地数据失败:', error)
      }
    }
  }

  return {
    // 状态
    currentDate,
    salesData,
    selectedTemplate,
    isPreviewVisible,
    isExporting,
    posterConfig,
    templateStyles,
    
    // 计算属性
    totalNewContract,
    totalPayment,
    averageNewContract,
    averagePayment,
    topPerformer,
    statistics,
    currentTemplateStyle,
    
    // 方法
    addSalesPerson,
    updateSalesPerson,
    removeSalesPerson,
    clearAllData,
    setTemplate,
    updatePosterConfig,
    setCurrentDate,
    togglePreview,
    setExporting,
    saveToLocalStorage,
    loadFromLocalStorage
  }
}) 