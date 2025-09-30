import type { DifficultyLevel, DifficultySettings, StudentAnalytics } from '@/types/game'

/**
 * DifficultyManager
 * Adaptive difficulty system that adjusts game challenge based on student performance
 * Uses ESL proficiency metrics to provide appropriate learning experience
 */
export class DifficultyManager {
  private settings: DifficultySettings
  private performanceHistory: {
    grammarAccuracy: number[]
    vocabularyRate: number[]
    clueDiscoveryRate: number[]
    timestamp: number
  }

  constructor(initialLevel: DifficultyLevel = 'intermediate') {
    this.settings = this.getLevelSettings(initialLevel)
    this.performanceHistory = {
      grammarAccuracy: [],
      vocabularyRate: [],
      clueDiscoveryRate: [],
      timestamp: Date.now()
    }
  }

  /**
   * Get default settings for a difficulty level
   */
  private getLevelSettings(level: DifficultyLevel): DifficultySettings {
    const settings: Record<DifficultyLevel, DifficultySettings> = {
      beginner: {
        level: 'beginner',
        autoAdjust: true,
        vocabularyMaxDifficulty: 1, // Only basic words
        grammarComplexity: 1, // Simple tenses only
        hintsEnabled: true,
        hintDelay: 5000, // Show hints after 5 seconds
        clueHighlighting: true // Highlight interactive objects
      },
      intermediate: {
        level: 'intermediate',
        autoAdjust: true,
        vocabularyMaxDifficulty: 2, // Basic + intermediate words
        grammarComplexity: 2, // Include past perfect, modals
        hintsEnabled: true,
        hintDelay: 15000, // Show hints after 15 seconds
        clueHighlighting: false
      },
      advanced: {
        level: 'advanced',
        autoAdjust: true,
        vocabularyMaxDifficulty: 3, // All vocabulary
        grammarComplexity: 3, // Complex conditionals, reported speech
        hintsEnabled: false,
        hintDelay: 30000, // Minimal hints
        clueHighlighting: false
      }
    }

    return settings[level]
  }

  /**
   * Analyze student performance and recommend difficulty adjustment
   */
  analyzePerformance(analytics: StudentAnalytics): {
    shouldAdjust: boolean
    recommendedLevel: DifficultyLevel
    reason: string
  } {
    if (!this.settings.autoAdjust) {
      return {
        shouldAdjust: false,
        recommendedLevel: this.settings.level,
        reason: 'Auto-adjust disabled'
      }
    }

    // Need minimum data to make adjustment
    if (analytics.totalGrammarAttempts < 5 && analytics.discoveredWords.length < 5) {
      return {
        shouldAdjust: false,
        recommendedLevel: this.settings.level,
        reason: 'Insufficient data'
      }
    }

    // Calculate performance scores
    const grammarScore = analytics.grammarAccuracy
    const vocabularyScore = analytics.vocabularyProgress
    const engagementScore = this.calculateEngagementScore(analytics)

    // Track history
    this.performanceHistory.grammarAccuracy.push(grammarScore)
    this.performanceHistory.vocabularyRate.push(vocabularyScore)

    // Keep only last 10 data points
    if (this.performanceHistory.grammarAccuracy.length > 10) {
      this.performanceHistory.grammarAccuracy.shift()
      this.performanceHistory.vocabularyRate.shift()
    }

    // Calculate average performance
    const avgGrammar = this.average(this.performanceHistory.grammarAccuracy)
    const avgVocabulary = this.average(this.performanceHistory.vocabularyRate)
    const overallScore = (avgGrammar + avgVocabulary + engagementScore) / 3

    // Determine if adjustment needed
    const currentLevel = this.settings.level
    let recommendedLevel: DifficultyLevel = currentLevel
    let reason = ''

    // Student struggling - decrease difficulty
    if (overallScore < 50 && currentLevel !== 'beginner') {
      if (currentLevel === 'advanced') {
        recommendedLevel = 'intermediate'
        reason = 'Performance below 50% - reducing to intermediate'
      } else {
        recommendedLevel = 'beginner'
        reason = 'Performance below 50% - reducing to beginner'
      }
    }
    // Student excelling - increase difficulty
    else if (overallScore > 85 && currentLevel !== 'advanced') {
      if (currentLevel === 'beginner') {
        recommendedLevel = 'intermediate'
        reason = 'Excellent performance (>85%) - advancing to intermediate'
      } else {
        recommendedLevel = 'advanced'
        reason = 'Excellent performance (>85%) - advancing to advanced'
      }
    }
    // Student doing well at intermediate - check consistency
    else if (
      currentLevel === 'intermediate' &&
      overallScore > 75 &&
      this.performanceHistory.grammarAccuracy.length >= 5 &&
      this.isConsistent(this.performanceHistory.grammarAccuracy, 70)
    ) {
      recommendedLevel = 'advanced'
      reason = 'Consistently strong performance - ready for advanced'
    }

    return {
      shouldAdjust: recommendedLevel !== currentLevel,
      recommendedLevel,
      reason
    }
  }

