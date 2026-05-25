'use client'

export function BackgroundCanvas() {
  return (
    <>
      <div
        aria-hidden
        style={{
          position: 'fixed',
          top: -80,
          left: -20,
          width: 340,
          height: 340,
          borderRadius: '50%',
          background: 'rgba(239, 159, 39, 0.13)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
          zIndex: -1,
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'fixed',
          bottom: -60,
          right: -20,
          width: 260,
          height: 260,
          borderRadius: '50%',
          background: 'rgba(110, 75, 180, 0.08)',
          filter: 'blur(70px)',
          pointerEvents: 'none',
          zIndex: -1,
        }}
      />
    </>
  )
}
