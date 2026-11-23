import * as THREE from 'three'
import type { LivePhase } from '../types'

// ============================================================================
// 5x7 Authentic Casio Monochrome Bitmap Font (uppercase, lowercase, digits, math)
// ============================================================================
const FONT_5X7: Record<string, string[]> = {
  ' ': ['00000', '00000', '00000', '00000', '00000', '00000', '00000'],
  '!': ['00100', '00100', '00100', '00100', '00100', '00000', '00100'],
  '.': ['00000', '00000', '00000', '00000', '00000', '01100', '01100'],
  ',': ['00000', '00000', '00000', '00000', '00110', '00100', '01000'],
  ':': ['00000', '01100', '01100', '00000', '01100', '01100', '00000'],
  '-': ['00000', '00000', '00000', '11111', '00000', '00000', '00000'],
  '=': ['00000', '00000', '11111', '00000', '11111', '00000', '00000'],
  '/': ['00001', '00010', '00100', '00100', '01000', '10000', '00000'],
  '>': ['10000', '01000', '00100', '00010', '00100', '01000', '10000'],
  '<': ['00010', '00100', '01000', '10000', '01000', '00100', '00010'],
  '[': ['01110', '01000', '01000', '01000', '01000', '01000', '01110'],
  ']': ['01110', '00010', '00010', '00010', '00010', '00010', '01110'],
  '?': ['01110', '10001', '00001', '00110', '00100', '00000', '00100'],
  '+': ['00000', '00100', '00100', '11111', '00100', '00100', '00000'],
  '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  '2': ['01110', '10001', '00001', '00110', '01000', '10000', '11111'],
  '3': ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
  '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  '5': ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
  '6': ['01110', '10000', '11110', '10001', '10001', '10001', '01110'],
  '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  '9': ['01110', '10001', '10001', '01111', '00001', '00010', '01100'],
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
  C: ['01110', '10001', '10000', '10000', '10000', '10001', '01110'],
  D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
  G: ['01110', '10001', '10000', '10111', '10001', '10001', '01111'],
  H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  I: ['01110', '00100', '00100', '00100', '00100', '00100', '01110'],
  J: ['00111', '00010', '00010', '00010', '10010', '10010', '01100'],
  K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
  L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
  N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
  Q: ['01110', '10001', '10001', '10001', '10101', '10010', '01101'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
  V: ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
  W: ['10001', '10001', '10001', '10101', '10101', '11011', '10001'],
  X: ['10001', '10001', '01010', '00100', '01010', '10001', '10001'],
  Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
  Z: ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
  a: ['00000', '00000', '01110', '00001', '01111', '10001', '01111'],
  b: ['10000', '10000', '11110', '10001', '10001', '10001', '11110'],
  c: ['00000', '00000', '01110', '10000', '10000', '10001', '01110'],
  d: ['00001', '00001', '01111', '10001', '10001', '10001', '01111'],
  e: ['00000', '00000', '01110', '10001', '11111', '10000', '01110'],
  f: ['00110', '01001', '01000', '11100', '01000', '01000', '01000'],
  g: ['00000', '01111', '10001', '01111', '00001', '10001', '01110'],
  h: ['10000', '10000', '11110', '10001', '10001', '10001', '10001'],
  i: ['00100', '00000', '01100', '00100', '00100', '00100', '01110'],
  k: ['10000', '10000', '10010', '10100', '11000', '10100', '10010'],
  l: ['01100', '00100', '00100', '00100', '00100', '00100', '01110'],
  m: ['00000', '00000', '11010', '10101', '10101', '10001', '10001'],
  n: ['00000', '00000', '11110', '10001', '10001', '10001', '10001'],
  o: ['00000', '00000', '01110', '10001', '10001', '10001', '01110'],
  p: ['00000', '11110', '10001', '11110', '10000', '10000', '10000'],
  r: ['00000', '00000', '10110', '11001', '10000', '10000', '10000'],
  s: ['00000', '00000', '01111', '10000', '01110', '00001', '11110'],
  t: ['01000', '01000', '11110', '01000', '01000', '01001', '00110'],
  u: ['00000', '00000', '10001', '10001', '10001', '10011', '01101'],
  v: ['00000', '00000', '10001', '10001', '10001', '01010', '00100'],
  w: ['00000', '00000', '10001', '10001', '10101', '10101', '01010'],
  x: ['00000', '00000', '10001', '01010', '00100', '01010', '10001'],
  z: ['00000', '00000', '11111', '00010', '00100', '01000', '11111'],
  ä: ['01010', '00000', '01110', '00001', '01111', '10001', '01111'],
  ö: ['01010', '00000', '01110', '10001', '10001', '10001', '01110'],
  ü: ['01010', '00000', '10001', '10001', '10001', '10011', '01101'],
}

export interface LiveLcdController {
  texture: THREE.CanvasTexture
  update: (phase: LivePhase, phaseProgress: number, powerOn: boolean, time: number) => void
}

export function createLiveLcdController(): LiveLcdController {
  const scale = 4
  const W = 128
  const H = 64
  const canvas = document.createElement('canvas')
  canvas.width = W * scale
  canvas.height = H * scale
  const ctx = canvas.getContext('2d')!

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.NearestFilter

  const bgLight = '#9eb098'
  const bgGrid = '#95a78f'
  const pxOn = '#1a271c'

  const setPixel = (x: number, y: number, on: boolean) => {
    if (x < 0 || x >= W || y < 0 || y >= H) return
    ctx.fillStyle = on ? pxOn : bgLight
    ctx.fillRect(x * scale, y * scale, scale - 0.55, scale - 0.55)
  }

  const drawText = (text: string, x0: number, y0: number, inverted = false) => {
    let cx = x0
    for (let i = 0; i < text.length; i++) {
      const ch = text[i]
      const glyph = FONT_5X7[ch] ?? FONT_5X7[ch.toUpperCase()] ?? FONT_5X7[' ']
      for (let row = 0; row < 7; row++) {
        for (let col = 0; col < 5; col++) {
          const bit = glyph[row][col] === '1'
          if (inverted) {
            setPixel(cx + col, y0 + row, !bit)
          } else if (bit) {
            setPixel(cx + col, y0 + row, true)
          }
        }
      }
      if (inverted) {
        for (let row = 0; row < 7; row++) setPixel(cx + 5, y0 + row, true)
      }
      cx += 6
    }
  }

  const fillRectPx = (x0: number, y0: number, w: number, h: number, on: boolean) => {
    for (let y = y0; y < y0 + h; y++) {
      for (let x = x0; x < x0 + w; x++) {
        setPixel(x, y, on)
      }
    }
  }

  let lastKey = ''

  const solutionLines = [
    'Gegeben:',
    ' s = 180 km',
    ' t = 1,5 h',
    'Formel:',
    ' v = s / t',
    'Rechnung:',
    ' v = 180 / 1,5',
    ' v = 120 km/h',
    '----------------',
    'Antwort:',
    'Der Zug fährt',
    'mit 120 km/h.',
  ]

  const update = (phase: LivePhase, phaseProgress: number, powerOn: boolean, time: number) => {
    const tick = Math.floor(time * 6)
    const key = `${phase}_${Math.floor(phaseProgress * 40)}_${powerOn}_${tick % 8}`
    if (key === lastKey) return
    lastKey = key

    // Base STN LCD reflective backing with subtle pixel matrix grid
    ctx.fillStyle = bgGrid
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = bgLight
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        ctx.fillRect(x * scale, y * scale, scale - 0.55, scale - 0.55)
      }
    }

    // Top Casio header bar
    fillRectPx(0, 0, 128, 9, true)
    drawText('GEMINI AI', 3, 1, true)
    drawText(powerOn ? 'WLAN' : 'STBY', 98, 1, true)

    if (phase === 'idle') {
      drawText('fx-9860GII MOD', 18, 16)
      drawText('ESP32-C3 UART0', 18, 27)
      drawText(powerOn ? 'Status: BEREIT' : 'SW1: 0,00 mA', 18, 39)
      fillRectPx(0, 55, 128, 9, false)
      drawText('[EXE] FRAGE', 4, 56)
      drawText('3.3V', 100, 56)
    } else if (phase === 'tx') {
      drawText('AUFGABE:', 3, 12)
      drawText('Zug fährt 180km', 3, 22)
      drawText('in 1,5h. Wie', 3, 31)
      drawText('schnell ist er?', 3, 40)
      fillRectPx(0, 54, 128, 10, true)
      const dots = '.'.repeat((tick % 3) + 1)
      drawText(`TX>GPIO20${dots}`, 4, 56, true)
    } else if (phase === 'wifi') {
      drawText('WLAN -> HTTPS', 18, 15)
      drawText('Gemini 2.5 API', 18, 26)
      // Animated pixel progress bar
      fillRectPx(14, 39, 100, 8, true)
      fillRectPx(15, 40, 98, 6, false)
      const fillW = Math.floor(14 + phaseProgress * 82)
      fillRectPx(16, 41, fillW, 4, true)
      drawText('TLS 1.3 OK', 32, 52)
    } else if (phase === 'rx') {
      drawText('ANTWORT LAEDT', 20, 15)
      drawText('RX <- GPIO21', 22, 26)
      fillRectPx(14, 39, 100, 8, true)
      fillRectPx(15, 40, 98, 6, false)
      const fillW = Math.floor(10 + phaseProgress * 86)
      fillRectPx(16, 41, fillW, 4, true)
      drawText('115200 BAUD', 28, 52)
    } else if (phase === 'lcd') {
      // Smooth scrolling solution across 5 visible lines (y = 11..51)
      const maxScroll = Math.max(0, solutionLines.length - 5)
      const smoothScroll = Math.min(maxScroll, Math.max(0, phaseProgress * (maxScroll + 0.8) - 0.3))
      const firstIdx = Math.floor(smoothScroll)
      const pixelShift = Math.floor((smoothScroll - firstIdx) * 9)

      for (let i = 0; i < 6; i++) {
        const line = solutionLines[firstIdx + i]
        if (!line) continue
        const ly = 11 + i * 9 - pixelShift
        if (ly >= 9 && ly <= 49) {
          drawText(line, 3, ly)
        }
      }

      // Clean mask over top bar & bottom bar so scrolling text clips neatly
      fillRectPx(0, 0, 128, 9, true)
      drawText('GEMINI LOESUNG', 3, 1, true)
      drawText('OK', 112, 1, true)

      // Right scrollbar
      fillRectPx(123, 10, 4, 43, false)
      for (let y = 10; y < 53; y += 2) setPixel(125, y, true)
      const thumbY = 11 + Math.floor((smoothScroll / Math.max(1, maxScroll)) * 28)
      fillRectPx(123, thumbY, 4, 12, true)

      // Bottom Casio softkeys
      fillRectPx(0, 54, 128, 10, false)
      fillRectPx(0, 54, 128, 1, true)
      fillRectPx(2, 56, 36, 8, true)
      drawText('NEU', 11, 57, true)
      fillRectPx(44, 56, 38, 8, true)
      drawText('STEP', 51, 57, true)
      fillRectPx(88, 56, 38, 8, true)
      drawText('EXIT', 95, 57, true)
    }

    texture.needsUpdate = true
  }

  // Initial render
  update('idle', 0, false, 0)
  return { texture, update }
}

