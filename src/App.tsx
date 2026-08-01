import { useServiceWorker } from './hooks/useServiceWorker'
import Router from './router'

export default function App() {
  useServiceWorker()
  return <Router />
}
