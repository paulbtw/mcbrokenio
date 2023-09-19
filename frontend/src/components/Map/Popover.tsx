import { type McDataProperties } from '@/hooks/queries/useMcData'
import { ItemStatus } from '@/types'
import clsx from 'clsx'
import { formatDistance } from 'date-fns'

const colorMap = {
  [ItemStatus.AVAILABLE]: 'bg-green-500',
  [ItemStatus.UNAVAILABLE]: 'bg-red-500',
  [ItemStatus.NOT_APPLICABLE]: 'bg-gray-500',
  [ItemStatus.PARTIAL_AVAILABLE]: 'bg-yellow-500',
  [ItemStatus.UNKNOWN]: 'bg-gray-500'
}

function Item({
  count,
  errorCount,
  name,
  status
}: {
  name: string
  status: ItemStatus
  count: number
  errorCount: number
}) {
  const available = count - errorCount

  return (
    <div>
      <div className="flex justify-between mb-0.5 flex-nowrap">
        <span className="text-base font-medium truncate">{name}</span>
        <span className="text-base font-medium ml-2 whitespace-nowrap">
          {available} / {count}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={clsx('h-2.5 rounded-full', colorMap[status])}
          style={{ width: `${(available / count) * 100}%` }}
        ></div>
      </div>
    </div>
  )
}

export function Popover({
  name,
  hasMcFlurry,
  hasMcSundae,
  hasMilchshake,
  lastChecked,
  mcFlurryCount,
  mcFlurryErrorCount,
  mcSundaeCount,
  mcSundaeErrorCount,
  milkshakeCount,
  milkshakeErrorCount,
  customItems
}: McDataProperties) {
  return (
    <div className="bg-white rounded overflow-hidden">
      <h3 className="text-lg font-semibold mb-1">{name}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
        <Item
          name="McFlurry"
          count={mcFlurryCount}
          errorCount={mcFlurryErrorCount}
          status={hasMcFlurry}
        />
        <Item
          name="MilkShake"
          count={milkshakeCount}
          errorCount={milkshakeErrorCount}
          status={hasMilchshake}
        />
        <Item
          name="McSundae"
          count={mcSundaeCount}
          errorCount={mcSundaeErrorCount}
          status={hasMcSundae}
        />
        {Object.values(customItems).map(({ name, count, error, status }) => (
          <Item
            key={name}
            name={name}
            count={count}
            errorCount={error}
            status={status}
          />
        ))}
      </div>
      <div className="text-xs text-gray-500 mt-3">
        Last checked:{' '}
        {lastChecked != null
          ? formatDistance(new Date(lastChecked), new Date(), {
            addSuffix: true
          })
          : 'never'}
      </div>
    </div>
  )
}
