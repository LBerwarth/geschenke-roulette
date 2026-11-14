import { BrowserRouter, Route, Routes } from 'react-router'

function Start() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="font-display text-6xl font-extrabold">Geschenke-Roulette</h1>
    </main>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Start />} />
      </Routes>
    </BrowserRouter>
  )
}
