'use client'

import { Award, CheckCircle, Circle } from 'lucide-react'
import type { Achievement, ProgressCheckpoint } from '@/types/game'

interface ProgressTrackerProps {
  checkpoints: ProgressCheckpoint[]
  achievements: Achievement[]
  currentProgress: number
}

/**
 * ProgressTracker Component
 * Shows student's progress through the case with checkpoints and achievements
 * Visual timeline of accomplishments
 */
export default function ProgressTracker({
  checkpoints,
  achievements,
  currentProgress
}: ProgressTrackerProps) {
  const earnedAchievements = achievements.filter(a => a.earnedAt)
  const totalAchievements = achievements.length

  return (
    <div className="bg-gray-900 rounded-lg border-2 border-gray-700 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-steampunk-brass flex items-center gap-2">
          <Award className="w-5 h-5" />
          Progress & Achievements
        </h3>
        <div className="text-sm text-gray-400">
          {earnedAchievements.length}/{totalAchievements} earned
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Case Progress</span>
          <span className="text-steampunk-brass font-bold">{currentProgress}%</span>
        </div>
        <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-steampunk-brass to-steampunk-copper transition-all duration-500"
            style={{ width: `${currentProgress}%` }}
          />
        </div>
      </div>

      {/* Checkpoints Timeline */}
      <div className="space-y-4 mb-6">
        <h4 className="text-sm font-bold text-gray-400 uppercase">Checkpoints</h4>
        {checkpoints.map((checkpoint, index) => {
          const isCompleted = checkpoint.completed
          const isNext = !isCompleted && currentProgress >= checkpoint.progress - 10
          const isFuture = currentProgress < checkpoint.progress - 10

          return (
            <div
              key={checkpoint.id}
              className={`flex items-start gap-3 ${
                isFuture ? 'opacity-50' : 'opacity-100'
              }`}
            >
              {/* Checkpoint Icon */}
              <div className="flex-shrink-0 pt-1">
                {isCompleted ? (
                  <CheckCircle className="w-6 h-6 text-green-500 fill-green-500" />
                ) : isNext ? (
                  <Circle className="w-6 h-6 text-yellow-500 fill-yellow-500/20 animate-pulse" />
                ) : (
                  <Circle className="w-6 h-6 text-gray-600" />
                )}
              </div>

              {/* Checkpoint Info */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h5 className={`font-semibold ${
                    isCompleted ? 'text-green-400' :
                    isNext ? 'text-yellow-400' :
                    'text-gray-500'
                  }`}>
                    {checkpoint.name}
                  </h5>
                  {isCompleted && checkpoint.completedAt && (
                    <span className="text-xs text-gray-500">
                      {new Date(checkpoint.completedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400">{checkpoint.description}</p>

                {/* Rewards */}
                {checkpoint.rewards && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {checkpoint.rewards.lensCharges && (
                      <span className="text-xs px-2 py-1 bg-blue-900/30 text-blue-400 rounded">
                        +{checkpoint.rewards.lensCharges} Lens Charges
                      </span>
                    )}
                    {checkpoint.rewards.achievements && checkpoint.rewards.achievements.length > 0 && (
                      <span className="text-xs px-2 py-1 bg-yellow-900/30 text-yellow-400 rounded">
                        +{checkpoint.rewards.achievements.length} Achievement
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Progress Indicator */}
              <div className="text-xs text-gray-600 font-mono">
                {checkpoint.progress}%
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Achievements */}
      {earnedAchievements.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-gray-400 uppercase mb-3">
            Recent Achievements
          </h4>
          <div className="grid grid-cols-4 gap-2">
            {earnedAchievements.slice(-8).map((achievement) => {
              const rarityColors = {
                common: 'border-gray-500',
                rare: 'border-blue-500',
                epic: 'border-purple-500',
                legendary: 'border-yellow-500'
              }

              return (
                <div
                  key={achievement.id}
                  className={`aspect-square bg-gray-800 rounded-lg border-2 ${rarityColors[achievement.rarity]} flex items-center justify-center text-3xl hover:scale-110 transition-transform cursor-help`}
                  title={`${achievement.title}\n${achievement.description}`}
                >
                  {achievement.icon}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Achievement Categories Summary */}
      <div className="mt-6 grid grid-cols-3 gap-2 text-center">
        {['grammar', 'vocabulary', 'investigation'].map((category) => {
          const categoryAchievements = achievements.filter(a => a.category === category)
          const earned = categoryAchievements.filter(a => a.earnedAt).length

          return (
            <div
              key={category}
              className="bg-gray-800 rounded p-2"
            >
              <div className="text-lg font-bold text-steampunk-brass">
                {earned}/{categoryAchievements.length}
              </div>
              <div className="text-xs text-gray-500 capitalize">
                {category}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
