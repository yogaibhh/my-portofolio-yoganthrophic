import useReveal from '../hooks/useReveal'

/* Scroll-triggered entrance wrapper.
   variant: 'up' (default) | 'left' | 'right' | 'scale' | 'blur' */
export default function Reveal({
  as: Tag = 'div',
  delay = 0,
  variant = 'up',
  className = '',
  style,
  children,
  ...rest
}) {
  const ref = useReveal()

  return (
    <Tag
      ref={ref}
      data-variant={variant}
      className={`reveal ${className}`.trim()}
      style={delay ? { animationDelay: `${delay}ms`, ...style } : style}
      {...rest}
    >
      {children}
    </Tag>
  )
}
