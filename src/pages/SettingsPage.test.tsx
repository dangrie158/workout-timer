import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import SettingsPage from './SettingsPage'
import { getSettings } from '../store/settingsStore'

function renderSettingsPage() {
  return render(
    <MemoryRouter initialEntries={['/settings']}>
      <Routes>
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('SettingsPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('shows the stored global preferences', () => {
    localStorage.setItem(
      'settings',
      JSON.stringify({
        soundEnabled: false,
        vibrationEnabled: true,
        autostart: true,
      })
    )

    renderSettingsPage()

    expect(screen.getByRole('heading', { name: 'Global settings' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Sound cues' })).not.toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Vibration cues' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Autostart workout' })).toBeChecked()
  })

  it('updates preferences and persists them immediately', () => {
    renderSettingsPage()

    fireEvent.click(screen.getByRole('checkbox', { name: 'Sound cues' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Autostart workout' }))

    expect(screen.getByRole('checkbox', { name: 'Sound cues' })).not.toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Autostart workout' })).toBeChecked()
    expect(getSettings()).toEqual({
      soundEnabled: false,
      vibrationEnabled: true,
      autostart: true,
    })
  })
})
