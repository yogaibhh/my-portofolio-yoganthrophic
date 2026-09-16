import { Suspense } from 'react'
import { demos } from './demoRegistry'

export default function DashboardDemo({ id }) {
  const Cmp = demos[id]
  if (!Cmp) return null

  return (
    <Suspense
      fallback={
        <div className="flex h-[760px] items-center justify-center rounded-xl bg-surface-soft text-sm text-muted-soft">
          Loading live demo…
        </div>
      }
    >
      <Cmp />
    </Suspense>
  )
}
