import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { ConfigProvider } from 'antd'
import { store } from '../../app/store'
import { antdTheme } from '../../styles/antdTheme'
import { CoursesPage } from './CoursesPage'

describe('CoursesPage', () => {
  it('renders search input', () => {
    render(
      <Provider store={store}>
        <ConfigProvider theme={antdTheme}>
          <CoursesPage />
        </ConfigProvider>
      </Provider>,
    )
    expect(screen.getByPlaceholderText('按课程名搜索')).toBeInTheDocument()
  })
})