// ============================================================================
// Casio fx-9860GII Authentic Front Faceplate Texture (Keypad + Branding)
// ============================================================================
export function createCasioFrontTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 2048
  const ctx = canvas.getContext('2d')!

  // Matte charcoal-silver metallic calculator body
  const grad = ctx.createLinearGradient(0, 0, 1024, 2048)
  grad.addColorStop(0, '#32363f')
  grad.addColorStop(0.5, '#2a2d35')
  grad.addColorStop(1, '#23262d')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 1024, 2048)

  // Silver-grey brushed top bezel around LCD
  const bezelGrad = ctx.createLinearGradient(0, 60, 0, 740)
  bezelGrad.addColorStop(0, '#5a606d')
  bezelGrad.addColorStop(1, '#434853')
  ctx.fillStyle = bezelGrad
  ctx.beginPath()
  ctx.roundRect(70, 82, 884, 650, 38)
  ctx.fill()

  // Dark inner glass bezel frame
  ctx.fillStyle = '#14171c'
  ctx.beginPath()
  ctx.roundRect(102, 165, 820, 495, 22)
  ctx.fill()

  // CASIO Logo & fx-9860GII branding
  ctx.fillStyle = '#f1f5f9'
  ctx.font = 'bold 46px Inter, system-ui, sans-serif'
  ctx.fillText('CASIO', 112, 142)

  ctx.fillStyle = '#cbd5e1'
  ctx.font = 'italic 600 32px Inter, system-ui, sans-serif'
  ctx.fillText('fx-9860GII', 698, 140)

  ctx.fillStyle = '#94a3b8'
  ctx.font = '600 20px Inter, system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('USB POWER GRAPHIC 2', 512, 704)

  // Function Keys F1-F6 labels above keys
  const fKeys = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6']
  ctx.font = 'bold 22px Inter, system-ui, sans-serif'
  fKeys.forEach((lbl, i) => {
    const x = 138 + i * 149
    ctx.fillStyle = '#e2e8f0'
    ctx.fillText(lbl, x, 795)
    // Silver pill key visual backing
    ctx.fillStyle = '#7b8394'
    ctx.beginPath()
    ctx.roundRect(x - 44, 808, 88, 42, 12)
    ctx.fill()
  })

  // Upper control keys (SHIFT, OPTN, VARS, MENU, ALPHA, x,θ,T, EXIT) + REPLAY ring
  const ctrlRows: { label: string; sub?: string; x: number; y: number; bg: string; fg: string }[] = [
    { label: 'SHIFT', x: 155, y: 920, bg: '#d9a422', fg: '#111827' },
    { label: 'OPTN', x: 305, y: 920, bg: '#3e434f', fg: '#f8fafc' },
    { label: 'VARS', x: 455, y: 920, bg: '#3e434f', fg: '#f8fafc' },
    { label: 'MENU', x: 605, y: 920, bg: '#3e434f', fg: '#f8fafc' },
    { label: 'ALPHA', x: 155, y: 1018, bg: '#c0392b', fg: '#ffffff' },
    { label: 'x²', x: 305, y: 1018, bg: '#3e434f', fg: '#f8fafc' },
    { label: '^', x: 455, y: 1018, bg: '#3e434f', fg: '#f8fafc' },
    { label: 'EXIT', x: 605, y: 1018, bg: '#3e434f', fg: '#f8fafc' },
  ]
  for (const k of ctrlRows) {
    ctx.fillStyle = k.bg
    ctx.beginPath()
    ctx.roundRect(k.x - 54, k.y - 26, 108, 54, 14)
    ctx.fill()
    ctx.fillStyle = k.fg
    ctx.font = 'bold 22px Inter, system-ui, sans-serif'
    ctx.fillText(k.label, k.x, k.y + 8)
  }

  // Iconic Circular Silver REPLAY D-Pad on right side
  const rx = 812
  const ry = 968
  const dGrad = ctx.createRadialGradient(rx - 20, ry - 20, 12, rx, ry, 108)
  dGrad.addColorStop(0, '#cfd6e2')
  dGrad.addColorStop(0.6, '#8b93a3')
  dGrad.addColorStop(1, '#585f6e')
  ctx.fillStyle = dGrad
  ctx.beginPath()
  ctx.arc(rx, ry, 102, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#2b2f38'
  ctx.beginPath()
  ctx.arc(rx, ry, 34, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#e2e8f0'
  ctx.font = 'bold 17px Inter, system-ui, sans-serif'
  ctx.fillText('REPLAY', rx, ry - 114)

  // Scientific row keys (3 rows x 6 cols)
  const sciRows = [
    ['X,θ,T', 'log', 'ln', 'sin', 'cos', 'tan'],
    ['a b/c', 'F↔D', '(', ')', ',', '→'],
  ]
  sciRows.forEach((row, rIdx) => {
    row.forEach((lbl, cIdx) => {
      const x = 138 + cIdx * 149
      const y = 1138 + rIdx * 102
      ctx.fillStyle = '#383d47'
      ctx.beginPath()
      ctx.roundRect(x - 52, y - 28, 104, 56, 14)
      ctx.fill()
      ctx.fillStyle = '#f1f5f9'
      ctx.font = '600 22px Inter, system-ui, sans-serif'
      ctx.fillText(lbl, x, y + 8)
    })
  })

  // Lower numeric keypad (4 rows x 5 cols) — authentic white numbers + blue AC/ON & EXE
  const numRows = [
    ['7', '8', '9', 'DEL', 'AC/ON'],
    ['4', '5', '6', '×', '÷'],
    ['1', '2', '3', '+', '−'],
    ['0', '.', '×10ˣ', '(-)', 'EXE'],
  ]
  numRows.forEach((row, rIdx) => {
    row.forEach((lbl, cIdx) => {
      const x = 152 + cIdx * 180
      const y = 1380 + rIdx * 146
      const isBlue = lbl === 'AC/ON' || lbl === 'DEL' || lbl === 'EXE'
      const isWhite = cIdx < 3
      ctx.fillStyle = isBlue ? '#1c64b0' : isWhite ? '#e8ecf2' : '#4a505e'
      ctx.beginPath()
      ctx.roundRect(x - 66, y - 42, 132, 86, 18)
      ctx.fill()
      ctx.fillStyle = isWhite ? '#14171f' : '#ffffff'
      ctx.font = `bold ${lbl.length > 2 ? 26 : 36}px Inter, system-ui, sans-serif`
      ctx.fillText(lbl, x, y + 12)
    })
  })

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

// ============================================================================
// Casio Back Shell Subtle Molded Engraving Texture
// ============================================================================
export function createCasioBackTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 1024
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#252830'
  ctx.fillRect(0, 0, 512, 1024)

  // Subtle molded micro-texture grain
  ctx.fillStyle = 'rgba(255,255,255,0.018)'
  for (let i = 0; i < 1600; i++) {
    ctx.fillRect((i * 73) % 512, (i * 139) % 1024, 2, 2)
  }

  // Molded recessed specification label
  ctx.strokeStyle = 'rgba(255,255,255,0.09)'
  ctx.lineWidth = 2
  ctx.strokeRect(110, 120, 292, 150)

  ctx.fillStyle = 'rgba(226,232,240,0.42)'
  ctx.textAlign = 'center'
  ctx.font = 'bold 24px Inter, system-ui, sans-serif'
  ctx.fillText('CASIO fx-9860GII', 256, 162)
  ctx.font = '500 14px Inter, system-ui, sans-serif'
  ctx.fillText('RATING: DC 6V  0.06W', 256, 196)
  ctx.fillText('4 × AAA (LR03 / NiMH 1.2V)', 256, 222)
  ctx.fillText('CR2032 3V BACKUP', 256, 248)

  // Cut transparent opening for 4x AAA battery compartment & CR2032 backup window
  // Plane spans X: -42.75..+42.75 (w=85.5), Z: -89..+89 (h=178)
  const xToPx = (x: number) => ((x + 42.75) / 85.5) * 512
  const zToPx = (z: number) => ((z + 89.0) / 178.0) * 1024

  // 4x AAA compartment opening
  ctx.clearRect(xToPx(-39.0), zToPx(32.5), xToPx(11.0) - xToPx(-39.0), zToPx(84.0) - zToPx(32.5))
  // CR2032 round backup service hatch opening
  ctx.save()
  ctx.globalCompositeOperation = 'destination-out'
  ctx.beginPath()
  ctx.arc(xToPx(-24.0), zToPx(13.5), 74, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// ============================================================================
// Casio Emerald Green FR4 Mainboard PCB Texture (Traces + Silkscreen + Labels)
// ============================================================================
export function createCasioPcbTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 1400
  const ctx = canvas.getContext('2d')!

  // Rich emerald green soldermask
  const bg = ctx.createLinearGradient(0, 0, 1024, 1400)
  bg.addColorStop(0, '#0a5e34')
  bg.addColorStop(0.5, '#0c6b3b')
  bg.addColorStop(1, '#084e2b')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, 1024, 1400)

  // Ground plane copper pour zones (slightly brighter emerald under soldermask)
  ctx.fillStyle = 'rgba(28, 150, 86, 0.34)'
  ctx.fillRect(42, 42, 940, 1316)

  // Realistic routed 45° copper traces
  ctx.strokeStyle = '#1b8d52'
  ctx.lineWidth = 4
  for (let i = 0; i < 24; i++) {
    const x = 90 + i * 36
    ctx.beginPath()
    ctx.moveTo(x, 120)
    ctx.lineTo(x, 380 + (i % 5) * 40)
    ctx.lineTo(x + (i % 2 === 0 ? 44 : -44), 440 + (i % 5) * 40)
    ctx.lineTo(x + (i % 2 === 0 ? 44 : -44), 980)
    ctx.stroke()
  }

  // Horizontal bus traces
  ctx.lineWidth = 3
  for (let i = 0; i < 14; i++) {
    const y = 520 + i * 28
    ctx.beginPath()
    ctx.moveTo(60, y)
    ctx.lineTo(960, y)
    ctx.stroke()
  }

  // Gold plated vias & test points scattered cleanly
  for (let i = 0; i < 55; i++) {
    const vx = 75 + ((i * 197) % 870)
    const vy = 95 + ((i * 263) % 1210)
    ctx.fillStyle = '#d4af37'
    ctx.beginPath()
    ctx.arc(vx, vy, 7, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#072a18'
    ctx.beginPath()
    ctx.arc(vx, vy, 3, 0, Math.PI * 2)
    ctx.fill()
  }

  // Radial gold bond fanout rings for CPU & RAM COBs
  const drawCobFanout = (cx: number, cy: number, r: number) => {
    ctx.strokeStyle = '#c8a33a'
    ctx.lineWidth = 2.5
    for (let a = 0; a < 48; a++) {
      const ang = (a / 48) * Math.PI * 2
      ctx.beginPath()
      ctx.moveTo(cx + Math.cos(ang) * (r - 12), cy + Math.sin(ang) * (r - 12))
      ctx.lineTo(cx + Math.cos(ang) * (r + 22), cy + Math.sin(ang) * (r + 22))
      ctx.stroke()
    }
  }
  drawCobFanout(360, 710, 118)
  drawCobFanout(736, 755, 88)

  // Crisp White PCB Silkscreen
  ctx.fillStyle = 'rgba(248, 250, 252, 0.88)'
  ctx.font = 'bold 26px "JetBrains Mono", monospace'
  ctx.fillText('CASIO RJA526862-001V01', 72, 1280)
  ctx.font = 'bold 20px "JetBrains Mono", monospace'
  ctx.fillText('CN1 MINI-USB', 235, 118)
  ctx.fillText('CN2 2.5mm SERIAL', 610, 82)
  ctx.fillText('U1 CPU (SH4A)', 260, 865)
  ctx.fillText('U2 FLASH/RAM', 660, 880)
  ctx.fillText('BT1 CR2032 3V', 135, 1140)

  // Clear white silkscreen outlines for the 3 serial jack pads
  ctx.strokeStyle = 'rgba(255,255,255,0.8)'
  ctx.lineWidth = 2.5
  ctx.strokeRect(598, 92, 232, 165)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

// ============================================================================
// ESP32-C3 SuperMini Matte Black PCB Texture (22.5 x 18.0 mm)
// ============================================================================
export function createEsp32PcbTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 640
  const ctx = canvas.getContext('2d')!

  // Matte black soldermask
  ctx.fillStyle = '#14161b'
  ctx.fillRect(0, 0, 512, 640)

  // Subtle dark copper micro-traces under black soldermask
  ctx.strokeStyle = '#1e222b'
  ctx.lineWidth = 3
  for (let i = 0; i < 8; i++) {
    const y = 88 + i * 72
    ctx.beginPath()
    ctx.moveTo(40, y)
    ctx.lineTo(155, y)
    ctx.lineTo(220, 310)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(472, y)
    ctx.lineTo(355, y)
    ctx.lineTo(292, 310)
    ctx.stroke()
  }

  // Crisp White Silkscreen pin numbers along both edges
  const leftLabels = ['5', '6', '7', '8', '9', '10', '20', '21']
  const rightLabels = ['5V', 'G', '3V3', '4', '3', '2', '1', '0']

  ctx.fillStyle = '#f1f5f9'
  ctx.font = 'bold 24px "JetBrains Mono", monospace'
  leftLabels.forEach((lbl, i) => {
    const y = 94 + i * 72
    ctx.textAlign = 'left'
    ctx.fillText(lbl, 56, y + 8)
  })
  rightLabels.forEach((lbl, i) => {
    const y = 94 + i * 72
    ctx.textAlign = 'right'
    ctx.fillText(lbl, 456, y + 8)
  })

  // Center Silkscreen
  ctx.textAlign = 'center'
  ctx.font = 'bold 20px "JetBrains Mono", monospace'
  ctx.fillStyle = '#cbd5e1'
  ctx.fillText('ESP32-C3', 256, 178)
  ctx.font = '600 16px "JetBrains Mono", monospace'
  ctx.fillText('SuperMini', 256, 200)
  ctx.fillStyle = '#94a3b8'
  ctx.font = '600 14px "JetBrains Mono", monospace'
  ctx.fillText('BOOT', 150, 128)
  ctx.fillText('RST', 362, 128)
  ctx.fillText('LED8', 155, 290)
  ctx.fillText('2.4G ANT', 256, 558)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

export function createEsp32ChipTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#1d2026'
  ctx.fillRect(0, 0, 256, 256)

  // Pin-1 laser dot
  ctx.fillStyle = '#94a3b8'
  ctx.beginPath()
  ctx.arc(38, 38, 12, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#cbd5e1'
  ctx.textAlign = 'center'
  ctx.font = 'bold 34px "JetBrains Mono", monospace'
  ctx.fillText('ESP32-C3', 128, 118)
  ctx.font = '600 24px "JetBrains Mono", monospace'
  ctx.fillStyle = '#94a3b8'
  ctx.fillText('FH4', 128, 156)
  ctx.font = '500 18px "JetBrains Mono", monospace'
  ctx.fillText('QFN32', 128, 192)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// ============================================================================
// AAA NiMH Battery Texture ("1.2V NiMH")
// ============================================================================
export function createBatteryTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')!

  // Clean modern brushed silver & emerald NiMH rechargeable wrap
  ctx.fillStyle = '#e5e9ef'
  ctx.fillRect(0, 0, 512, 512)

  // Green upper band (+ side)
  const gBand = ctx.createLinearGradient(0, 0, 0, 175)
  gBand.addColorStop(0, '#0f7a43')
  gBand.addColorStop(1, '#159957')
  ctx.fillStyle = gBand
  ctx.fillRect(0, 0, 512, 165)

  // Subtle dark slate bottom ring (- side)
  ctx.fillStyle = '#2c3340'
  ctx.fillRect(0, 442, 512, 70)

  // + and - polarity indicators
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 48px Inter, system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('+', 128, 64)
  ctx.fillText('+', 384, 64)
  ctx.fillText('−', 128, 492)
  ctx.fillText('−', 384, 492)

  // Main readable typography repeated around all 4 cylinder faces so always visible from above
  const drawLabel = (cx: number) => {
    ctx.save()
    ctx.translate(cx, 295)
    ctx.rotate(-Math.PI / 2)
    ctx.fillStyle = '#0f172a'
    ctx.font = 'bold 34px Inter, system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('1.2V NiMH', 0, -4)
    ctx.fillStyle = '#0f7a43'
    ctx.font = '700 18px "JetBrains Mono", monospace'
    ctx.fillText('AAA • 950mAh', 0, 22)
    ctx.restore()
  }
  drawLabel(64)
  drawLabel(192)
  drawLabel(320)
  drawLabel(448)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

// ============================================================================
// CR2032 Coin Cell Metallic Stamp Texture
// ============================================================================
export function createCr2032Texture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')!

  const rad = ctx.createRadialGradient(220, 210, 20, 256, 256, 256)
  rad.addColorStop(0, '#f3f6fa')
  rad.addColorStop(0.65, '#cfd6e0')
  rad.addColorStop(1, '#9ca6b5')
  ctx.fillStyle = rad
  ctx.fillRect(0, 0, 512, 512)

  // Circular brushed rings
  ctx.strokeStyle = 'rgba(255,255,255,0.28)'
  ctx.lineWidth = 2
  for (let r = 40; r < 245; r += 16) {
    ctx.beginPath()
    ctx.arc(256, 256, r, 0, Math.PI * 2)
    ctx.stroke()
  }

  ctx.fillStyle = '#334155'
  ctx.textAlign = 'center'
  ctx.font = 'bold 64px Inter, system-ui, sans-serif'
  ctx.fillText('+', 256, 132)
  ctx.font = 'bold 52px "JetBrains Mono", monospace'
  ctx.fillText('CR2032', 256, 258)
  ctx.font = '600 32px Inter, system-ui, sans-serif'
  ctx.fillText('3V LITHIUM', 256, 316)
  ctx.fillStyle = '#b45309'
  ctx.font = 'bold 24px Inter, system-ui, sans-serif'
  ctx.fillText('RAM BACKUP', 256, 378)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// ============================================================================
// Axial Resistor Color-Band Texture (10kΩ Braun-Schwarz-Orange-Gold / 1kΩ Braun-Schwarz-Rot-Gold)
// ============================================================================
export function createResistorTexture(bands: [string, string, string, string]): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 512
  const ctx = canvas.getContext('2d')!

  // Classic warm beige ceramic resistor body
  const bg = ctx.createLinearGradient(0, 0, 256, 0)
  bg.addColorStop(0, '#d7be91')
  bg.addColorStop(0.5, '#e8d3ab')
  bg.addColorStop(1, '#cfb382')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, 256, 512)

  // 4 Color bands horizontally across cylinder height (v axis)
  const positions = [92, 174, 256, 378]
  const widths = [38, 38, 38, 36]
  bands.forEach((color, idx) => {
    ctx.fillStyle = color
    ctx.fillRect(0, positions[idx], 256, widths[idx])
  })

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// ============================================================================
// AO3401 SOT-23 Top Laser Marking ("A19T")
// ============================================================================
export function createAo3401Texture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 128
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#1b1d22'
  ctx.fillRect(0, 0, 256, 128)

  // Subtle molded chamfer highlight
  ctx.strokeStyle = 'rgba(255,255,255,0.12)'
  ctx.lineWidth = 4
  ctx.strokeRect(8, 8, 240, 112)

  // Pin 1 indicator dot
  ctx.fillStyle = '#f59e0b'
  ctx.beginPath()
  ctx.arc(34, 34, 9, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#f8fafc'
  ctx.textAlign = 'center'
  ctx.font = 'bold 56px "JetBrains Mono", monospace'
  ctx.fillText('A19T', 136, 84)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// ============================================================================
// 1N4007 Diode Texture (Black Epoxy + Prominent Metallic Silver Cathode Ring)
// ============================================================================
export function createDiodeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 512
  const ctx = canvas.getContext('2d')!

  // Glossy black DO-41 epoxy body
  ctx.fillStyle = '#15171c'
  ctx.fillRect(0, 0, 256, 512)

  // Prominent bright silver cathode ring near +Y end (maps to +Z towards ESP32 5V!)
  const silver = ctx.createLinearGradient(0, 0, 256, 0)
  silver.addColorStop(0, '#cbd5e1')
  silver.addColorStop(0.5, '#ffffff')
  silver.addColorStop(1, '#94a3b8')
  ctx.fillStyle = silver
  ctx.fillRect(0, 38, 256, 98)

  // Crisp white "1N4007" part code
  ctx.save()
  ctx.translate(128, 315)
  ctx.rotate(-Math.PI / 2)
  ctx.fillStyle = '#e2e8f0'
  ctx.textAlign = 'center'
  ctx.font = 'bold 42px "JetBrains Mono", monospace'
  ctx.fillText('1N4007', 0, 14)
  ctx.restore()

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// ============================================================================
// C1: 100 µF / 10 V Electrolytic Capacitor Texture (Bold White '-' Stripe)
// ============================================================================
export function createCap100uFTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')!

  // Deep glossy midnight-blue capacitor sleeve
  ctx.fillStyle = '#13213c'
  ctx.fillRect(0, 0, 512, 512)

  // Broad bright white/silver MINUS stripe on the '-' side
  ctx.fillStyle = '#edf2f7'
  ctx.fillRect(356, 0, 108, 512)

  // Bold dark '-' arrows along the white stripe
  ctx.fillStyle = '#1e293b'
  ctx.font = 'bold 58px Inter, system-ui, sans-serif'
  ctx.textAlign = 'center'
  for (let y = 76; y < 480; y += 98) {
    ctx.fillText('−', 410, y)
  }

  // Value markings on dark blue sleeve
  ctx.save()
  ctx.translate(185, 256)
  ctx.rotate(-Math.PI / 2)
  ctx.fillStyle = '#f8fafc'
  ctx.textAlign = 'center'
  ctx.font = 'bold 54px "JetBrains Mono", monospace'
  ctx.fillText('100µF 10V', 0, -14)
  ctx.fillStyle = '#93c5fd'
  ctx.font = '600 30px "JetBrains Mono", monospace'
  ctx.fillText('105°C LOW-ESR', 0, 32)
  ctx.restore()

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}
