<template>
  <div id="app" class="app-container">
    <div class="main-layout">
      <!-- 侧边栏 -->
      <aside class="sidebar" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
        <div class="sidebar-header">
          <div class="logo-container">
            <el-icon class="logo-icon" size="32">
              <TrendCharts />
            </el-icon>
            <h1 v-if="!sidebarCollapsed" class="app-title">销售海报</h1>
          </div>
          <el-button 
            class="collapse-btn hidden-mobile"
            circle 
            size="small" 
            @click="toggleSidebar"
          >
            <el-icon>
              <component :is="sidebarCollapsed ? 'Expand' : 'Fold'" />
            </el-icon>
          </el-button>
        </div>
        
        <nav class="sidebar-nav">
          <div class="nav-item" :class="{ active: activeTab === 'input' }" @click="activeTab = 'input'">
            <el-icon><EditPen /></el-icon>
            <span v-if="!sidebarCollapsed">数据录入</span>
          </div>
          <div class="nav-item" :class="{ active: activeTab === 'template' }" @click="activeTab = 'template'">
            <el-icon><Grid /></el-icon>
            <span v-if="!sidebarCollapsed">模板选择</span>
          </div>
          <div class="nav-item" :class="{ active: activeTab === 'preview' }" @click="activeTab = 'preview'">
            <el-icon><View /></el-icon>
            <span v-if="!sidebarCollapsed">预览导出</span>
          </div>
        </nav>

        <div class="sidebar-footer">
          <div class="stats-summary" v-if="!sidebarCollapsed && salesStore.salesData.length > 0">
            <div class="stat-item">
              <span class="stat-label">今日人数</span>
              <span class="stat-value">{{ salesStore.salesData.length }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">总新签</span>
              <span class="stat-value">{{ salesStore.totalNewContract.toFixed(1) }}万</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">总回款</span>
              <span class="stat-value">{{ salesStore.totalPayment.toFixed(1) }}万</span>
            </div>
          </div>
        </div>
      </aside>

      <!-- 主内容区 -->
      <main class="main-content">
        <header class="content-header">
          <div class="header-left">
            <el-button 
              class="mobile-menu-btn hidden-desktop"
              circle 
              @click="toggleSidebar"
            >
              <el-icon><Menu /></el-icon>
            </el-button>
            <h2 class="page-title">{{ getPageTitle() }}</h2>
          </div>
          <div class="header-right">
            <el-date-picker
              v-model="salesStore.currentDate"
              type="date"
              placeholder="选择日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              @change="handleDateChange"
              class="date-picker"
            />
          </div>
        </header>

        <div class="content-body">
          <!-- 数据录入面板 -->
          <DataInputPanel v-show="activeTab === 'input'" />
          
          <!-- 模板选择面板 -->
          <TemplateSelectionPanel v-show="activeTab === 'template'" />
          
          <!-- 预览导出面板 -->
          <PreviewExportPanel v-show="activeTab === 'preview'" />
        </div>
      </main>
    </div>

    <!-- 移动端遮罩 -->
    <div 
      v-if="!sidebarCollapsed && isMobile" 
      class="sidebar-overlay"
      @click="closeSidebar"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useSalesStore } from '@/stores/salesStore'
import DataInputPanel from '@/components/DataInputPanel.vue'
import TemplateSelectionPanel from '@/components/TemplateSelectionPanel.vue'
import PreviewExportPanel from '@/components/PreviewExportPanel.vue'

const salesStore = useSalesStore()

// 响应式状态
const activeTab = ref('input')
const sidebarCollapsed = ref(false)
const isMobile = ref(window.innerWidth <= 768)

// 方法
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const closeSidebar = () => {
  if (isMobile.value) {
    sidebarCollapsed.value = true
  }
}

const getPageTitle = () => {
  const titles: Record<string, string> = {
    input: '数据录入',
    template: '模板选择', 
    preview: '预览导出'
  }
  return titles[activeTab.value] || '销售海报生成器'
}

const handleDateChange = (date: string) => {
  salesStore.setCurrentDate(date)
  salesStore.saveToLocalStorage()
}

const handleResize = () => {
  isMobile.value = window.innerWidth <= 768
  if (!isMobile.value) {
    sidebarCollapsed.value = false
  } else {
    sidebarCollapsed.value = true
  }
}

// 生命周期
onMounted(() => {
  // 加载本地存储数据
  salesStore.loadFromLocalStorage()
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
  handleResize()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style lang="scss" scoped>
@use "@/styles/variables" as *;
.app-container {
  height: 100vh;
  overflow: hidden;
  background: var(--bg-color);
}

.main-layout {
  display: flex;
  height: 100%;
}

// 侧边栏样式
.sidebar {
  width: 280px;
  background: var(--card-bg);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1000;

  &.sidebar-collapsed {
    width: 70px;
  }

  @media (max-width: 768px) {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    width: 280px;
    transform: translateX(-100%);
    
    &:not(.sidebar-collapsed) {
      transform: translateX(0);
    }
  }
}

.sidebar-header {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
  @include flex-between;

  .logo-container {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);

    .logo-icon {
      color: var(--primary-color);
    }

    .app-title {
      font-size: 20px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }
  }

  .collapse-btn {
    opacity: 0.7;
    &:hover {
      opacity: 1;
    }
  }
}

.sidebar-nav {
  flex: 1;
  padding: var(--spacing-md);

  .nav-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    margin-bottom: var(--spacing-sm);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all 0.2s ease;
    color: var(--text-secondary);

    &:hover {
      background: var(--bg-color);
      color: var(--text-primary);
    }

    &.active {
      background: var(--primary-color);
      color: white;
      @include hover-lift;
    }

    .el-icon {
      font-size: 18px;
    }

    span {
      font-weight: 500;
    }
  }
}

.sidebar-footer {
  padding: var(--spacing-md);
  border-top: 1px solid var(--border-color);

  .stats-summary {
    background: var(--bg-color);
    border-radius: var(--radius-md);
    padding: var(--spacing-md);

    .stat-item {
      @include flex-between;
      margin-bottom: var(--spacing-xs);

      &:last-child {
        margin-bottom: 0;
      }

      .stat-label {
        font-size: 12px;
        color: var(--text-secondary);
      }

      .stat-value {
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-color);
      }
    }
  }
}

// 主内容区样式
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-header {
  padding: var(--spacing-lg);
  background: var(--card-bg);
  border-bottom: 1px solid var(--border-color);
  @include flex-between;

  .header-left {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);

    .mobile-menu-btn {
      @media (min-width: 769px) {
        display: none;
      }
    }

    .page-title {
      font-size: 24px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }
  }

  .header-right {
    .date-picker {
      width: 150px;
    }
  }
}

.content-body {
  flex: 1;
  overflow: auto;
  padding: var(--spacing-lg);
}

// 移动端遮罩
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  
  @media (min-width: 769px) {
    display: none;
  }
}

// 响应式适配
@media (max-width: 768px) {
  .content-header {
    padding: var(--spacing-md);
    
    .header-left .page-title {
      font-size: 20px;
    }
    
    .header-right .date-picker {
      width: 120px;
    }
  }
  
  .content-body {
    padding: var(--spacing-md);
  }
}
</style> 