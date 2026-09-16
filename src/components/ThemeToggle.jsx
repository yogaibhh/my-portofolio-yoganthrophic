import Icon from './Icon'
import useTheme from '../hooks/useTheme'

/* Sun/moon crossfade — both icons stay mounted so the swap animates. */
export default function ThemeToggle({ className = '' }) {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className={`relative grid h-9 w-9 place-items-center rounded-lg border border-hairline text-body transition-colors hover:border-primary hover:text-primary cursor-pointer ${className}`}
    >
      <span
        className="col-start-1 row-start-1 transition-all duration-500"
        style={{
          opacity: isDark ? 0 : 1,
          transform: isDark ? 'rotate(-90deg) scale(0.4)' : 'rotate(0) scale(1)',
        }}
      >
        <Icon name="sun" size={17} />
      </span>
      <span
        className="col-start-1 row-start-1 transition-all duration-500"
        style={{
          opacity: isDark ? 1 : 0,
          transform: isDark ? 'rotate(0) scale(1)' : 'rotate(90deg) scale(0.4)',
        }}
      >
        <Icon name="moon" size={17} />
      </span>
    </button>
  )
}
