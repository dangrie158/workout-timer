import { useState, useEffect } from 'react'

interface NumberPickerProps {
  isOpen: boolean
  title: string
  value: number
  onChange: (value: number) => void
  onClose: () => void
  min?: number
  max?: number
}

export default function NumberPicker({
  isOpen,
  title,
  value,
  onChange,
  onClose,
  min = 0,
  max = 3600,
}: NumberPickerProps) {
  const [tempValue, setTempValue] = useState(value)

  useEffect(() => {
    setTempValue(value)
  }, [value, isOpen])

  if (!isOpen) return null

  const handleDecrement = () => {
    if (tempValue > min) {
      setTempValue(tempValue - 1)
    }
  }

  const handleIncrement = () => {
    if (tempValue < max) {
      setTempValue(tempValue + 1)
    }
  }

  const handleConfirm = () => {
    onChange(tempValue)
    onClose()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10)
    if (!isNaN(newValue)) {
      setTempValue(Math.max(min, Math.min(max, newValue)))
    }
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 rounded-t-2xl z-50 animate-in slide-in-from-bottom-5 shadow-2xl">
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-zinc-700 rounded-full" />
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          {/* Title */}
          <h2 className="text-xl font-semibold text-white mb-8 text-center">
            {title}
          </h2>

          {/* Value display and controls */}
          <div className="flex items-center justify-center gap-6 mb-8">
            {/* Decrement button */}
            <button
              onClick={handleDecrement}
              disabled={tempValue <= min}
              className="w-12 h-12 rounded-full bg-zinc-800 text-white text-2xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-700 active:bg-zinc-600 transition-colors"
            >
              −
            </button>

            {/* Input field */}
            <input
              type="text"
              value={tempValue}
              onChange={handleInputChange}
              className="w-24 text-center text-4xl font-bold text-white bg-transparent border-b-2 border-white focus:border-blue-500 outline-none"
            />

            {/* Increment button */}
            <button
              onClick={handleIncrement}
              disabled={tempValue >= max}
              className="w-12 h-12 rounded-full bg-zinc-800 text-white text-2xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-700 active:bg-zinc-600 transition-colors"
            >
              +
            </button>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-lg bg-zinc-800 text-white font-medium hover:bg-zinc-700 active:bg-zinc-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 px-4 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
