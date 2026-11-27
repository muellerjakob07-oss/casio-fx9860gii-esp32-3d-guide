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
// Casio fx-9860GII Authentic Two-Tone Front Faceplate Texture (matches image_6.png!)
// Pearl-Silver Outer Body + Dark Anthracite Display/Function Inlay
// ============================================================================
export function createCasioFrontTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 2048
  const ctx = canvas.getContext('2d')!

  // Pearl-silver / light warm-white outer shell (exact match to image_6.png!)
  const bodyGrad = ctx.createLinearGradient(0, 0, 1024, 2048)
  bodyGrad.addColorStop(0, '#e6e9ef')
  bodyGrad.addColorStop(0.5, '#dcdfe6')
  bodyGrad.addColorStop(1, '#cfd4dd')
  ctx.fillStyle = bodyGrad
  ctx.fillRect(0, 0, 1024, 2048)

  // Sculpted Dark Anthracite Bezel + Upper Function Keypad Inlay
  const inlayGrad = ctx.createLinearGradient(0, 145, 0, 1300)
  inlayGrad.addColorStop(0, '#272a31')
  inlayGrad.addColorStop(0.55, '#2f333c')
  inlayGrad.addColorStop(1, '#363b45')
  ctx.fillStyle = inlayGrad
  ctx.beginPath()
  ctx.roundRect(74, 148, 876, 1148, 42)
  ctx.fill()

  // Recessed Dark LCD Window Frame
  ctx.fillStyle = '#1b1e24'
  ctx.beginPath()
  ctx.roundRect(102, 174, 820, 488, 20)
  ctx.fill()

  // CASIO Logo (bold dark navy/slate on silver header) & italic fx-9860GII
  ctx.fillStyle = '#2d3340'
  ctx.textAlign = 'left'
  ctx.font = '900 44px Inter, system-ui, sans-serif'
  ctx.fillText('CASIO', 112, 118)

  ctx.fillStyle = '#3c4252'
  ctx.textAlign = 'right'
  ctx.font = 'italic 700 32px Georgia, serif'
  ctx.fillText('fx-9860GII', 908, 116)

  // USB POWER GRAPHIC 2 under LCD
  ctx.textAlign = 'center'
  ctx.fillStyle = '#f1f5f9'
  ctx.font = '700 22px Inter, system-ui, sans-serif'
  ctx.fillText('USB POWER GRAPHIC 2', 512, 704)

  // F1-F6 golden shift labels + silver oval keys
  const fMeta = [
    ['F1', 'Trace'],
    ['F2', 'Zoom'],
    ['F3', 'V-Window'],
    ['F4', 'Sketch'],
    ['F5', 'G-Solv'],
    ['F6', 'G↔T'],
  ]
  fMeta.forEach(([key, sub], i) => {
    const x = 144 + i * 147
    ctx.fillStyle = '#e0a93b'
    ctx.font = '600 16px Inter, system-ui, sans-serif'
    ctx.fillText(sub, x, 756)

    ctx.fillStyle = '#d8dde6'
    ctx.beginPath()
    ctx.roundRect(x - 44, 770, 88, 52, 20)
    ctx.fill()

    ctx.fillStyle = '#232730'
    ctx.font = 'bold 22px Inter, system-ui, sans-serif'
    ctx.fillText(key, x, 804)
  })

  // Blue sun icon + LIGHT label above OPTN
  ctx.fillStyle = '#38bdf8'
  ctx.font = 'bold 16px Inter, system-ui, sans-serif'
  ctx.fillText('☀ LIGHT', 302, 874)
  ctx.fillStyle = '#e0a93b'
  ctx.fillText('PRGM', 452, 874)
  ctx.fillText('SET UP', 602, 874)

  // Control keys (SHIFT, OPTN, VARS, MENU / ALPHA, x², ^, EXIT)
  const ctrlRows: { label: string; x: number; y: number; bg: string; fg: string }[] = [
    { label: 'SHIFT', x: 152, y: 916, bg: '#e39d25', fg: '#ffffff' },
    { label: 'OPTN', x: 302, y: 916, bg: '#22262e', fg: '#f8fafc' },
    { label: 'VARS', x: 452, y: 916, bg: '#22262e', fg: '#f8fafc' },
    { label: 'MENU', x: 602, y: 916, bg: '#22262e', fg: '#f8fafc' },
    { label: 'ALPHA', x: 152, y: 1012, bg: '#d94832', fg: '#ffffff' },
    { label: 'x²', x: 302, y: 1012, bg: '#22262e', fg: '#f8fafc' },
    { label: '∧', x: 452, y: 1012, bg: '#22262e', fg: '#f8fafc' },
    { label: 'EXIT', x: 602, y: 1012, bg: '#22262e', fg: '#f8fafc' },
  ]
  for (const k of ctrlRows) {
    ctx.fillStyle = k.bg
    ctx.beginPath()
    ctx.roundRect(k.x - 54, k.y - 27, 108, 54, 16)
    ctx.fill()
    ctx.fillStyle = k.fg
    ctx.font = 'bold 22px Inter, system-ui, sans-serif'
    ctx.fillText(k.label, k.x, k.y + 8)
  }

  // Pearl-Silver Circular REPLAY D-Pad on right side (matches image_6.png!)
  const rx = 808
  const ry = 964
  const dGrad = ctx.createRadialGradient(rx - 18, ry - 18, 12, rx, ry, 106)
  dGrad.addColorStop(0, '#eef1f6')
  dGrad.addColorStop(0.7, '#cfd5e0')
  dGrad.addColorStop(1, '#9aa2b1')
  ctx.fillStyle = dGrad
  ctx.beginPath()
  ctx.arc(rx, ry, 102, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#aeb6c4'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(rx, ry, 62, 0, Math.PI * 2)
  ctx.stroke()
  ctx.fillStyle = '#7c8596'
  ctx.font = '600 16px Inter, system-ui, sans-serif'
  ctx.fillText('REPLAY', rx, ry + 6)

  // Scientific rows (dark charcoal keys inside inlay)
  const sciRows = [
    ['X,θ,T', 'log', 'ln', 'sin', 'cos', 'tan'],
    ['a b/c', 'F↔D', '(', ')', ',', '→'],
  ]
  sciRows.forEach((row, rIdx) => {
    row.forEach((lbl, cIdx) => {
      const x = 144 + cIdx * 147
      const y = 1134 + rIdx * 100
      ctx.fillStyle = '#1f232b'
      ctx.beginPath()
      ctx.roundRect(x - 52, y - 27, 104, 54, 15)
      ctx.fill()
      ctx.fillStyle = '#f8fafc'
      ctx.font = 'bold 22px Inter, system-ui, sans-serif'
      ctx.fillText(lbl, x, y + 8)
    })
  })

  // Lower Numeric Keypad on Light Pearl-Silver Body (white keys + slate-blue DEL/AC/EXE!)
  const numRows = [
    ['7', '8', '9', 'DEL', 'AC/ON'],
    ['4', '5', '6', '×', '÷'],
    ['1', '2', '3', '+', '−'],
    ['0', '·', 'EXP', '(−)', 'EXE'],
  ]
  numRows.forEach((row, rIdx) => {
    row.forEach((lbl, cIdx) => {
      const x = 156 + cIdx * 178
      const y = 1390 + rIdx * 148
      const isAction = lbl === 'DEL' || lbl === 'AC/ON' || lbl === 'EXE'
      ctx.fillStyle = isAction ? '#9eb2c7' : '#f7f8fa'
      ctx.strokeStyle = 'rgba(15,23,42,0.18)'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.roundRect(x - 68, y - 42, 136, 84, 24)
      ctx.fill()
      ctx.stroke()

      ctx.fillStyle = '#1e2430'
      ctx.font = `bold ${lbl.length > 2 ? 25 : 36}px Inter, system-ui, sans-serif`
      ctx.fillText(lbl, x, y + 12)
    })
  })

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

// ============================================================================
// Casio Matte Black Rear Shell Texture (Horizontal 4xAAA Cutout + RESET Hole)
// ============================================================================
export function createCasioBackTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 1024
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#181b21'
  ctx.fillRect(0, 0, 512, 1024)

  // Subtle matte ABS grain
  ctx.fillStyle = 'rgba(255,255,255,0.016)'
  for (let i = 0; i < 1600; i++) {
    ctx.fillRect((i * 73) % 512, (i * 139) % 1024, 2, 2)
  }

  // Molded recessed rating plate on upper half
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'
  ctx.lineWidth = 2
  ctx.strokeRect(110, 128, 292, 146)

  ctx.fillStyle = 'rgba(226,232,240,0.38)'
  ctx.textAlign = 'center'
  ctx.font = 'bold 22px Inter, system-ui, sans-serif'
  ctx.fillText('CASIO fx-9860GII', 256, 168)
  ctx.font = '500 13px Inter, system-ui, sans-serif'
  ctx.fillText('RATING: DC 6V  0.06W', 256, 198)
  ctx.fillText('USE 4 × AAA SIZE (LR03 / NiMH)', 256, 224)
  ctx.fillText('MADE IN CHINA • GY493', 256, 250)

  // Plane spans X: -40.75..+40.75 (w=81.5), Z: -89..+89 (h=178)
  const xToPx = (x: number) => ((x + 40.75) / 81.5) * 512
  const zToPx = (z: number) => ((z + 89.0) / 178.0) * 1024

  // RESET pinhole ring over SW301 (-24, -4.5)
  const rx = xToPx(-24.0)
  const rz = zToPx(-4.5)
  ctx.strokeStyle = 'rgba(226,232,240,0.45)'
  ctx.beginPath()
  ctx.arc(rx, rz, 10, 0, Math.PI * 2)
  ctx.stroke()
  ctx.fillStyle = '#050608'
  ctx.beginPath()
  ctx.arc(rx, rz, 4.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = 'rgba(226,232,240,0.45)'
  ctx.font = 'bold 11px Inter, system-ui, sans-serif'
  ctx.fillText('RESET', rx, rz - 14)

  // Cut transparent opening for horizontal 4x AAA battery compartment (X: -20..+32, Z: +26..+72)
  ctx.clearRect(xToPx(-20.5), zToPx(25.5), xToPx(32.5) - xToPx(-20.5), zToPx(72.5) - zToPx(25.5))

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// ============================================================================
// Upper CPU Daughterboard Texture: CY802-1 / RJA532593-001V01 (matches image_5.png!)
// Dimensions: 69.0 mm wide (X: -36.5..+32.5) x 82.5 mm long (Z: -81.0..+1.5)
// ============================================================================
export function createUpperCpuPcbTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 860
  canvas.height = 1024
  const ctx = canvas.getContext('2d')!

  const xPx = (x: number) => ((x - -36.5) / 69.0) * 860
  const zPx = (z: number) => ((z - -81.0) / 82.5) * 1024

  // Rich emerald green soldermask
  const bg = ctx.createLinearGradient(0, 0, 860, 1024)
  bg.addColorStop(0, '#0f6c3c')
  bg.addColorStop(0.5, '#127a44')
  bg.addColorStop(1, '#0c5b32')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, 860, 1024)

  // Fine copper trace routing across CPU board
  ctx.strokeStyle = '#209c5c'
  ctx.lineWidth = 2.6
  for (let i = 0; i < 36; i++) {
    const sx = 65 + i * 21
    ctx.beginPath()
    ctx.moveTo(sx, 75)
    ctx.lineTo(sx, 260 + (i % 6) * 28)
    ctx.lineTo(xPx(3.0) + (i - 18) * 6, zPx(-41.5))
    ctx.stroke()
  }
  for (let i = 0; i < 22; i++) {
    const sy = 180 + i * 34
    ctx.beginPath()
    ctx.moveTo(45, sy)
    ctx.lineTo(815, sy + ((i % 3) - 1) * 18)
    ctx.stroke()
  }

  // Diagonal hatch copper-free zone above U101 (visible in image_5.png!)
  ctx.strokeStyle = 'rgba(180,235,200,0.28)'
  ctx.lineWidth = 2
  for (let d = 0; d < 90; d += 12) {
    ctx.beginPath()
    ctx.moveTo(xPx(-10), zPx(-65) + d)
    ctx.lineTo(xPx(-5), zPx(-68) + d)
    ctx.stroke()
  }

  // Gold plated vias
  for (let i = 0; i < 75; i++) {
    const vx = 55 + ((i * 173) % 750)
    const vy = 75 + ((i * 229) % 890)
    ctx.fillStyle = '#d8b243'
    ctx.beginPath()
    ctx.arc(vx, vy, 5.2, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#07321b'
    ctx.beginPath()
    ctx.arc(vx, vy, 2.2, 0, Math.PI * 2)
    ctx.fill()
  }

  // Double white silkscreen rounded borders around U101 (Main CPU COB) & U301 (Secondary COB)
  ctx.strokeStyle = 'rgba(248, 250, 252, 0.92)'
  ctx.lineWidth = 4.5
  ctx.beginPath()
  ctx.roundRect(xPx(-7.5), zPx(-51.2), 21.0 * (860 / 69), 19.4 * (1024 / 82.5), 48)
  ctx.stroke()
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.roundRect(xPx(-9.2), zPx(-52.8), 24.4 * (860 / 69), 22.6 * (1024 / 82.5), 56)
  ctx.stroke()

  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.roundRect(xPx(-27.8), zPx(-55.2), 13.6 * (860 / 69), 14.4 * (1024 / 82.5), 34)
  ctx.stroke()
  ctx.lineWidth = 2.2
  ctx.beginPath()
  ctx.roundRect(xPx(-29.2), zPx(-56.8), 16.4 * (860 / 69), 17.6 * (1024 / 82.5), 42)
  ctx.stroke()

  // Unpopulated JN101 gold SD-card / expansion finger pads on upper-left edge (exact match to image_5.png!)
  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(xPx(-35.8), zPx(-67.2), 34, 152)
  for (let p = 0; p < 9; p++) {
    ctx.fillStyle = '#e5b949'
    ctx.fillRect(xPx(-32.6), zPx(-66.6 + p * 1.45), 62, 12)
  }

  // White silkscreen boxes around CN401's square gold test pads (top-left!)
  const drawGoldBoxPad = (mx: number, mz: number) => {
    const px = xPx(mx)
    const pz = zPx(mz)
    ctx.strokeStyle = '#f8fafc'
    ctx.lineWidth = 2.5
    ctx.strokeRect(px - 19, pz - 19, 38, 38)
    ctx.fillStyle = '#e6b84a'
    ctx.fillRect(px - 14, pz - 14, 28, 28)
  }
  drawGoldBoxPad(-19.5, -76.8)
  drawGoldBoxPad(-19.5, -73.0)
  drawGoldBoxPad(-24.8, -70.8)
  drawGoldBoxPad(-29.2, -68.8)

  // Two gold square test pads at bottom edge next to C302 (visible in image_5.png!)
  ctx.fillStyle = '#e6b84a'
  ctx.fillRect(xPx(-10.5), zPx(-3.6), 34, 42)
  ctx.fillRect(xPx(-6.5), zPx(-3.6), 34, 42)

  // Gold meandering RESET contact SW301 at bottom-left (-24.0, -4.5)
  const swX = xPx(-24.0)
  const swZ = zPx(-4.5)
  ctx.strokeStyle = 'rgba(248,250,252,0.85)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(swX, swZ, 44, 0, Math.PI * 2)
  ctx.stroke()
  ctx.fillStyle = '#e6b84a'
  ctx.beginPath()
  ctx.arc(swX, swZ, 22, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#0c5b32'
  ctx.lineWidth = 3.5
  for (let m = -14; m <= 14; m += 7) {
    ctx.beginPath()
    ctx.moveTo(swX + m, swZ - 16)
    ctx.lineTo(swX + m, swZ + 16)
    ctx.stroke()
  }

  // Dark through-hole circle above C302 (-1.2, -15.0)
  ctx.fillStyle = '#090b0f'
  ctx.beginPath()
  ctx.arc(xPx(-1.2), zPx(-15.0), 22, 0, Math.PI * 2)
  ctx.fill()

  // Authentic White Silkscreen Labels from CY802-1 / RJA532593-001V01
  ctx.fillStyle = 'rgba(248, 250, 252, 0.92)'
  ctx.font = 'bold 18px "JetBrains Mono", monospace'
  ctx.textAlign = 'left'
  ctx.fillText('CN401', xPx(-29.5), zPx(-74.0))
  ctx.fillText('P902', xPx(-35.2), zPx(-78.0))
  ctx.fillText('Y', xPx(-22.2), zPx(-72.2))
  ctx.fillText('JN101', xPx(-35.8), zPx(-52.5))
  ctx.fillText('U301', xPx(-15.0), zPx(-46.5))
  ctx.fillText('U101', xPx(11.5), zPx(-51.5))
  ctx.fillText('CN102', xPx(14.5), zPx(-71.2))
  ctx.fillText('SW301', xPx(-26.8), zPx(0.4))
  ctx.fillText('C302', xPx(1.8), zPx(-2.0))

  // N40A3585 box
  ctx.strokeStyle = '#f8fafc'
  ctx.lineWidth = 2
  ctx.strokeRect(xPx(-11.8), zPx(-22.2), 96, 38)
  ctx.font = 'bold 13px "JetBrains Mono", monospace'
  ctx.fillText('N40A3585', xPx(-11.2), zPx(-20.4))
  ctx.fillText('A30C5', xPx(-10.2), zPx(-19.2))

  // Vertical right-edge board codes: CY802-1 & RJA532593-001V01
  ctx.save()
  ctx.translate(xPx(29.8), zPx(-12.0))
  ctx.rotate(-Math.PI / 2)
  ctx.font = 'bold 22px "JetBrains Mono", monospace'
  ctx.fillText('CY802-1', 0, 0)
  ctx.font = 'bold 19px "JetBrains Mono", monospace'
  ctx.fillText('RJA532593-001V01', 165, 0)
  ctx.font = '600 14px "JetBrains Mono", monospace'
  ctx.fillText('1S 29-SG071  94V-0', 95, -22)
  ctx.restore()

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

// ============================================================================
// Lower Keypad Mainboard Texture: GY493-E4W / RJA520455-001V02 (matches image_5.png!)
// Dimensions: 74.0 mm wide (X: -37.0..+37.0) x 111.0 mm long (Z: -26.0..+85.0)
// Includes all 7 white spacer blocks + all 19 gold test points T701..T719!
// ============================================================================
export function createLowerKeypadPcbTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 740
  canvas.height = 1110
  const ctx = canvas.getContext('2d')!

  const xPx = (x: number) => ((x - -37.0) / 74.0) * 740
  const zPx = (z: number) => ((z - -26.0) / 111.0) * 1110

  // Authentic rich green keypad PCB soldermask
  const bg = ctx.createLinearGradient(0, 0, 740, 1110)
  bg.addColorStop(0, '#0c6838')
  bg.addColorStop(0.55, '#0e743f')
  bg.addColorStop(1, '#0a582f')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, 740, 1110)

  // Darker forest-green organic curved keypad matrix traces (characteristic of GY493-E4W!)
  ctx.strokeStyle = '#063d20'
  ctx.lineWidth = 4.5
  const tracePaths: [number, number][][] = [
    [[-31, -18], [-31, 18], [-27, 36], [-26, 65]],
    [[-26, -15], [-26, 14], [-18, 32], [-18, 72]],
    [[-19, -10], [-19, 18], [-8, 35], [-8, 68]],
    [[-8, 6], [6, 18], [16, 18], [26, 28]],
    [[2, 12], [-6, 26], [-6, 48], [2, 64]],
    [[14, 14], [6, 30], [6, 54], [14, 68]],
    [[24, 12], [18, 24], [14, 44], [22, 60]],
    [[-28, 44], [-14, 44], [-2, 56], [10, 56]],
  ]
  for (const path of tracePaths) {
    ctx.beginPath()
    path.forEach(([mx, mz], idx) => {
      if (idx === 0) ctx.moveTo(xPx(mx), zPx(mz))
      else ctx.lineTo(xPx(mx), zPx(mz))
    })
    ctx.stroke()
  }

  // Dark carbon via dots along matrix traces
  const viaPts: [number, number][] = [
    [-22, 6], [-12, 6], [-18, 24], [-12, 24], [12, 24], [25, 21],
    [-28, 29], [-20, 29], [-12, 31], [-3, 31], [7, 37], [17, 37],
    [-33, 44], [-25, 44], [-3, 42], [6, 48], [16, 48], [24, 42],
    [-26, 56], [-18, 56], [4, 58], [18, 58], [-26, 70], [-14, 72], [-2, 72], [11, 68],
  ]
  for (const [vx, vz] of viaPts) {
    ctx.fillStyle = '#18221d'
    ctx.beginPath()
    ctx.arc(xPx(vx), zPx(vz), 5.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#24995c'
    ctx.lineWidth = 1.5
    ctx.stroke()
  }

  // All 7 Crisp White Silkscreen Spacer Rectangles (exact coordinates from im5_mm_grid.png!)
  ctx.fillStyle = '#e9eef4'
  const whiteBlocks: [number, number, number, number][] = [
    [-11.0, 11.2, 21.5, 5.2], // Center wide bar below JN701 / C302
    [-25.2, 32.8, 6.2, 6.5], // Left upper spacer
    [-25.2, 59.5, 6.2, 6.8], // Left lower spacer
    [15.8, 26.2, 13.5, 11.0], // Right large block under P702 cone spring
    [21.2, 43.2, 6.8, 6.8], // Right middle block
    [22.5, 59.5, 6.5, 12.2], // Right lower block under P701 spiral spring
  ]
  for (const [bx, bz, bw, bh] of whiteBlocks) {
    ctx.fillRect(xPx(bx), zPx(bz), bw * 10, bh * 10)
  }

  // Iconic White Crescent 'C' Ring around left screw hole (-33.0, 56.0)
  ctx.strokeStyle = '#f1f5f9'
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.arc(xPx(-33.2), zPx(56.0), 26, -Math.PI * 0.45, Math.PI * 0.45)
  ctx.stroke()
  ctx.fillStyle = '#eab849'
  ctx.beginPath()
  ctx.arc(xPx(-33.2), zPx(56.0), 11, 0, Math.PI * 2)
  ctx.fill()

  // All 19 Numbered Gold Test Points (T701 .. T719) at exact photo coordinates!
  const testPoints: [string, number, number][] = [
    ['T701', 24.8, 59.8], // +V_BAT test pad!
    ['T702', 27.6, 37.8], // -V_BAT / GND test pad!
    ['T703', -20.5, 22.8],
    ['T704', -29.2, 18.2],
    ['T705', -27.5, 24.8],
    ['T706', -14.2, 70.8],
    ['T707', -3.0, 54.5],
    ['T708', -2.0, 42.8],
    ['T709', 15.2, 37.5],
    ['T710', -19.8, 25.0],
    ['T711', 2.5, 60.5],
    ['T712', 9.2, 52.5],
    ['T713', 12.0, 44.2],
    ['T714', 16.5, 44.5],
    ['T715', -10.8, 26.8],
    ['T716', -21.8, 10.2],
    ['T717', -31.2, 22.2],
    ['T718', -28.2, 13.5],
    ['T719', -33.8, 25.2],
  ]
  ctx.font = 'bold 14px "JetBrains Mono", monospace'
  ctx.textAlign = 'center'
  for (const [name, tx, tz] of testPoints) {
    const px = xPx(tx)
    const pz = zPx(tz)
    ctx.fillStyle = '#eab849'
    ctx.beginPath()
    ctx.arc(px, pz, name === 'T701' || name === 'T702' ? 11.5 : 8.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#f8fafc'
    ctx.fillText(name, px, pz - 13)
  }

  // Crisp Bottom Board Part Numbers: GY493-E4W / RJA520455-001V02 / 1528 / JN701 / P701 / P702
  ctx.fillStyle = '#f8fafc'
  ctx.font = 'bold 26px "JetBrains Mono", monospace'
  ctx.fillText('GY493-E4W', xPx(6.5), zPx(76.2))
  ctx.font = 'bold 21px "JetBrains Mono", monospace'
  ctx.fillText('RJA520455-001V02', xPx(2.0), zPx(80.5))
  ctx.font = 'bold 18px "JetBrains Mono", monospace'
  ctx.fillText('1528', xPx(-13.5), zPx(55.5))
  ctx.font = 'bold 15px "JetBrains Mono", monospace'
  ctx.fillText('V30S 94V-0', xPx(-9.0), zPx(64.8))
  ctx.fillText('JN701', xPx(-1.0), zPx(9.8))

  ctx.save()
  ctx.translate(xPx(35.0), zPx(39.5))
  ctx.rotate(-Math.PI / 2)
  ctx.fillText('P702', 0, 0)
  ctx.restore()

  ctx.save()
  ctx.translate(xPx(35.0), zPx(62.5))
  ctx.rotate(-Math.PI / 2)
  ctx.fillText('P701', 0, 0)
  ctx.restore()

  // N40A3585 bottom-left stamp box
  ctx.strokeStyle = '#f8fafc'
  ctx.lineWidth = 2
  ctx.strokeRect(xPx(-26.5), zPx(76.0), 82, 36)
  ctx.font = 'bold 12px "JetBrains Mono", monospace'
  ctx.fillText('N40A3585', xPx(-22.4), zPx(77.7))
  ctx.fillText('A30C5', xPx(-22.4), zPx(79.1))

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

// ============================================================================
// Macronix NOR Flash TSOP-48 Texture with Authentic White "9A" Factory Mark!
// ============================================================================
export function createMxicFlashTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 384
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#22252c'
  ctx.fillRect(0, 0, 256, 384)

  // Pin 1 dimple
  ctx.fillStyle = '#111318'
  ctx.beginPath()
  ctx.arc(38, 338, 12, 0, Math.PI * 2)
  ctx.fill()

  // Subtle laser-etched MXIC text
  ctx.save()
  ctx.translate(82, 192)
  ctx.rotate(Math.PI / 2)
  ctx.fillStyle = '#8b93a4'
  ctx.textAlign = 'center'
  ctx.font = 'bold 26px "JetBrains Mono", monospace'
  ctx.fillText('MXIC', 0, -22)
  ctx.font = '500 17px "JetBrains Mono", monospace'
  ctx.fillText('MX29LV320E', 0, 4)
  ctx.fillText('TAIWAN', 0, 26)
  ctx.restore()

  // Authentic white paint-marker factory inspection "9A" (exact match to image_5.png!)
  ctx.strokeStyle = 'rgba(241, 245, 249, 0.88)'
  ctx.lineWidth = 16
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  // Stylized '9' / 'A' brushstroke
  ctx.beginPath()
  ctx.arc(150, 145, 34, 0, Math.PI * 2)
  ctx.moveTo(182, 145)
  ctx.lineTo(148, 228)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(92, 298)
  ctx.lineTo(192, 248)
  ctx.lineTo(188, 326)
  ctx.moveTo(132, 278)
  ctx.lineTo(188, 294)
  ctx.stroke()

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// ============================================================================
// S30FE02 Dark-Brown Polyimide LCD Flex Cable Texture (Top Center of CY802-1)
// ============================================================================
export function createLcdKaptonFlexTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 256
  const ctx = canvas.getContext('2d')!

  // Dark amber-brown polyimide film
  const g = ctx.createLinearGradient(0, 0, 0, 256)
  g.addColorStop(0, '#3a2618')
  g.addColorStop(0.5, '#4c321e')
  g.addColorStop(1, '#382416')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 512, 256)

  // Fine copper trace lines shimmering under polyimide
  ctx.strokeStyle = 'rgba(217, 155, 78, 0.22)'
  ctx.lineWidth = 2
  for (let x = 24; x < 488; x += 8) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, 256)
    ctx.stroke()
  }

  // Silver solder alignment rivets left & right
  for (const sx of [68, 444]) {
    ctx.fillStyle = '#cbd5e1'
    ctx.beginPath()
    ctx.arc(sx, 128, 16, 0, Math.PI * 2)
    ctx.fill()
  }

  // Center dark stamp window with white "S30FE02" code (exact match to image_5.png!)
  ctx.fillStyle = '#242936'
  ctx.strokeStyle = 'rgba(255,255,255,0.28)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.roundRect(176, 98, 160, 56, 10)
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = '#f8fafc'
  ctx.textAlign = 'center'
  ctx.font = 'bold 24px "JetBrains Mono", monospace'
  ctx.fillText('S30FE02', 256, 135)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
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
