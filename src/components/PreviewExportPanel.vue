<template>
  <div class="preview-export-panel">
    <!-- 操作栏 -->
    <div class="action-bar">
      <div class="action-left">
        <h3 class="section-title">海报预览</h3>
        <span class="section-subtitle">预览并导出您的销售业绩海报</span>
      </div>
      <div class="action-right">
        <el-button-group>
          <el-button 
            @click="refreshPreview"
            :icon="Refresh"
            :loading="isGenerating"
          >
            刷新预览
          </el-button>
          <el-button 
            type="primary" 
            @click="copyToClipboard"
            :icon="CopyDocument"
            :loading="isCopying"
          >
            复制到剪贴板
          </el-button>
          <el-button 
            type="success"
            @click="showExportDialog = true"
            :icon="Download"
          >
            导出海报
          </el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 预览区域 -->
    <div class="preview-container">
      <div v-if="salesStore.salesData.length === 0" class="empty-state">
        <el-empty description="暂无数据">
          <template #image>
            <el-icon size="80"><PictureRounded /></el-icon>
          </template>
          <p>请先在数据录入页面添加销售人员信息</p>
          <el-button type="primary" @click="$emit('switchTab', 'input')">
            前往录入数据
          </el-button>
        </el-empty>
      </div>

      <div v-else class="poster-preview">
        <div class="preview-wrapper" :style="previewWrapperStyle">
          <canvas 
            ref="canvasRef"
            :width="salesStore.posterConfig.width"
            :height="salesStore.posterConfig.height"
            class="poster-canvas"
          ></canvas>
        </div>
        
        <div class="preview-info">
          <div class="info-item">
            <span class="info-label">模板:</span>
            <span class="info-value">{{ salesStore.currentTemplateStyle.displayName }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">尺寸:</span>
            <span class="info-value">{{ salesStore.posterConfig.width }} × {{ salesStore.posterConfig.height }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">人数:</span>
            <span class="info-value">{{ salesStore.salesData.length }} 人</span>
          </div>
          <div class="info-item">
            <span class="info-label">总业绩:</span>
            <span class="info-value">{{ (salesStore.totalNewContract + salesStore.totalPayment).toFixed(1) }} 万元</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 导出对话框 -->
    <el-dialog
      v-model="showExportDialog"
      title="导出海报"
      width="500px"
    >
      <div class="export-options">
        <el-form label-width="80px">
          <el-form-item label="格式">
            <el-radio-group v-model="exportFormat">
              <el-radio label="png">PNG (推荐)</el-radio>
              <el-radio label="jpg">JPG</el-radio>
            </el-radio-group>
          </el-form-item>
          
          <el-form-item label="质量">
            <el-slider 
              v-model="exportQuality"
              :min="0.1"
              :max="1"
              :step="0.1"
              show-tooltip
              :format-tooltip="(val) => `${Math.round(val * 100)}%`"
            />
          </el-form-item>
          
          <el-form-item label="DPI">
            <el-select v-model="exportDPI">
              <el-option label="72 DPI (屏幕)" :value="72" />
              <el-option label="150 DPI (网络)" :value="150" />
              <el-option label="300 DPI (打印)" :value="300" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <el-button @click="showExportDialog = false">取消</el-button>
        <el-button 
          type="primary" 
          @click="exportPoster"
          :loading="isExporting"
        >
          导出
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { format } from 'date-fns'
import { useSalesStore } from '@/stores/salesStore'
import { 
  Refresh, 
  CopyDocument, 
  Download, 
  PictureRounded 
} from '@element-plus/icons-vue'

const emit = defineEmits(['switchTab'])
const salesStore = useSalesStore()

// 响应式数据
const canvasRef = ref<HTMLCanvasElement>()
const showExportDialog = ref(false)
const isGenerating = ref(false)
const isCopying = ref(false)
const isExporting = ref(false)
const exportFormat = ref<'png' | 'jpg'>('png')
const exportQuality = ref(0.9)
const exportDPI = ref(150)

// 计算预览容器样式
const previewWrapperStyle = computed(() => {
  const config = salesStore.posterConfig
  const maxWidth = 600
  const scale = Math.min(maxWidth / config.width, maxWidth / config.height)
  
  return {
    width: `${config.width * scale}px`,
    height: `${config.height * scale}px`,
    transform: `scale(${scale})`,
    transformOrigin: 'top left'
  }
})

// 简化的海报生成函数
const generatePoster = async () => {
  if (!canvasRef.value || salesStore.salesData.length === 0) return
  
  isGenerating.value = true
  
  try {
    const canvas = canvasRef.value
    const ctx = canvas.getContext('2d')!
    const config = salesStore.posterConfig
    const template = salesStore.currentTemplateStyle
    
    // 清空画布
    ctx.clearRect(0, 0, config.width, config.height)
    
    // 设置背景
    if (template.gradient) {
      const gradient = ctx.createLinearGradient(0, 0, config.width, config.height)
      gradient.addColorStop(0, template.primaryColor)
      gradient.addColorStop(1, template.secondaryColor)
      ctx.fillStyle = gradient
    } else {
      ctx.fillStyle = template.backgroundColor
    }
    ctx.fillRect(0, 0, config.width, config.height)
    
    // 设置字体
    ctx.fillStyle = template.textColor
    ctx.textAlign = 'center'
    
    // 绘制标题
    ctx.font = `bold ${config.width * 0.06}px ${config.fontFamily}`
    ctx.fillText(config.title, config.width / 2, config.height * 0.15)
    
    // 绘制副标题
    ctx.font = `${config.width * 0.04}px ${config.fontFamily}`
    ctx.fillText(config.subtitle, config.width / 2, config.height * 0.22)
    
    // 绘制日期
    const dateText = format(new Date(salesStore.currentDate), 'yyyy年MM月dd日')
    ctx.font = `${config.width * 0.03}px ${config.fontFamily}`
    ctx.fillText(dateText, config.width / 2, config.height * 0.28)
    
    // 绘制统计信息
    const startY = config.height * 0.35
    const boxHeight = config.height * 0.08
    const boxWidth = config.width * 0.4
    
    // 新签合同框
    ctx.fillStyle = template.primaryColor
    ctx.fillRect(config.width * 0.1, startY, boxWidth, boxHeight)
    ctx.fillStyle = '#ffffff'
    ctx.font = `${config.width * 0.025}px ${config.fontFamily}`
    ctx.fillText('新签合同', config.width * 0.3, startY + boxHeight * 0.4)
    ctx.font = `bold ${config.width * 0.035}px ${config.fontFamily}`
    ctx.fillText(`${salesStore.totalNewContract.toFixed(1)}万`, config.width * 0.3, startY + boxHeight * 0.75)
    
    // 回款金额框
    ctx.fillStyle = template.secondaryColor
    ctx.fillRect(config.width * 0.5, startY, boxWidth, boxHeight)
    ctx.fillStyle = '#ffffff'
    ctx.font = `${config.width * 0.025}px ${config.fontFamily}`
    ctx.fillText('回款金额', config.width * 0.7, startY + boxHeight * 0.4)
    ctx.font = `bold ${config.width * 0.035}px ${config.fontFamily}`
    ctx.fillText(`${salesStore.totalPayment.toFixed(1)}万`, config.width * 0.7, startY + boxHeight * 0.75)
    
    // 绘制销售人员列表
    ctx.fillStyle = template.textColor
    const listStartY = config.height * 0.5
    const itemHeight = config.height * 0.06
    
    salesStore.salesData.forEach((person, index) => {
      const y = listStartY + index * itemHeight
      if (y > config.height * 0.85) return // 防止超出画布
      
      // 排名
      ctx.font = `bold ${config.width * 0.025}px ${config.fontFamily}`
      ctx.textAlign = 'left'
      ctx.fillText(`${index + 1}`, config.width * 0.1, y)
      
      // 姓名
      ctx.font = `${config.width * 0.03}px ${config.fontFamily}`
      ctx.fillText(person.name, config.width * 0.2, y)
      
      // 新签金额
      ctx.textAlign = 'center'
      ctx.fillText(`${person.newContractAmount.toFixed(1)}`, config.width * 0.5, y)
      
      // 回款金额
      ctx.fillText(`${person.paymentAmount.toFixed(1)}`, config.width * 0.7, y)
      
      // 总计
      ctx.font = `bold ${config.width * 0.03}px ${config.fontFamily}`
      ctx.fillText(`${(person.newContractAmount + person.paymentAmount).toFixed(1)}`, config.width * 0.85, y)
    })
    
    // 绘制鼓励语
    ctx.fillStyle = template.primaryColor
    ctx.font = `bold ${config.width * 0.035}px ${config.fontFamily}`
    ctx.textAlign = 'center'
    ctx.fillText(config.motivationalText, config.width / 2, config.height * 0.92)
    
    // 绘制公司名称
    if (config.companyName) {
      ctx.fillStyle = template.textColor
      ctx.font = `${config.width * 0.025}px ${config.fontFamily}`
      ctx.fillText(config.companyName, config.width / 2, config.height * 0.97)
    }
    
  } catch (error) {
    console.error('生成海报失败:', error)
    ElMessage.error('生成海报失败，请重试')
  } finally {
    isGenerating.value = false
  }
}

const refreshPreview = async () => {
  await generatePoster()
  ElMessage.success('预览已刷新')
}

const copyToClipboard = async () => {
  if (!canvasRef.value) return
  
  isCopying.value = true
  
  try {
    const canvas = canvasRef.value
    canvas.toBlob(async (blob) => {
      if (blob) {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ])
          ElMessage.success('海报已复制到剪贴板')
        } catch (error) {
          // 降级方案：下载图片
          downloadCanvas('销售业绩海报.png')
          ElMessage.success('已下载海报图片')
        }
      }
      isCopying.value = false
    })
  } catch (error) {
    console.error('复制失败:', error)
    ElMessage.error('复制失败，请使用导出功能')
    isCopying.value = false
  }
}

