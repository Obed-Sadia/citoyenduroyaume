interface ZoneGriseProps {
  points: string
  id: string
}

export function ZoneGrise({ points, id }: ZoneGriseProps) {
  const patternId = `zone-grise-${id}`
  return (
    <>
      <defs>
        <pattern
          id={patternId}
          x="0"
          y="0"
          width="6"
          height="6"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="3" cy="3" r="0.8" fill="rgba(120,115,110,0.12)" />
        </pattern>
      </defs>
      <polygon points={points} fill={`url(#${patternId})`} />
    </>
  )
}
