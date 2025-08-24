'use client'

import { Package } from 'lucide-react'

interface InventoryItem {
  id: string
  name: string
  description: string
  icon: string
  obtained: boolean
}

interface InventoryPanelProps {
  items: InventoryItem[]
}

export function InventoryPanel({ items }: InventoryPanelProps) {
  const obtainedItems = items.filter(item => item.obtained)

  return (
    <div className="h-full bg-gray-800 p-3">
      <div className="flex items-center mb-3">
        <Package className="w-4 h-4 mr-2 text-steampunk-brass" />
        <h3 className="text-white font-bold text-sm">Evidence Bag</h3>
        <span className="ml-auto text-gray-400 text-xs">
          {obtainedItems.length} items
        </span>
      </div>

      <div className="space-y-2 max-h-20 overflow-y-auto">
        {obtainedItems.length === 0 ? (
          <div className="text-gray-500 text-xs text-center py-2">
            No evidence collected yet
          </div>
        ) : (
          obtainedItems.map(item => (
            <div
              key={item.id}
              className="flex items-center p-2 bg-gray-700 rounded hover:bg-gray-600 transition-colors group"
              title={item.description}
            >
              <div className="w-6 h-6 bg-steampunk-bronze rounded flex items-center justify-center mr-2 text-xs">
                {item.icon || '📦'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-xs font-medium truncate">
                  {item.name}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick stats */}
      <div className="mt-2 pt-2 border-t border-gray-600">
        <div className="text-gray-400 text-xs">
          Progress: {obtainedItems.length}/6 clues found
        </div>
      </div>
    </div>
  )
}