const exportPoster = async () => {
  if (!canvasRef.value) return
  
  isExporting.value = true
  
  try {
    const fileName = `销售业绩海报_${format(new Date(salesStore.currentDate), 'yyyyMMdd')}.${exportFormat.value}`
    downloadCanvas(fileName)
    
    ElMessage.success('海报导出成功')
    showExportDialog.value = false
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败，请重试')
  } finally {
    isExporting.value = false
  }
}

const downloadCanvas = (fileName: string) => {
  const canvas = canvasRef.value!
  const link = document.createElement('a')
  
  canvas.toBlob((blob) => {
    if (blob) {
      const url = URL.createObjectURL(blob)
      link.href = url
      link.download = fileName
      link.click()
      URL.revokeObjectURL(url)
    }
  }, `image/${exportFormat.value}`, exportQuality.value)
}

// 监听数据变化，自动重新生成海报
watch(
  [
    () => salesStore.salesData,
    () => salesStore.posterConfig,
    () => salesStore.selectedTemplate,
    () => salesStore.currentDate
  ],
  () => {
    nextTick(() => {
      generatePoster()
    })
  },
  { deep: true }
)

// 生命周期
onMounted(async () => {
  await nextTick()
  await generatePoster()
})
</script>

<style lang="scss" scoped>
@use "@/styles/variables" as *;
.preview-export-panel {
  .action-bar {
    @include flex-between;
    margin-bottom: var(--spacing-xl);
    padding: var(--spacing-lg);
    background: var(--card-bg);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);

    .action-left {
      .section-title {
        font-size: 20px;
        font-weight: 600;
        color: var(--text-primary);
        margin: 0 0 var(--spacing-xs) 0;
      }

      .section-subtitle {
        font-size: 14px;
        color: var(--text-secondary);
      }
    }

    .action-right {
      .el-button-group {
        .el-button {
          @media (max-width: 768px) {
            padding: 8px 12px;
            font-size: 14px;
          }
        }
      }
    }
  }

  .preview-container {
    background: var(--card-bg);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    overflow: hidden;

    .empty-state {
      padding: var(--spacing-2xl);
      text-align: center;

      :deep(.el-empty__image) {
        margin-bottom: var(--spacing-lg);
      }

      p {
        margin: var(--spacing-lg) 0;
        color: var(--text-secondary);
      }
    }

    .poster-preview {
      padding: var(--spacing-xl);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-xl);

      .preview-wrapper {
        background: #f5f5f5;
        border-radius: var(--radius-md);
        padding: var(--spacing-lg);
        box-shadow: var(--shadow-lg);
        position: relative;
        overflow: hidden;

        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
                      linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
                      linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
                      linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
          background-size: 20px 20px;
          background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
          opacity: 0.5;
          z-index: 0;
        }

        .poster-canvas {
          position: relative;
          z-index: 1;
          border-radius: var(--radius-sm);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          max-width: 100%;
          height: auto;
        }
      }

      .preview-info {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: var(--spacing-lg);
        width: 100%;
        max-width: 600px;

        .info-item {
          background: var(--bg-color);
          padding: var(--spacing-md);
          border-radius: var(--radius-md);
          text-align: center;

          .info-label {
            display: block;
            font-size: 12px;
            color: var(--text-secondary);
            margin-bottom: var(--spacing-xs);
          }

          .info-value {
            display: block;
            font-size: 16px;
            font-weight: 600;
            color: var(--text-primary);
          }
        }
      }
    }
  }

  .export-options {
    :deep(.el-form-item) {
      margin-bottom: var(--spacing-lg);

      &:last-child {
        margin-bottom: 0;
      }

      .el-form-item__label {
        font-weight: 500;
        color: var(--text-primary);
      }
    }

    :deep(.el-radio-group) {
      .el-radio {
        margin-right: var(--spacing-lg);
      }
    }
  }
}

// 响应式适配
@media (max-width: 768px) {
  .preview-export-panel {
    .action-bar {
      flex-direction: column;
      gap: var(--spacing-md);
      align-items: flex-start;

      .action-right {
        width: 100%;
        
        .el-button-group {
          width: 100%;
          display: flex;
          
          .el-button {
            flex: 1;
          }
        }
      }
    }

    .preview-container {
      .poster-preview {
        padding: var(--spacing-lg);

        .preview-info {
          grid-template-columns: repeat(2, 1fr);
          gap: var(--spacing-md);
        }
      }
    }
  }
}
</style> 