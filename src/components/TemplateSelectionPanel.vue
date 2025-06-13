<template>
  <div class="template-selection-panel">
    <!-- 模板预览网格 -->
    <div class="template-grid">
      <div 
        v-for="template in salesStore.templateStyles" 
        :key="template.name"
        class="template-card"
        :class="{ 'template-active': salesStore.selectedTemplate === template.name }"
        @click="selectTemplate(template.name)"
      >
        <div class="template-preview" :style="getPreviewStyle(template)">
          <div class="preview-header">
            <div class="preview-title">今日战报</div>
            <div class="preview-date">{{ formatDate(salesStore.currentDate) }}</div>
          </div>
          
          <div class="preview-stats">
            <div class="stat-item">
              <span class="stat-label">新签合同</span>
              <span class="stat-value">{{ salesStore.totalNewContract.toFixed(1) }}万</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">回款金额</span>
              <span class="stat-value">{{ salesStore.totalPayment.toFixed(1) }}万</span>
            </div>
          </div>
          
          <div class="preview-persons">
            <div 
              v-for="(person, index) in salesStore.salesData.slice(0, 3)" 
              :key="person.id"
              class="person-row"
            >
              <span class="person-name">{{ person.name }}</span>
              <span class="person-amount">{{ (person.newContractAmount + person.paymentAmount).toFixed(1) }}</span>
            </div>
            <div v-if="salesStore.salesData.length > 3" class="more-indicator">
              +{{ salesStore.salesData.length - 3 }} 更多
            </div>
          </div>
        </div>
        
        <div class="template-info">
          <div class="template-name">{{ template.displayName }}</div>
          <div class="template-description">{{ template.description }}</div>
          
          <div class="template-actions">
            <el-button 
              v-if="salesStore.selectedTemplate === template.name"
              type="primary" 
              size="small"
              :icon="Check"
            >
              已选中
            </el-button>
            <el-button 
              v-else
              size="small"
              @click.stop="selectTemplate(template.name)"
            >
              选择模板
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 自定义配置面板 -->
    <div class="config-panel">
      <div class="config-header">
        <h3 class="config-title">海报配置</h3>
        <span class="config-subtitle">自定义海报的文案和样式</span>
      </div>

      <div class="config-content">
        <div class="config-section">
          <h4 class="section-title">文案设置</h4>
          <div class="form-grid">
            <el-form-item label="主标题">
              <el-input 
                v-model="salesStore.posterConfig.title"
                placeholder="请输入主标题"
                @input="updateConfig"
              />
            </el-form-item>
            
            <el-form-item label="副标题">
              <el-input 
                v-model="salesStore.posterConfig.subtitle"
                placeholder="请输入副标题"
                @input="updateConfig"
              />
            </el-form-item>
            
            <el-form-item label="鼓励语">
              <el-select 
                v-model="salesStore.posterConfig.motivationalText"
                placeholder="选择鼓励语"
                @change="updateConfig"
                class="full-width"
              >
                <el-option 
                  v-for="text in motivationalTexts" 
                  :key="text"
                  :label="text" 
                  :value="text"
                />
              </el-select>
            </el-form-item>
            
            <el-form-item label="公司名称">
              <el-input 
                v-model="salesStore.posterConfig.companyName"
                placeholder="请输入公司名称"
                @input="updateConfig"
              />
            </el-form-item>
          </div>
        </div>

        <div class="config-section">
          <h4 class="section-title">样式设置</h4>
          <div class="form-grid">
            <el-form-item label="主色调">
              <el-color-picker 
                v-model="salesStore.posterConfig.primaryColor"
                @change="updateConfig"
              />
            </el-form-item>
            
            <el-form-item label="次色调">
              <el-color-picker 
                v-model="salesStore.posterConfig.secondaryColor"
                @change="updateConfig"
              />
            </el-form-item>
            
            <el-form-item label="背景色">
              <el-color-picker 
                v-model="salesStore.posterConfig.backgroundColor"
                @change="updateConfig"
              />
            </el-form-item>
            
            <el-form-item label="字体">
              <el-select 
                v-model="salesStore.posterConfig.fontFamily"
                @change="updateConfig"
              >
                <el-option label="苹方字体" value="PingFang SC" />
                <el-option label="微软雅黑" value="Microsoft YaHei" />
                <el-option label="黑体" value="SimHei" />
                <el-option label="宋体" value="SimSun" />
              </el-select>
            </el-form-item>
          </div>
        </div>

        <div class="config-section">
          <h4 class="section-title">尺寸设置</h4>
          <div class="size-presets">
            <div 
              v-for="preset in sizePresets" 
              :key="preset.name"
              class="size-preset"
              :class="{ 
                active: salesStore.posterConfig.width === preset.width && 
                        salesStore.posterConfig.height === preset.height 
              }"
              @click="selectSizePreset(preset)"
            >
              <div class="preset-name">{{ preset.name }}</div>
              <div class="preset-size">{{ preset.width }} × {{ preset.height }}</div>
              <div class="preset-desc">{{ preset.description }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { format } from 'date-fns'
import { useSalesStore } from '@/stores/salesStore'
import type { PosterTemplate, TemplateStyle } from '@/types'
import { Check } from '@element-plus/icons-vue'

const salesStore = useSalesStore()

// 鼓励语库
const motivationalTexts = [
  '再接再厉，冲向目标！',
  '团结协作，共创辉煌！',
  '业绩斐然，值得骄傲！',
  '挑战自我，超越极限！',
  '勇攀高峰，永不止步！',
  '精诚团结，战无不胜！',
  '奋勇拼搏，成就梦想！',
  '携手共进，创造奇迹！'
]

// 尺寸预设
const sizePresets = [
  {
    name: '微信朋友圈',
    width: 1080,
    height: 1080,
    description: '正方形格式，适合朋友圈分享'
  },
  {
    name: '微信群聊',
    width: 750,
    height: 1334,
    description: '竖版格式，适合群聊转发'
  },
  {
    name: '钉钉群聊',
    width: 800,
    height: 1200,
    description: '钉钉推荐尺寸'
  },
  {
    name: '打印版本',
    width: 1200,
    height: 1600,
    description: 'A4纸张比例，适合打印'
  }
]

// 方法
const selectTemplate = (templateName: PosterTemplate) => {
  salesStore.setTemplate(templateName)
  salesStore.saveToLocalStorage()
}

const getPreviewStyle = (template: TemplateStyle) => {
  const style: Record<string, string> = {
    backgroundColor: template.backgroundColor,
    color: template.textColor,
    border: `2px solid ${template.primaryColor}`
  }
  
  if (template.gradient) {
    style.background = template.gradient
  }
  
  return style
}

const formatDate = (dateStr: string) => {
  return format(new Date(dateStr), 'MM月dd日')
}

const updateConfig = () => {
  salesStore.saveToLocalStorage()
}

const selectSizePreset = (preset: any) => {
  salesStore.updatePosterConfig({
    width: preset.width,
    height: preset.height
  })
  salesStore.saveToLocalStorage()
}
</script>

<style lang="scss" scoped>
@use "@/styles/variables" as *;
.template-selection-panel {
  .template-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--spacing-xl);
    margin-bottom: var(--spacing-2xl);

    .template-card {
      background: var(--card-bg);
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-md);
      transition: all 0.3s ease;
      cursor: pointer;
      border: 2px solid transparent;

      &:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-lg);
      }

      &.template-active {
        border-color: var(--primary-color);
        box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
      }

      .template-preview {
        height: 200px;
        padding: var(--spacing-lg);
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        .preview-header {
          text-align: center;

          .preview-title {
            font-size: 18px;
            font-weight: 700;
            margin-bottom: var(--spacing-xs);
          }

          .preview-date {
            font-size: 12px;
            opacity: 0.8;
          }
        }

        .preview-stats {
          display: flex;
          justify-content: space-around;
          margin: var(--spacing-md) 0;

          .stat-item {
            text-align: center;

            .stat-label {
              display: block;
              font-size: 10px;
              opacity: 0.7;
            }

            .stat-value {
              display: block;
              font-size: 14px;
              font-weight: 600;
              margin-top: 2px;
            }
          }
        }

        .preview-persons {
          .person-row {
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            margin-bottom: 2px;

            .person-name {
              opacity: 0.8;
            }

            .person-amount {
              font-weight: 600;
            }
          }

          .more-indicator {
            text-align: center;
            font-size: 10px;
            opacity: 0.6;
            margin-top: var(--spacing-xs);
          }
        }
      }

      .template-info {
        padding: var(--spacing-lg);
        background: var(--bg-color);

        .template-name {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--spacing-xs);
        }

        .template-description {
          font-size: 14px;
          color: var(--text-secondary);
          margin-bottom: var(--spacing-md);
        }

        .template-actions {
          text-align: right;
        }
      }
    }
  }

  .config-panel {
    background: var(--card-bg);
    border-radius: var(--radius-lg);
    padding: var(--spacing-xl);
    box-shadow: var(--shadow-md);

    .config-header {
      margin-bottom: var(--spacing-xl);

      .config-title {
        font-size: 20px;
        font-weight: 600;
        color: var(--text-primary);
        margin: 0 0 var(--spacing-xs) 0;
      }

      .config-subtitle {
        font-size: 14px;
        color: var(--text-secondary);
      }
    }

    .config-content {
      .config-section {
        margin-bottom: var(--spacing-xl);

        &:last-child {
          margin-bottom: 0;
        }

        .section-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 var(--spacing-lg) 0;
          padding-bottom: var(--spacing-sm);
          border-bottom: 1px solid var(--border-color);
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--spacing-lg);

          :deep(.el-form-item) {
            margin-bottom: 0;

            .el-form-item__label {
              font-weight: 500;
              color: var(--text-primary);
            }
          }

          .full-width {
            width: 100%;
          }
        }

        .size-presets {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--spacing-md);

          .size-preset {
            padding: var(--spacing-md);
            background: var(--bg-color);
            border-radius: var(--radius-md);
            border: 2px solid var(--border-color);
            cursor: pointer;
            transition: all 0.2s ease;
            text-align: center;

            &:hover {
              border-color: var(--primary-color);
              background: rgba(79, 70, 229, 0.05);
            }

            &.active {
              border-color: var(--primary-color);
              background: rgba(79, 70, 229, 0.1);
              
              .preset-name {
                color: var(--primary-color);
              }
            }

            .preset-name {
              font-size: 14px;
              font-weight: 600;
              color: var(--text-primary);
              margin-bottom: var(--spacing-xs);
            }

            .preset-size {
              font-size: 12px;
              color: var(--text-secondary);
              margin-bottom: var(--spacing-xs);
            }

            .preset-desc {
              font-size: 11px;
              color: var(--text-tertiary);
            }
          }
        }
      }
    }
  }
}

// 响应式适配
@media (max-width: 768px) {
  .template-selection-panel {
    .template-grid {
      grid-template-columns: 1fr;
      gap: var(--spacing-lg);
    }

    .config-panel {
      padding: var(--spacing-lg);

      .config-content {
        .config-section {
          .form-grid {
            grid-template-columns: 1fr;
            gap: var(--spacing-md);
          }

          .size-presets {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      }
    }
  }
}
</style> 