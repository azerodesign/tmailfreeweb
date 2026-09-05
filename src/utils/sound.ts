// Web Audio API simple pleasant notification chime (no external audio assets needed)
let audioCtx: AudioContext | null = null

export function playDingSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return

    if (!audioCtx) {
      audioCtx = new AudioContextClass()
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume()
    }

    const now = audioCtx.currentTime
    const osc1 = audioCtx.createOscillator()
    const osc2 = audioCtx.createOscillator()
    const gain = audioCtx.createGain()

    // Dual-tone chime: High bell tone
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(880, now) // A5
    osc1.frequency.exponentialRampToValueAtTime(1760, now + 0.15) // A6

    osc2.type = 'triangle'
    osc2.frequency.setValueAtTime(1320, now) // E6

    // Envelope
    gain.gain.setValueAtTime(0.001, now)
    gain.gain.linearRampToValueAtTime(0.2, now + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5)

    osc1.connect(gain)
    osc2.connect(gain)
    gain.connect(audioCtx.destination)

    osc1.start(now)
    osc2.start(now)
    osc1.stop(now + 0.5)
    osc2.stop(now + 0.5)
  } catch {
    // browser blocked autoplay or unsupported
  }
}
