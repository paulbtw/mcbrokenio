'use client'

import { useMcStats } from '@/hooks/queries/useMcStats'
import { useMemo } from 'react'

function Section({ name, percentage }: { name: string, percentage?: number }) {
  return (
    <div key={name} className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
    <dt className="truncate text-sm font-medium text-gray-500">{name}</dt>
    <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{percentage?.toFixed(2)} %</dd>
    <span></span>
  </div>
  )
}

export function Stats() {
  const { data } = useMcStats()

  const stats = useMemo(() => {
    const totalStats = data != null ? data.find((item) => item.country === 'UNKNOWN') : undefined
    const trackablePercentage = (totalStats?.total != null && totalStats.trackable != null) ? totalStats?.trackable / totalStats?.total * 100 : undefined
    const milkshakePercentage = (totalStats?.totalmilkshakes != null && totalStats.availablemilkshakes != null) ? totalStats?.availablemilkshakes / totalStats?.totalmilkshakes * 100 : undefined
    const mcFlurryPercentage = (totalStats?.totalmilkshakes != null && totalStats.availablemcflurry != null) ? totalStats?.availablemcflurry / totalStats?.totalmcflurry * 100 : undefined
    const mcSundaePercentage = (totalStats?.totalmcsundae != null && totalStats.availablemcsundae != null) ? totalStats?.availablemcsundae / totalStats?.totalmcsundae * 100 : undefined

    return {
      trackablePercentage,
      milkshakePercentage,
      mcFlurryPercentage,
      mcSundaePercentage
    }
  }, [data])

  return (
    <div>
    <dl className="my-5 grid grid-cols-1 gap-5 sm:grid-cols-4">
    <Section name={'Trackable Stores'} percentage={stats.trackablePercentage} />
    <Section name={'Milkshakes Availablility'} percentage={stats.milkshakePercentage} />
    <Section name={'McFlurries Availablility'} percentage={stats.mcFlurryPercentage} />
    <Section name={'McSundaes Availablility'} percentage={stats.mcSundaePercentage} />
    </dl>
  </div>
  )
}
