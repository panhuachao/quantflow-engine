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
    'nav.datasources': '数据源',

    // Header
    'header.system_operational': '系统运行正常',
    'header.search_placeholder': '全局搜索...',
    'header.title.workflows': '工作流编排',
    'header.title.algos': '算法策略库',
    'header.title.evals': '回测评估',
    'header.title.dash': '数据看板库',
    'header.title.market': '市场行情分析',
    'header.title.datasources': '数据源管理',
    'header.title.settings': '系统设置',
    'header.title.profile': '个人中心',
    'header.title.default': 'QuantFlow AI',
    'header.logout': '退出登录',

    // Notifications
    'notif.title': '消息中心',
    'notif.mark_all_read': '全部已读',
    'notif.empty': '暂无新消息',
    'notif.view_all': '查看全部',

    // Login
    'login.welcome': '欢迎回来',
    'login.subtitle': '登录 QuantFlow AI 量化交易系统',
    'login.email': '邮箱地址',
    'login.password': '密码',
    'login.btn': '登 录',
    'login.forgot': '忘记密码？',
    'login.no_account': '还没有账号？',
    'login.register': '立即注册',

    // Profile
    'profile.title': '个人资料',
    'profile.role': '高级量化分析师',
    'profile.stats.strategies': '策略总数',
    'profile.stats.backtests': '回测次数',
    'profile.stats.runtime': '运行时间',
    'profile.recent_activity': '近期活动',

    // Settings
    'settings.account': '账号设置',
    'settings.notifications': '通知偏好',
    'settings.api_keys': 'API 密钥管理',
    'settings.security': '安全设置',
    'settings.theme': '界面主题',
    'settings.theme.dark': '深色模式 (默认)',
    'settings.theme.light': '浅色模式',
    'settings.theme.midnight': '午夜极黑',
    'settings.theme.cosmic': '深空紫',
    'settings.language': '系统语言',
    'settings.save': '保存设置',

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

    // Workflow Editor
    'workflow.editor.properties': '属性配置',
    'workflow.editor.node_label': '节点名称',
    'workflow.editor.delete_node': '删除节点',
    'workflow.editor.validate': '校验图谱',
    'workflow.editor.history': '执行历史',
    'workflow.editor.save_changes': '保存变更',
    'workflow.editor.running': '运行中...',
    'workflow.editor.ready': '就绪',
    'workflow.editor.executing': '正在执行',
    'workflow.editor.deploy': '部署策略',
    'workflow.editor.console': '系统控制台',
    'workflow.editor.clear': '清空',
    'workflow.editor.logs': '日志记录',
    'workflow.editor.duration': '耗时',
    'workflow.editor.status': '状态',

    // Node Configs
    'node.timer.schedule': '调度配置',
    'node.timer.cron': 'Cron 表达式',
    'node.db.query_config': '数据查询配置',
    'node.db.conn_string': '连接字符串',
    'node.db.select_source': '选择数据源',
    'node.db.query': 'SQL 查询语句',
    'node.db.validate': '验证查询',
    'node.http.config': 'HTTP 请求配置',
    'node.http.method': '请求方法',
    'node.http.url': '请求地址 (URL)',
    'node.http.headers': '请求头 (JSON)',
    'node.http.body': '请求体 (JSON)',
    'node.script.execution': '代码执行',
    'node.script.language': '编程语言',
    'node.script.logic': '代码逻辑',
    'node.llm.config': '大模型配置',
    'node.llm.provider': '模型提供商',
    'node.llm.model': '模型名称',
    'node.llm.apikey': 'API 密钥 (可选)',
    'node.llm.temperature': '随机性 (Temperature)',
    'node.llm.system': '系统指令 (System Prompt)',
    'node.llm.user': '用户提示词 (User Prompt)',
    'node.storage.config': '存储配置',
    'node.storage.type': '数据库类型',
    'node.storage.table': '表名',

    // Node Content Previews
    'node.content.schedule': '调度',
    'node.content.source': '来源',
    'node.content.symbol': '代码',
    'node.content.code': '代码',
    'node.content.model': '模型',
    'node.content.conn': '数据源',
    'node.content.no_conn': '未选择数据源',
    'node.content.table': '表名',
    'node.content.no_table': '未设置表名',

    // Dashboard List
    'dashboard.title': '数据看板',
    'dashboard.desc': '可视化绩效、风险和市场数据。',
    'dashboard.new': '新建看板',
    'dashboard.widgets': '组件',
    'dashboard.create_card': '创建新看板',

    // Dashboard Editor
    'dash.edit': '编辑看板',
    'dash.done': '完成编辑',
    'dash.add_widget': '添加组件',
    'dash.data_sources': '数据源管理',
    'dash.save_config': '保存配置',
    'dash.cancel': '取消',
    'dash.manage_sources': '前往数据源中心',
    'dash.add_conn': '添加新连接',
    'dash.edit_widget': '编辑组件',
    'dash.widget.title': '标题',
    'dash.widget.type': '类型',
    'dash.widget.grid': '网格宽度',
    'dash.widget.source': '数据源',
    'dash.widget.query': '数据查询 / 脚本',

    // Strategy List & Editor
    'strategy.title': '投资策略',
    'strategy.desc': '管理和回测您的 Backtrader Python 算法。',
    'strategy.new': '新建算法',
    'strategy.search': '搜索算法...',
    'strategy.btn.edit_code': '编辑代码',
    'editor.btn.config': '配置',
    'editor.btn.save': '保存',
    'editor.btn.run': '运行回测',
    
    // Backtest Config Modal
    'bt.config.title': '运行回测配置',
    'bt.config.symbol': '股票标的 (Ticker)',
    'bt.config.initial_cash': '初始资金',
    'bt.config.start_date': '开始日期',
    'bt.config.end_date': '结束日期',
    'bt.config.params': '策略参数 (Params)',
    'bt.config.params_placeholder': '例如: fast=10, slow=30 (逗号分隔)',
    'bt.config.cancel': '取消',
    'bt.config.confirm': '确认运行',

    // Backtest List
    'backtest.title': '回测评估',
    'backtest.desc': '查看自动化策略测试的绩效报告。',
    'backtest.search': '搜索报告...',
    'backtest.col.status': '状态',
    'backtest.col.strategy': '策略 / 标的',
    'backtest.col.config': '配置详情',
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

    // Data Sources
    'ds.title': '数据源管理',
    'ds.desc': '集中管理所有数据库连接（SQLite, MySQL, PostgreSQL）。',
    'ds.add_new': '添加数据源',
    'ds.new_title': '新建连接',
    'ds.edit_title': '编辑连接',
    'ds.name': '连接名称',
    'ds.type': '数据库类型',
    'ds.host': '主机 (Host)',
    'ds.port': '端口 (Port)',
    'ds.username': '用户名',
    'ds.password': '密码',
    'ds.database': '数据库名',
    'ds.file_path': '文件路径 (SQLite)',
    'ds.test_conn': '测试连接',
  },
  en: {
    // Sidebar
    'nav.workflows': 'Workflows',
    'nav.algos': 'Algos',
    'nav.evals': 'Evals',
    'nav.dash': 'Dash',
    'nav.market': 'Market',
    'nav.settings': 'Settings',
    'nav.datasources': 'Data Sources',

    // Header
    'header.system_operational': 'System Operational',
    'header.search_placeholder': 'Global search...',
    'header.title.workflows': 'Workflow Orchestrator',
    'header.title.algos': 'Algorithm Library',
    'header.title.evals': 'Backtest Evaluations',
    'header.title.dash': 'Dashboard Library',
    'header.title.market': 'Market Analysis',
    'header.title.datasources': 'Data Sources',
    'header.title.settings': 'System Settings',
    'header.title.profile': 'My Profile',
    'header.title.default': 'QuantFlow AI',
    'header.logout': 'Logout',

    // Notifications
    'notif.title': 'Notifications',
    'notif.mark_all_read': 'Mark all read',
    'notif.empty': 'No new notifications',
    'notif.view_all': 'View all',

    // Login
    'login.welcome': 'Welcome Back',
    'login.subtitle': 'Sign in to QuantFlow AI',
    'login.email': 'Email Address',
    'login.password': 'Password',
    'login.btn': 'Sign In',
    'login.forgot': 'Forgot password?',
    'login.no_account': 'No account?',
    'login.register': 'Register',

    // Profile
    'profile.title': 'Profile',
    'profile.role': 'Senior Quant Analyst',
    'profile.stats.strategies': 'Total Strategies',
    'profile.stats.backtests': 'Total Backtests',
    'profile.stats.runtime': 'Runtime Hours',
    'profile.recent_activity': 'Recent Activity',

    // Settings
    'settings.account': 'Account Settings',
    'settings.notifications': 'Notifications',
    'settings.api_keys': 'API Keys',
    'settings.security': 'Security',
    'settings.theme': 'Theme',
    'settings.theme.dark': 'Dark (Default)',
    'settings.theme.light': 'Light',
    'settings.theme.midnight': 'Midnight',
    'settings.theme.cosmic': 'Cosmic Purple',
    'settings.language': 'Language',
    'settings.save': 'Save Settings',

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

    // Workflow Editor
    'workflow.editor.properties': 'Properties',
    'workflow.editor.node_label': 'Node Label',
    'workflow.editor.delete_node': 'Delete Node',
    'workflow.editor.validate': 'Validate',
    'workflow.editor.history': 'History',
    'workflow.editor.save_changes': 'Save Changes',
    'workflow.editor.running': 'Running...',
    'workflow.editor.ready': 'Ready',
    'workflow.editor.executing': 'Executing Flow',
    'workflow.editor.deploy': 'Deploy Strategy',
    'workflow.editor.console': 'System Console',
    'workflow.editor.clear': 'Clear',
    'workflow.editor.logs': 'Logs',
    'workflow.editor.duration': 'Duration',
    'workflow.editor.status': 'Status',

    // Node Configs
    'node.timer.schedule': 'Scheduler Config',
    'node.timer.cron': 'Cron Expression',
    'node.db.query_config': 'Data Query Config',
    'node.db.conn_string': 'Connection String',
    'node.db.select_source': 'Select Data Source',
    'node.db.query': 'SQL Query',
    'node.db.validate': 'Validate Query',
    'node.http.config': 'HTTP Request Config',
    'node.http.method': 'Method',
    'node.http.url': 'URL',
    'node.http.headers': 'Headers (JSON)',
    'node.http.body': 'Body (JSON)',
    'node.script.execution': 'Code Execution',
    'node.script.language': 'Language',
    'node.script.logic': 'Code Logic',
    'node.llm.config': 'Large Model Config',
    'node.llm.provider': 'Model Provider',
    'node.llm.model': 'Model Name',
    'node.llm.apikey': 'API Key (Optional)',
    'node.llm.temperature': 'Temperature',
    'node.llm.system': 'System Instruction',
    'node.llm.user': 'User Prompt',
    'node.storage.config': 'Storage Config',
    'node.storage.type': 'Database Type',
    'node.storage.table': 'Table Name',

    // Node Content Previews
    'node.content.schedule': 'Schedule',
    'node.content.source': 'Source',
    'node.content.symbol': 'Symbol',
    'node.content.code': 'Code',
    'node.content.model': 'Model',
    'node.content.conn': 'Source',
    'node.content.no_conn': 'No Source',
    'node.content.table': 'Table',
    'node.content.no_table': 'No Table',

    // Dashboard List
    'dashboard.title': 'Data Dashboards',
    'dashboard.desc': 'Visualize performance, risk, and market data.',
    'dashboard.new': 'New Dashboard',
    'dashboard.widgets': 'Widgets',
    'dashboard.create_card': 'Create New Dashboard',

    // Dashboard Editor
    'dash.edit': 'Edit Dashboard',
    'dash.done': 'Done Editing',
    'dash.add_widget': 'Add Widget',
    'dash.data_sources': 'Manage Sources',
    'dash.save_config': 'Save Configuration',
    'dash.cancel': 'Cancel',
    'dash.manage_sources': 'Go to Data Sources',
    'dash.add_conn': 'Add New Connection',
    'dash.edit_widget': 'Edit Widget',
    'dash.widget.title': 'Title',
    'dash.widget.type': 'Type',
    'dash.widget.grid': 'Grid Width',
    'dash.widget.source': 'Data Source',
    'dash.widget.query': 'Data Query / Script',

    // Strategy List & Editor
    'strategy.title': 'Investment Strategies',
    'strategy.desc': 'Manage and backtest your Backtrader Python algorithms.',
    'strategy.new': 'New Algorithm',
    'strategy.search': 'Search algorithms...',
    'strategy.btn.edit_code': 'Edit Code',
    'editor.btn.config': 'Config',
    'editor.btn.save': 'Save',
    'editor.btn.run': 'Run Backtest',

    // Backtest Config Modal
    'bt.config.title': 'Backtest Configuration',
    'bt.config.symbol': 'Ticker / Symbol',
    'bt.config.initial_cash': 'Initial Cash',
    'bt.config.start_date': 'Start Date',
    'bt.config.end_date': 'End Date',
    'bt.config.params': 'Strategy Params',
    'bt.config.params_placeholder': 'e.g. fast=10, slow=30 (comma separated)',
    'bt.config.cancel': 'Cancel',
    'bt.config.confirm': 'Run Simulation',

    // Backtest List
    'backtest.title': 'Backtest Evaluation',
    'backtest.desc': 'Review performance reports from your automated strategy tests.',
    'backtest.search': 'Search reports...',
    'backtest.col.status': 'Status',
    'backtest.col.strategy': 'Strategy / Symbol',
    'backtest.col.config': 'Configuration',
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

    // Data Sources
    'ds.title': 'Data Sources',
    'ds.desc': 'Centralize all your database connections (SQLite, MySQL, PostgreSQL).',
    'ds.add_new': 'Add Data Source',
    'ds.new_title': 'New Connection',
    'ds.edit_title': 'Edit Connection',
    'ds.name': 'Connection Name',
    'ds.type': 'Database Type',
    'ds.host': 'Host',
    'ds.port': 'Port',
    'ds.username': 'Username',
    'ds.password': 'Password',
    'ds.database': 'Database',
    'ds.file_path': 'File Path (SQLite)',
    'ds.test_conn': 'Test Connection',
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