  /**
   * Calculate engagement score from analytics
   */
  private calculateEngagementScore(analytics: StudentAnalytics): number {
    const factors = [
      analytics.suspectInteractions > 2 ? 100 : analytics.suspectInteractions * 33,
      analytics.journalEntries > 5 ? 100 : analytics.journalEntries * 20,
      analytics.minigamesCompleted.length > 2 ? 100 : analytics.minigamesCompleted.length * 33,
      analytics.caseProgress
    ]

    return this.average(factors)
  }

  /**
   * Check if performance is consistent (low variance)
   */
  private isConsistent(values: number[], threshold: number): boolean {
    return values.every(v => v >= threshold)
  }

  /**
   * Calculate average of array
   */
  private average(values: number[]): number {
    if (values.length === 0) return 0
    return values.reduce((a, b) => a + b, 0) / values.length
  }

  /**
   * Update difficulty settings
   */
  setDifficulty(level: DifficultyLevel) {
    this.settings = this.getLevelSettings(level)
  }

  /**
   * Toggle auto-adjust
   */
  setAutoAdjust(enabled: boolean) {
    this.settings.autoAdjust = enabled
  }

  /**
   * Get current settings
   */
  getSettings(): DifficultySettings {
    return { ...this.settings }
  }

  /**
   * Get current difficulty level
   */
  getLevel(): DifficultyLevel {
    return this.settings.level
  }

  /**
   * Check if vocabulary word should be shown based on difficulty
   */
  shouldShowVocabulary(wordDifficulty: number): boolean {
    return wordDifficulty <= this.settings.vocabularyMaxDifficulty
  }

  /**
   * Check if hint should be shown based on timing
   */
  shouldShowHint(timeStuck: number): boolean {
    return this.settings.hintsEnabled && timeStuck >= this.settings.hintDelay
  }

  /**
   * Get appropriate grammar examples based on complexity level
   */
  getGrammarExamples(allExamples: string[]): string[] {
    // Return progressively more examples based on difficulty
    const exampleCounts = {
      beginner: 1,
      intermediate: 2,
      advanced: 3
    }

    const count = exampleCounts[this.settings.level]
    return allExamples.slice(0, count)
  }

  /**
   * Adjust mini-game difficulty parameters
   */
  getMinigameSettings() {
    return {
      timeLimit: {
        beginner: 180, // 3 minutes
        intermediate: 120, // 2 minutes
        advanced: 90 // 1.5 minutes
      }[this.settings.level],

      showTimer: this.settings.level !== 'beginner',

      allowRetries: this.settings.level === 'beginner',

      hintsAvailable: {
        beginner: 3,
        intermediate: 1,
        advanced: 0
      }[this.settings.level]
    }
  }

  /**
   * Get contextual feedback based on difficulty
   */
  getFeedbackDetail(isCorrect: boolean): {
    showExplanation: boolean
    showExamples: boolean
    encouragementLevel: 'high' | 'medium' | 'low'
  } {
    if (this.settings.level === 'beginner') {
      return {
        showExplanation: true,
        showExamples: true,
        encouragementLevel: 'high'
      }
    } else if (this.settings.level === 'intermediate') {
      return {
        showExplanation: !isCorrect, // Only show when wrong
        showExamples: !isCorrect,
        encouragementLevel: 'medium'
      }
    } else {
      return {
        showExplanation: false, // Minimal feedback
        showExamples: false,
        encouragementLevel: 'low'
      }
    }
  }
}

// Singleton instance for global access
let difficultyManagerInstance: DifficultyManager | null = null

export function getDifficultyManager(): DifficultyManager {
  if (!difficultyManagerInstance) {
    difficultyManagerInstance = new DifficultyManager('intermediate')
  }
  return difficultyManagerInstance
}

export function resetDifficultyManager(level: DifficultyLevel = 'intermediate') {
  difficultyManagerInstance = new DifficultyManager(level)
  return difficultyManagerInstance
}
