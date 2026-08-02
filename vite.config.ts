import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1]
const base = process.env.GITHUB_ACTIONS === 'true' && repositoryName ? `/${repositoryName}/` : '/'

// Plugin to update manifest.json with correct base path
const manifestPlugin = {
  name: 'update-manifest',
  apply: 'build',
  writeBundle() {
    const dirname = typeof import.meta.dirname !== 'undefined' ? import.meta.dirname : process.cwd()
    const manifestPath = path.join(dirname, 'dist/manifest.json')
    if (fs.existsSync(manifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
      manifest.start_url = base
      manifest.scope = base
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
    }
  },
}

export default defineConfig({
  plugins: [react(), manifestPlugin],
  base,
  server: { https: true },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
})
