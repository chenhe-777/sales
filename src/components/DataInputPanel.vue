<template>
  <div class="data-input-panel">
    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">
          <el-icon size="24"><User /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ salesStore.salesData.length }}</div>
          <div class="stat-label">销售人员</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon success">
          <el-icon size="24"><Money /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ salesStore.totalNewContract.toFixed(1) }}</div>
          <div class="stat-label">新签合同 (万元)</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon warning">
          <el-icon size="24"><Wallet /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ salesStore.totalPayment.toFixed(1) }}</div>
          <div class="stat-label">回款金额 (万元)</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon info">
          <el-icon size="24"><TrendCharts /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ salesStore.statistics.performanceRate.toFixed(1) }}%</div>
          <div class="stat-label">回款比例</div>
        </div>
      </div>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar">
      <div class="action-left">
        <h3 class="section-title">销售数据录入</h3>
        <span class="section-subtitle">录入当日销售人员的业绩数据</span>
      </div>
      <div class="action-right">
        <el-button 
          type="primary" 
          @click="showAddDialog = true"
          :icon="Plus"
        >
          添加人员
        </el-button>
        <el-button 
          v-if="salesStore.salesData.length > 0"
          type="danger"
          @click="handleClearAll"
          :icon="Delete"
        >
          清空数据
        </el-button>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="data-table-container">
      <el-table 
        :data="salesStore.salesData" 
        stripe
        class="data-table"
        empty-text="暂无数据，点击添加人员开始录入"
      >
        <el-table-column label="序号" type="index" width="60" align="center" />
        
        <el-table-column label="销售人员" prop="name" min-width="120">
          <template #default="{ row }">
            <div class="person-info">
              <el-avatar 
                :size="32" 
                :src="row.avatar" 
                class="person-avatar"
              >
                {{ row.name.charAt(0) }}
              </el-avatar>
              <span class="person-name">{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="新签合同额" prop="newContractAmount" width="140" align="right">
          <template #default="{ row }">
            <span class="amount-value success">{{ row.newContractAmount.toFixed(1) }} 万</span>
          </template>
        </el-table-column>
        
        <el-table-column label="回款金额" prop="paymentAmount" width="140" align="right">
          <template #default="{ row }">
            <span class="amount-value warning">{{ row.paymentAmount.toFixed(1) }} 万</span>
          </template>
        </el-table-column>
        
        <el-table-column label="总计" width="140" align="right">
          <template #default="{ row }">
            <span class="amount-value primary">{{ (row.newContractAmount + row.paymentAmount).toFixed(1) }} 万</span>
          </template>
        </el-table-column>
        
        <el-table-column label="占比" width="100" align="center">
          <template #default="{ row }">
            <el-tag 
              :type="getPerformanceLevel(row.newContractAmount + row.paymentAmount).type"
              size="small"
            >
              {{ getPerformanceLevel(row.newContractAmount + row.paymentAmount).label }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="120" align="center">
          <template #default="{ row }">
            <el-button 
              size="small" 
              @click="editPerson(row)"
              :icon="Edit"
            >
              编辑
            </el-button>
            <el-button 
              size="small" 
              type="danger"
              @click="deletePerson(row.id)"
              :icon="Delete"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="editingPerson ? '编辑销售人员' : '添加销售人员'"
      width="500px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="姓名" prop="name">
          <el-input 
            v-model="form.name" 
            placeholder="请输入销售人员姓名"
            clearable
          />
        </el-form-item>
        
        <el-form-item label="新签合同额" prop="newContractAmount">
          <el-input-number
            v-model="form.newContractAmount"
            :min="0"
            :max="9999"
            :precision="1"
            :step="0.1"
            placeholder="请输入新签合同额"
            style="width: 100%"
          >
            <template #append>万元</template>
          </el-input-number>
        </el-form-item>
        
        <el-form-item label="回款金额" prop="paymentAmount">
          <el-input-number
            v-model="form.paymentAmount"
            :min="0"
            :max="9999"
            :precision="1"
            :step="0.1"
            placeholder="请输入回款金额"
            style="width: 100%"
          >
            <template #append>万元</template>
          </el-input-number>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">
          {{ editingPerson ? '更新' : '添加' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useSalesStore } from '@/stores/salesStore'
import type { SalesPersonData } from '@/types'
import { Plus, Delete, Edit, User, Money, Wallet, TrendCharts } from '@element-plus/icons-vue'

const salesStore = useSalesStore()

// 响应式数据
const showAddDialog = ref(false)
const editingPerson = ref<SalesPersonData | null>(null)
const formRef = ref()

// 表单数据
const form = reactive({
  name: '',
  newContractAmount: 0,
  paymentAmount: 0
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入销售人员姓名', trigger: 'blur' },
    { min: 2, max: 10, message: '姓名长度在 2 到 10 个字符', trigger: 'blur' }
  ],
  newContractAmount: [
    { required: true, message: '请输入新签合同额', trigger: 'blur' },
    { type: 'number', min: 0, message: '金额不能为负数', trigger: 'blur' }
  ],
  paymentAmount: [
    { required: true, message: '请输入回款金额', trigger: 'blur' },
    { type: 'number', min: 0, message: '金额不能为负数', trigger: 'blur' }
  ]
}

// 方法
const resetForm = () => {
  form.name = ''
  form.newContractAmount = 0
  form.paymentAmount = 0
  editingPerson.value = null
  formRef.value?.clearValidate()
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    
    if (editingPerson.value) {
      // 编辑模式
      salesStore.updateSalesPerson(editingPerson.value.id, {
        name: form.name,
        newContractAmount: form.newContractAmount,
        paymentAmount: form.paymentAmount
      })
      ElMessage.success('更新成功！')
    } else {
      // 添加模式
      salesStore.addSalesPerson({
        name: form.name,
        newContractAmount: form.newContractAmount,
        paymentAmount: form.paymentAmount
      })
      ElMessage.success('添加成功！')
    }
    
    salesStore.saveToLocalStorage()
    showAddDialog.value = false
    resetForm()
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const editPerson = (person: SalesPersonData) => {
  editingPerson.value = person
  form.name = person.name
  form.newContractAmount = person.newContractAmount
  form.paymentAmount = person.paymentAmount
  showAddDialog.value = true
}

const deletePerson = async (id: string) => {
  try {
    await ElMessageBox.confirm(
      '确认删除该销售人员的数据吗？',
      '删除确认',
      {
        type: 'warning',
        confirmButtonText: '确认删除',
        cancelButtonText: '取消'
      }
    )
    
    salesStore.removeSalesPerson(id)
    salesStore.saveToLocalStorage()
    ElMessage.success('删除成功！')
  } catch {
    // 用户取消删除
  }
}

const handleClearAll = async () => {
  try {
    await ElMessageBox.confirm(
      '确认清空所有销售数据吗？此操作不可恢复！',
      '清空确认',
      {
        type: 'warning',
        confirmButtonText: '确认清空',
        cancelButtonText: '取消'
      }
    )
    
    salesStore.clearAllData()
    salesStore.saveToLocalStorage()
    ElMessage.success('数据已清空！')
  } catch {
    // 用户取消清空
  }
}

const getPerformanceLevel = (total: number) => {
  if (salesStore.salesData.length === 0) return { type: '', label: '-' }
  
  const max = Math.max(...salesStore.salesData.map(p => p.newContractAmount + p.paymentAmount))
  const percentage = (total / max) * 100
  
  if (percentage >= 80) return { type: 'success', label: '优秀' }
  if (percentage >= 60) return { type: 'warning', label: '良好' }
  if (percentage >= 40) return { type: 'info', label: '中等' }
  return { type: 'danger', label: '待提升' }
}
</script>

<style lang="scss" scoped>
@use "@/styles/variables" as *;
.data-input-panel {
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-xl);

    .stat-card {
      background: var(--card-bg);
      border-radius: var(--radius-lg);
      padding: var(--spacing-lg);
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      box-shadow: var(--shadow-sm);
      @include hover-lift;

      .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: var(--radius-md);
        @include flex-center;
        background: var(--primary-color);
        color: white;

        &.success {
          background: var(--success-color);
        }

        &.warning {
          background: var(--warning-color);
        }

        &.info {
          background: var(--info-color);
        }
      }

      .stat-content {
        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1;
        }

        .stat-label {
          font-size: 14px;
          color: var(--text-secondary);
          margin-top: var(--spacing-xs);
        }
      }
    }
  }

  .action-bar {
    @include flex-between;
    margin-bottom: var(--spacing-lg);
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
      display: flex;
      gap: var(--spacing-sm);
    }
  }

  .data-table-container {
    background: var(--card-bg);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    overflow: hidden;

    .data-table {
      width: 100%;

      .person-info {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);

        .person-avatar {
          background: var(--primary-color);
        }

        .person-name {
          font-weight: 500;
        }
      }

      .amount-value {
        font-weight: 600;

        &.success {
          color: var(--success-color);
        }

        &.warning {
          color: var(--warning-color);
        }

        &.primary {
          color: var(--primary-color);
        }
      }
    }
  }
}

// 响应式适配
@media (max-width: 768px) {
  .data-input-panel {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: var(--spacing-md);
    }

    .action-bar {
      flex-direction: column;
      gap: var(--spacing-md);
      align-items: flex-start;

      .action-right {
        width: 100%;
        justify-content: flex-start;
      }
    }

    .data-table {
      :deep(.el-table__header),
      :deep(.el-table__body) {
        font-size: 14px;
      }
    }
  }
}
</style> 