import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { ConfigProvider } from 'antd'
import 'antd/dist/reset.css'
import './index.css'
import App from './App.tsx'
import { store } from './app/store'
import { antdTheme } from './styles/antdTheme'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ConfigProvider theme={antdTheme}>
        <App />
      </ConfigProvider>
    </Provider>
  </StrictMode>,
)
