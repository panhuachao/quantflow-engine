import React, { createContext, useState, useContext, ReactNode } from 'react';

type Language = 'zh' | 'en';

const translations = {
  zh: {
    // Sidebar
    'nav.workflows': '工作流',
    'nav.algos': '策略库',
    'nav.evals': '回测',
    'nav.dash': '看板',
    'nav.market': '行情',
    'nav.settings': '设置',

    // Header
    'header.system_operational': '系统运行正常',
    'header.search_placeholder': '全局搜索...',
    'header.title.workflows': '工作流编排',
    'header.title.algos': '算法策略库',
    'header.title.evals': '回测评估',
    'header.title.dash': '数据看板库',
    'header.title.market': '市场行情分析',
    'header.title.default': 'QuantFlow AI',

    // Workflow List
    'workflow.title': '策略与工作流',
    'workflow.desc': '管理和部署您的量化交易逻辑。',
    'workflow.new': '新建策略',
    'workflow.search': '搜索工作流...',
    'workflow.status.active': '运行中',
    'workflow.status.draft': '草稿',
    'workflow.updated': '更新于',
    'workflow.nodes': '节点',
    'workflow.btn.configure': '配置',
    'workflow.validate': '验证',
    'workflow.history': '历史',
    'workflow.save': '保存更改',

    // Dashboard List
    'dashboard.title': '数据看板',
    'dashboard.desc': '可视化绩效、风险和市场数据。',
    'dashboard.new': '新建看板',
    'dashboard.widgets': '组件',
    'dashboard.create_card': '创建新看板',

    // Strategy List
    'strategy.title': '投资策略',
    'strategy.desc': '管理和回测您的 Backtrader Python 算法。',
    'strategy.new': '新建算法',
    'strategy.search': '搜索算法...',
    'strategy.btn.edit_code': '编辑代码',

    // Backtest List
    'backtest.title': '回测评估',
    'backtest.desc': '查看自动化策略测试的绩效报告。',
    'backtest.search': '搜索报告...',
    'backtest.col.status': '状态',
    'backtest.col.strategy': '策略 / 标的',
    'backtest.col.date_range': '时间范围',
    'backtest.col.return': '收益率',
    'backtest.col.sharpe': '夏普比率',
    'backtest.col.max_dd': '最大回撤',
    'backtest.col.created': '创建时间',
    'backtest.status.success': '成功',
    'backtest.status.failed': '失败',
    'backtest.status.running': '运行中',
    'backtest.btn.view': '查看报告',

    // Market
    'market.last_price': '最新价',
    'market.change_24h': '24H涨跌',
    'market.btn.refresh': '刷新',
    'market.depth_stats': '深度与统计',
    'market.high_24h': '24H最高',
    'market.low_24h': '24H最低',
    'market.gemini_analyst': 'Gemini 分析师',
    'market.analyzing': '正在分析市场结构...',
    'market.analysis_generated': '基于近期价格行为生成的分析。',
    'market.click_analyze': '点击“分析”以使用 AI 生成即时技术摘要。',
    'market.btn.analyze': '分析市场数据',
    'market.btn.update_analysis': '更新分析',
  },
  en: {
    // Sidebar
    'nav.workflows': 'Workflows',
    'nav.algos': 'Algos',
    'nav.evals': 'Evals',
    'nav.dash': 'Dash',
    'nav.market': 'Market',
    'nav.settings': 'Settings',

    // Header
    'header.system_operational': 'System Operational',
    'header.search_placeholder': 'Global search...',
    'header.title.workflows': 'Workflow Orchestrator',
    'header.title.algos': 'Algorithm Library',
    'header.title.evals': 'Backtest Evaluations',
    'header.title.dash': 'Dashboard Library',
    'header.title.market': 'Market Analysis',
    'header.title.default': 'QuantFlow AI',

    // Workflow List
    'workflow.title': 'Strategies & Workflows',
    'workflow.desc': 'Manage and deploy your quantitative trading logic.',
    'workflow.new': 'New Strategy',
    'workflow.search': 'Search workflows...',
    'workflow.status.active': 'Active',
    'workflow.status.draft': 'Draft',
    'workflow.updated': 'Updated',
    'workflow.nodes': 'Nodes',
    'workflow.btn.configure': 'Configure',
    'workflow.validate': 'Validate',
    'workflow.history': 'History',
    'workflow.save': 'Save Changes',

    // Dashboard List
    'dashboard.title': 'Data Dashboards',
    'dashboard.desc': 'Visualize performance, risk, and market data.',
    'dashboard.new': 'New Dashboard',
    'dashboard.widgets': 'Widgets',
    'dashboard.create_card': 'Create New Dashboard',

    // Strategy List
    'strategy.title': 'Investment Strategies',
    'strategy.desc': 'Manage and backtest your Backtrader Python algorithms.',
    'strategy.new': 'New Algorithm',
    'strategy.search': 'Search algorithms...',
    'strategy.btn.edit_code': 'Edit Code',

    // Backtest List
    'backtest.title': 'Backtest Evaluation',
    'backtest.desc': 'Review performance reports from your automated strategy tests.',
    'backtest.search': 'Search reports...',
    'backtest.col.status': 'Status',
    'backtest.col.strategy': 'Strategy / Symbol',
    'backtest.col.date_range': 'Date Range',
    'backtest.col.return': 'Return',
    'backtest.col.sharpe': 'Sharpe',
    'backtest.col.max_dd': 'Max DD',
    'backtest.col.created': 'Created',
    'backtest.status.success': 'Success',
    'backtest.status.failed': 'Failed',
    'backtest.status.running': 'Running',
    'backtest.btn.view': 'View Report',

    // Market
    'market.last_price': 'Last Price',
    'market.change_24h': '24h Change',
    'market.btn.refresh': 'Refresh',
    'market.depth_stats': 'Market Depth & Stats',
    'market.high_24h': 'High (24h)',
    'market.low_24h': 'Low (24h)',
    'market.gemini_analyst': 'Gemini Analyst',
    'market.analyzing': 'Processing market structure...',
    'market.analysis_generated': 'Analysis generated based on recent price action.',
    'market.click_analyze': 'Click "Analyze" to generate an instant technical summary using AI.',
    'market.btn.analyze': 'Analyze Market Data',
    'market.btn.update_analysis': 'Update Analysis',
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('zh');

  const t = (key: string): string => {
    const keys = translations[language] as Record<string, string>;
    return keys[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
