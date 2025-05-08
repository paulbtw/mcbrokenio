'use client'

import { Coffee, IceCream, Milk, Percent } from 'lucide-react'
import { useMemo } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useMcStats } from '@/hooks/queries/useMcStats'

export function Stats() {
  const { data, isLoading } = useMcStats()

  const stats = useMemo(() => {
    const totalStats = data?.find((item) => item.country === 'UNKNOWN')

    if (totalStats == null) {
      return {
        trackablePercentage: 0,
        milkshakePercentage: 0,
        mcFlurryPercentage: 0,
        mcSundaePercentage: 0
      }
    }

    const trackablePercentage =
      (totalStats?.trackable / totalStats?.total) * 100
    const milkshakePercentage =
      (totalStats?.availablemilkshakes / totalStats?.totalmilkshakes) * 100
    const mcFlurryPercentage =
      (totalStats?.availablemcflurry / totalStats?.totalmcflurry) * 100
    const mcSundaePercentage =
      (totalStats?.availablemcsundae / totalStats?.totalmcsundae) * 100

    return {
      trackablePercentage,
      milkshakePercentage,
      mcFlurryPercentage,
      mcSundaePercentage
    }
  }, [data])

  return (
    <>
      {/* Desktop stats display */}
      <div className="hidden grid-cols-1 gap-4 sm:grid-cols-2 md:grid lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Trackable Stores
            </CardTitle>
            <Percent className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            {isLoading
              ? (
              <Skeleton className="h-8 w-24" />
                )
              : (
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {stats?.trackablePercentage.toFixed(2)}%
              </div>
                )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Milkshakes Availability
            </CardTitle>
            <Milk className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            {isLoading
              ? (
              <Skeleton className="h-8 w-24" />
                )
              : (
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {stats?.milkshakePercentage.toFixed(2)}%
              </div>
                )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              McFlurries Availability
            </CardTitle>
            <IceCream className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            {isLoading
              ? (
              <Skeleton className="h-8 w-24" />
                )
              : (
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {stats?.mcFlurryPercentage.toFixed(2)}%
              </div>
                )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              McSundaes Availability
            </CardTitle>
            <Coffee className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            {isLoading
              ? (
              <Skeleton className="h-8 w-24" />
                )
              : (
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {stats?.mcSundaePercentage.toFixed(2)}%
              </div>
                )}
          </CardContent>
        </Card>
      </div>

      {/* Mobile stats display - more compact */}
      <div className="grid grid-cols-2 gap-3 md:hidden">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between p-3">
            <div>
              <p className="text-xs font-medium text-slate-500">Trackable</p>
              {isLoading
                ? (
                <Skeleton className="mt-1 h-6 w-16" />
                  )
                : (
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  {stats?.trackablePercentage.toFixed(2)}%
                </p>
                  )}
            </div>
            <Percent className="h-5 w-5 text-slate-500" />
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between p-3">
            <div>
              <p className="text-xs font-medium text-slate-500">Milkshakes</p>
              {isLoading
                ? (
                <Skeleton className="mt-1 h-6 w-16" />
                  )
                : (
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  {stats?.milkshakePercentage.toFixed(2)}%
                </p>
                  )}
            </div>
            <Milk className="h-5 w-5 text-slate-500" />
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between p-3">
            <div>
              <p className="text-xs font-medium text-slate-500">McFlurries</p>
              {isLoading
                ? (
                <Skeleton className="mt-1 h-6 w-16" />
                  )
                : (
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  {stats?.mcFlurryPercentage.toFixed(2)}%
                </p>
                  )}
            </div>
            <IceCream className="h-5 w-5 text-slate-500" />
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between p-3">
            <div>
              <p className="text-xs font-medium text-slate-500">McSundaes</p>
              {isLoading
                ? (
                <Skeleton className="mt-1 h-6 w-16" />
                  )
                : (
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  {stats?.mcSundaePercentage.toFixed(2)}%
                </p>
                  )}
            </div>
            <Coffee className="h-5 w-5 text-slate-500" />
          </div>
        </Card>
      </div>
    </>
  )
}
