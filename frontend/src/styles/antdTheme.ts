import type { ThemeConfig } from 'antd'

export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: '#2563eb',
    colorInfo: '#2563eb',
    colorSuccess: '#22c55e',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    borderRadius: 12,
    fontFamily:
      "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji'",
  },
  components: {
    Layout: {
      headerBg: 'rgba(255,255,255,0.65)',
      bodyBg: 'transparent',
      siderBg: 'rgba(255,255,255,0.65)',
    },
    Card: {
      borderRadiusLG: 16,
    },
  },
}

