interface LogoIconProps {
  className?: string
  size?: number
  bubbleColor?: string
  flameColor?: string
}

export default function LogoIcon({
  className,
  size = 40,
  bubbleColor = 'currentColor',
  flameColor = '#f97316' // orange-500
}: LogoIconProps) {
  return (
    <svg
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Chat bubble outline */}
      <path
        fill="none"
        stroke={bubbleColor}
        strokeLinejoin="round"
        strokeWidth="32"
        d="M408 64H104a56.16 56.16 0 0 0-56 56v192a56.16 56.16 0 0 0 56 56h40v80l93.72-78.14a8 8 0 0 1 5.13-1.86H408a56.16 56.16 0 0 0 56-56V120a56.16 56.16 0 0 0-56-56z"
      />

      {/* Flame (scaled to 38% and positioned at 50% x, 42% y) */}
      <g transform="translate(256, 215) scale(0.38) translate(-192, -256)">
        <path
          fill={flameColor}
          d="M153.6 29.9l16-21.3C173.6 3.2 180 0 186.7 0C198.4 0 208 9.6 208 21.3V43.5c0 13.1 5.4 25.7 14.9 34.7L307.6 159C356.4 205.6 384 270.2 384 337.7C384 434 306 512 209.7 512H192C86 512 0 426 0 320v-3.8c0-48.8 19.4-95.6 53.9-130.1l3.5-3.5c4.2-4.2 10-6.6 16-6.6C85.9 176 96 186.1 96 198.6V288c0 35.3 28.7 64 64 64s64-28.7 64-64v-3.9c0-18-7.2-35.3-19.9-48l-38.6-38.6c-24-24-37.5-56.7-37.5-90.7c0-27.7 9-54.8 25.6-76.9z"
        />
      </g>
    </svg>
  )
}
