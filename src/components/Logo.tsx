import LogoIcon from './LogoIcon'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  size?: number
}

export default function Logo({ className, size = 40 }: LogoProps) {
  return (
    <LogoIcon
      className={cn("flex-shrink-0 text-foreground", className)}
      size={size}
    />
  )
}
