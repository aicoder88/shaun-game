'use client'

import { useState } from 'react'
import Image from 'next/image'

type GameStage =
  | 'intro'
  | 'meet-suspects'
  | 'examine-scene'
  | 'question-professor'
  | 'question-chef'
  | 'question-captain'
  | 'collect-evidence'
  | 'make-accusation'
  | 'reveal'
  | 'complete'

interface Choice {
  text: string
  isCorrect: boolean
  feedback: string
  explanation: string
  feynmanHint?: string
  curiosityQuestion?: string
  nextStage?: GameStage
}

interface StageData {
  stage: GameStage
  background: string
  character?: string
  characterName?: string
  emoji: string
  title: string
  description: string
  choices?: Choice[]
  autoProgress?: GameStage
  evidence?: string
}

export function GameStory() {
  const [currentStage, setCurrentStage] = useState<GameStage>('intro')
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [collectedEvidence, setCollectedEvidence] = useState<string[]>([])
  const [score, setScore] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [showParticles, setShowParticles] = useState(false)
  const [showFeynmanHint, setShowFeynmanHint] = useState(false)

  const playSound = (type: 'correct' | 'wrong' | 'collect' | 'progress') => {
    if (typeof window === 'undefined') return
    const frequencies = { correct: 800, wrong: 200, collect: 600, progress: 1000 }
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = frequencies[type]
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.2)
  }

  const vibrate = (pattern: number | number[]) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern)
    }
  }

  const stages: Record<GameStage, StageData> = {
    intro: {
      stage: 'intro',
      background: 'from-purple-900 to-indigo-900',
      emoji: '🚂',
      title: 'Welcome Aboard!',
      description: 'You are the Great Detective boarding the luxurious Bullet Express. A murder has occurred!',
      autoProgress: 'meet-suspects'
    },
    'meet-suspects': {
      stage: 'meet-suspects',
      background: 'from-red-900 to-purple-900',
      emoji: '😱',
      title: 'The Crime Scene',
      description: 'A passenger lies dead in the luxury carriage. Three suspects remain. Who is the killer?',
      autoProgress: 'examine-scene'
    },
    'examine-scene': {
      stage: 'examine-scene',
      background: 'from-indigo-900 to-blue-900',
      emoji: '🔍',
      title: 'Examine the Scene',
      description: 'Look carefully at the crime scene. What do you notice?',
      choices: [
        {
          text: 'A bloody knife on the floor',
          isCorrect: true,
          feedback: '🎉 Brilliant observation!',
          explanation: 'You\'re thinking like a real detective! The knife is sitting RIGHT THERE on the floor. Sometimes the most important clues are hiding in plain sight!',
          feynmanHint: 'Here\'s what makes this interesting: a killer usually tries to HIDE the weapon. But this knife is just... lying there. Why? What does that tell us about what happened?',
          curiosityQuestion: '💡 Think about it: If you were the killer, would you leave the weapon out in the open?',
          nextStage: 'question-professor'
        },
        {
          text: 'Nothing important here',
          isCorrect: false,
          feedback: '🤔 Hmm, let\'s think about this...',
          explanation: 'Wait a second! When you say "nothing important," that\'s actually a really interesting mistake to make. Let me tell you why...',
          feynmanHint: 'A detective\'s job is like being a scientist - you have to LOOK at everything, even the boring stuff! The crime scene is full of clues, we just need to train our eyes to see them. What if I told you there\'s a weapon right on the floor?',
          curiosityQuestion: '💡 Try this: Imagine YOU were the killer. What would you leave behind by accident?'
        },
        {
          text: 'The victim was sleeping',
          isCorrect: false,
          feedback: '😮 Interesting theory, but...',
          explanation: 'I love that you\'re thinking creatively! But here\'s the thing - we KNOW this is a murder scene because we were TOLD someone was killed.',
          feynmanHint: 'This is a great example of why scientists and detectives always start with what they KNOW for sure. We know: 1) Someone screamed, 2) A person is dead, 3) This happened on the train. So they can\'t just be sleeping, right?',
          curiosityQuestion: '💡 What\'s the difference between "sleeping" and "dead"? Think about what makes those two states different!'
        }
      ],
      evidence: 'bloody_knife'
    },
    'question-professor': {
      stage: 'question-professor',
      background: 'from-amber-900 to-brown-800',
      character: '/images/characters/lestrange.svg',
      characterName: 'Professor LeStrange',
      emoji: '👨‍🏫',
      title: 'Question Professor LeStrange',
      description: 'The professor looks nervous. Ask him the right question using correct English grammar.',
      choices: [
        {
          text: 'Where was you at midnight?',
          isCorrect: false,
          feedback: '🤓 Ooh, interesting mistake!',
          explanation: 'You\'re SO close! Let me show you something cool about English...',
          feynmanHint: 'Think of "was" and "were" like different tools in a toolbox. "Was" works with I/he/she/it. "Were" works with you/we/they. It\'s like how you can\'t use a hammer to tighten a screw - wrong tool for the job! With "you," we ALWAYS use "were." Always!',
          curiosityQuestion: '💡 Try saying it out loud: "Where WERE you?" vs "Where WAS you?" Which one sounds natural to your ear?'
        },
        {
          text: 'Where were you at midnight?',
          isCorrect: true,
          feedback: '🌟 Absolutely perfect!',
          explanation: 'Yes! You nailed it! "Where were you?" is the exact right way to ask this question.',
          feynmanHint: 'Here\'s what\'s beautiful about what you just did: You used the past tense of "be" (which is "were") with the subject "you," AND you put the question word first. That\'s how English questions work - it\'s like a recipe, and you followed it perfectly!',
          curiosityQuestion: '💡 Notice how the word order changes in questions? In statements we say "You were there" but in questions we flip it: "Where were you?" Cool, right?',
          nextStage: 'question-chef'
        },
        {
          text: 'Where you was at midnight?',
          isCorrect: false,
          feedback: '😊 I can see what you\'re trying!',
          explanation: 'You\'re experimenting with word order - that\'s actually really smart thinking! But English has specific rules about how questions are built.',
          feynmanHint: 'Questions in English have a special formula: QUESTION WORD + VERB + SUBJECT. It\'s like "Where + were + you?" not "Where + you + was." Also, remember "you" always pairs with "were," not "was." Two mistakes here, but that means two things to learn!',
          curiosityQuestion: '💡 Why do you think English flips the order for questions? What if we didn\'t? "You were where?" - does that sound like a question to you?'
        }
      ]
    },
    'question-chef': {
      stage: 'question-chef',
      background: 'from-gray-800 to-slate-900',
      character: '/images/characters/gaspard.svg',
      characterName: 'Chef Gaspard',
      emoji: '👨‍🍳',
      title: 'Question Chef Gaspard',
      description: 'The chef is sweating nervously. His hands are shaking...',
      choices: [
        {
          text: 'What you do in the kitchen?',
          isCorrect: false,
          feedback: '🤔 Almost there!',
          explanation: 'You\'re asking the right question, but English needs a little helper word to make it work!',
          feynmanHint: 'Think of questions like a sandwich - you need all the right ingredients! In English questions, we need a HELPING VERB. It\'s like asking "What [helper] you do?" The helpers are: do, did, were, are, will. For past actions, we use "did" or "were." Try: "What WERE you doing?" or "What DID you do?"',
          curiosityQuestion: '💡 Why do you think English needs these helper words? Other languages don\'t! It\'s like English wants to be extra clear about when things happened.'
        },
        {
          text: 'What were you doing in the kitchen?',
          isCorrect: true,
          feedback: '🌟 Magnificent!',
          explanation: 'You just used the PAST CONTINUOUS tense perfectly! This is the best way to ask about ongoing actions in the past.',
          feynmanHint: 'What you just did is really sophisticated! "Were you doing" tells us you want to know about an ACTION IN PROGRESS at a specific time in the past. It\'s like taking a photograph of someone mid-action. Compare: "What did you do?" (finished action) vs "What were you doing?" (ongoing action). You chose the perfect one!',
          curiosityQuestion: '💡 Imagine you\'re watching a movie and you pause it. "What were you doing?" is like asking about that frozen moment. Cool, right?',
          nextStage: 'question-captain'
        },
        {
          text: 'What doing you in kitchen?',
          isCorrect: false,
          feedback: '😅 Creative try!',
          explanation: 'I can see you\'re mixing up the word order - that\'s actually a super common mistake and it shows you\'re thinking hard about English!',
          feynmanHint: 'English word order is like a recipe - if you mix the ingredients in the wrong order, the cake won\'t rise! Questions have a special formula: QUESTION WORD + HELPING VERB + SUBJECT + MAIN VERB. So it\'s "What + were + you + doing?" Not "What + doing + you." Also, we need "in THE kitchen" (articles matter!). English is picky about these details!',
          curiosityQuestion: '💡 Try saying both versions out loud: "What were you doing?" vs "What doing you?" Which one sounds like a real question to your ear? Your brain can hear the difference!'
        }
      ]
    },
    'question-captain': {
      stage: 'question-captain',
      background: 'from-blue-900 to-slate-800',
      character: '/images/characters/zane.svg',
      characterName: 'Captain Zane',
      emoji: '👩‍✈️',
      title: 'Question Captain Zane',
      description: 'The captain\'s mechanical arm clicks nervously. Her eyes dart away from yours...',
      choices: [
        {
          text: 'Did you killed the victim?',
          isCorrect: false,
          feedback: '🧐 Interesting mistake!',
          explanation: 'You\'re mixing two different ways of showing past time! Let me show you what\'s happening here...',
          feynmanHint: 'This is a REALLY common mistake, and here\'s why: In English, when you use "did," you\'ve ALREADY shown it\'s past tense! So the verb after it stays in its base form (like "kill" not "killed"). Think of it like this: "did" = past time marker. "kill" = action. We don\'t need TWO past markers! It\'s "Did you KILL?" not "Did you KILLED?" One past marker is enough!',
          curiosityQuestion: '💡 Try this: "I did walk" sounds weird, right? We say "I walked" OR "Did I walk?" English doesn\'t like double past tenses in the same verb phrase!'
        },
        {
          text: 'You kill the victim?',
          isCorrect: false,
          feedback: '😊 Getting close!',
          explanation: 'You have the right words, but English questions need that magic helper word at the start!',
          feynmanHint: 'Think of "did" as a flag that tells everyone "Hey! This is a question about the past!" Without it, your sentence is just... floating there. It could be a statement, a question, nobody knows! "Did" is like turning on a spotlight that says "QUESTION TIME!" Compare: "You kill the victim." (sounds weird) vs "Did you kill the victim?" (perfect question!). That little word changes EVERYTHING.',
          curiosityQuestion: '💡 Some languages can make questions just by changing your voice tone. English needs special helper words. Why do you think that is?'
        },
        {
          text: 'Did you kill the victim?',
          isCorrect: true,
          feedback: '💎 PERFECT!',
          explanation: 'This is textbook perfect grammar! You used past simple question formation exactly right!',
          feynmanHint: 'What you just did demonstrates a fundamental rule of English: "Did + subject + base verb." This structure is like a mathematical formula - it works EVERY time for past questions. "Did she go?" "Did they see?" "Did he know?" Same pattern, always reliable! You\'ve mastered one of the most important structures in English!',
          curiosityQuestion: '💡 The captain looks guilty now. Notice how using correct English helped you ask a powerful question? Language is a tool - and you\'re using it like a pro!',
          nextStage: 'collect-evidence'
        }
      ]
    },
    'collect-evidence': {
      stage: 'collect-evidence',
      background: 'from-purple-800 to-violet-900',
      emoji: '📋',
      title: 'Review Your Evidence',
      description: `You've collected clues. Now you must decide: Who is the killer?`,
      autoProgress: 'make-accusation'
    },
    'make-accusation': {
      stage: 'make-accusation',
      background: 'from-red-800 to-orange-900',
      emoji: '⚖️',
      title: 'Make Your Accusation!',
      description: 'Think carefully. Review what you learned. Who is guilty?',
      choices: [
        {
          text: 'Professor LeStrange',
          isCorrect: false,
          feedback: '🤔 Let\'s think about this...',
          explanation: 'The professor has a solid alibi - he was in the library reading until 11 PM.',
          feynmanHint: 'Detective work is like science - you need EVIDENCE! The professor had fake artifacts, yes, but that doesn\'t make him a killer. What evidence actually connects someone to the crime? Think about the mechanical gear you found... whose mechanical parts could have dropped it?',
          curiosityQuestion: '💡 Remember: having a secret doesn\'t make you guilty of murder. What PHYSICAL evidence points to the real killer?',
          nextStage: 'make-accusation'
        },
        {
          text: 'Chef Gaspard',
          isCorrect: false,
          feedback: '😮 Not quite!',
          explanation: 'The chef was nervous, but he was actually in the kitchen preparing dessert. Multiple witnesses confirm this!',
          feynmanHint: 'Being nervous doesn\'t equal guilty! Think like a scientist: what TESTABLE evidence do we have? The bloody knife came from the kitchen, true, but ANYONE could have taken it. The real clue is the mechanical gear - what kind of person has mechanical parts? Think about each suspect\'s unique features!',
          curiosityQuestion: '💡 In real investigations, detectives have to separate emotions (he seems nervous) from facts (where was he, what evidence connects him). What FACTS point to the killer?',
          nextStage: 'make-accusation'
        },
        {
          text: 'Captain Zane',
          isCorrect: true,
          feedback: '🎉 BRILLIANT DEDUCTION!',
          explanation: 'YES! Captain Zane killed the victim to hide the truth about the Aurora crash!',
          feynmanHint: 'Let\'s reconstruct what happened using the evidence: 1) A mechanical gear was found at the scene, 2) Captain Zane has a mechanical ARM, 3) The victim was blackmailing her about the Aurora incident. The gear must have fallen from her arm during the struggle! When you connect all the dots - physical evidence + motive + opportunity - there\'s only ONE logical answer. This is how real detectives solve crimes!',
          curiosityQuestion: '💡 You just solved a mystery using: observation, language skills, and logical deduction. That\'s EXACTLY what scientists do! You\'re thinking like both a detective AND a scientist now!',
          nextStage: 'reveal'
        }
      ]
    },
    reveal: {
      stage: 'reveal',
      background: 'from-green-700 to-emerald-800',
      character: '/images/characters/zane.svg',
      characterName: 'Captain Zane (GUILTY)',
      emoji: '🎉',
      title: 'Case Solved!',
      description: 'Captain Zane confesses! The victim was blackmailing her about the Aurora crash. Your perfect English grammar helped you solve the case!',
      autoProgress: 'complete'
    },
    complete: {
      stage: 'complete',
      background: 'from-yellow-600 to-amber-700',
      emoji: '🏆',
      title: 'Mystery Solved!',
      description: `Well done, Detective! You used perfect grammar and clever thinking to catch the killer!`
    }
  }

  const handleChoice = (choiceIndex: number) => {
    const stage = stages[currentStage]
    if (!stage.choices) return

    const choice = stage.choices[choiceIndex]
    setSelectedChoice(choiceIndex)
    setShowFeedback(true)

    if (choice.isCorrect) {
      playSound('correct')
      vibrate([100, 50, 100])
      setScore(score + 10)
      setShowParticles(true)

      if (stage.evidence && !collectedEvidence.includes(stage.evidence)) {
        setCollectedEvidence([...collectedEvidence, stage.evidence])
      }

      // Show Feynman hint after 2 seconds
      setTimeout(() => setShowFeynmanHint(true), 2000)

      setTimeout(() => {
        if (choice.nextStage) {
          setCurrentStage(choice.nextStage)
          setSelectedChoice(null)
          setShowFeedback(false)
          setShowFeynmanHint(false)
          setShowParticles(false)
          playSound('progress')
        }
      }, choice.feynmanHint ? 6000 : 3000)
    } else {
      playSound('wrong')
      vibrate([200, 100, 200, 100, 200])
      setMistakes(mistakes + 1)

      // Show Feynman hint after 2 seconds
      setTimeout(() => setShowFeynmanHint(true), 2000)

      setTimeout(() => {
        setSelectedChoice(null)
        setShowFeedback(false)
        setShowFeynmanHint(false)
      }, choice.feynmanHint ? 7000 : 4000)
    }
  }

  const handleContinue = () => {
    const stage = stages[currentStage]
    if (stage.autoProgress) {
      playSound('progress')
      vibrate(50)
      setCurrentStage(stage.autoProgress)
    }
  }

  const currentData = stages[currentStage]

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentData.background} p-6 flex flex-col`}>
      {/* Header Stats */}
      <div className="flex justify-between items-center mb-6">
        <div className="bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm text-white">
          ⭐ Score: {score}
        </div>
        <div className="bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm text-white">
          🎯 Evidence: {collectedEvidence.length}
        </div>
        <div className="bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm text-white">
          ❌ Errors: {mistakes}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        {/* Character or Emoji */}
        {currentData.character ? (
          <div className="mb-6">
            <Image
              src={currentData.character}
              alt={currentData.characterName || ''}
              width={200}
              height={300}
              className="drop-shadow-2xl animate-float"
            />
            <div className="mt-4 bg-black/50 px-6 py-3 rounded-full inline-block">
              <p className="text-yellow-400 font-bold text-xl">
                {currentData.characterName}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-9xl mb-6 animate-bounce-gentle">
            {currentData.emoji}
          </div>
        )}

        {/* Title */}
        <h1 className="text-5xl font-black text-white mb-4 drop-shadow-lg">
          {currentData.title}
        </h1>

        {/* Description */}
        <p className="text-2xl text-white/90 mb-8 max-w-2xl">
          {currentData.description}
        </p>

        {/* Choices */}
        {currentData.choices && !showFeedback && (
          <div className="w-full max-w-2xl space-y-4">
            {currentData.choices.map((choice, index) => (
              <button
                key={index}
                onClick={() => handleChoice(index)}
                className={`
                  w-full p-6 rounded-2xl font-bold text-xl text-white
                  transform transition-all duration-200
                  ${selectedChoice === index ? 'scale-95' : 'scale-100 active:scale-95'}
                  ${index === 0 ? 'bg-blue-600 hover:bg-blue-500' : ''}
                  ${index === 1 ? 'bg-purple-600 hover:bg-purple-500' : ''}
                  ${index === 2 ? 'bg-pink-600 hover:bg-pink-500' : ''}
                  shadow-xl border-4 border-white/30
                `}
              >
                {choice.text}
              </button>
            ))}
          </div>
        )}

        {/* Celebration Particles */}
        {showParticles && (
          <div className="fixed inset-0 pointer-events-none z-50">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute w-3 h-3 rounded-full animate-particle-explode"
                style={{
                  left: '50%',
                  top: '50%',
                  backgroundColor: ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4', '#45B7D1'][i % 5],
                  animationDelay: `${Math.random() * 0.3}s`,
                  '--tx': `${Math.cos(i * 0.126) * 300}px`,
                  '--ty': `${Math.sin(i * 0.126) * 300}px`
                } as any}
              />
            ))}
          </div>
        )}

        {/* Feedback */}
        {showFeedback && selectedChoice !== null && currentData.choices && (
          <div className={`
            max-w-2xl p-8 rounded-3xl border-4
            ${currentData.choices[selectedChoice].isCorrect
              ? 'bg-green-600 border-green-300 animate-success-pulse'
              : 'bg-red-600 border-red-300 animate-shake-continuous'}
            shadow-2xl animate-scale-in
          `}>
            <div className="text-6xl mb-4 animate-bounce-gentle">
              {currentData.choices[selectedChoice].isCorrect ? '✅' : '❌'}
            </div>
            <h2 className="text-4xl font-black text-white mb-4">
              {currentData.choices[selectedChoice].feedback}
            </h2>
            <p className="text-2xl text-white/95 font-bold leading-relaxed mb-4">
              {currentData.choices[selectedChoice].explanation}
            </p>

            {/* Feynman Hint - appears after delay */}
            {showFeynmanHint && currentData.choices[selectedChoice].feynmanHint && (
              <div className="mt-6 p-6 bg-black/30 rounded-2xl border-2 border-white/30 animate-slide-up">
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-3xl flex-shrink-0">🧠</div>
                  <div className="text-xl text-yellow-200 font-bold">Dr. Feynman says:</div>
                </div>
                <p className="text-lg text-white/95 leading-relaxed italic">
                  {currentData.choices[selectedChoice].feynmanHint}
                </p>
              </div>
            )}

            {/* Curiosity Question */}
            {showFeynmanHint && currentData.choices[selectedChoice].curiosityQuestion && (
              <div className="mt-4 p-5 bg-purple-700/50 rounded-xl border-2 border-purple-400 animate-glow">
                <p className="text-lg text-white font-semibold">
                  {currentData.choices[selectedChoice].curiosityQuestion}
                </p>
              </div>
            )}

            {!currentData.choices[selectedChoice].isCorrect && (
              <div className="mt-6 text-2xl text-white/90 font-bold animate-pulse">
                💡 Try again - you got this!
              </div>
            )}

            {currentData.choices[selectedChoice].isCorrect && (
              <div className="mt-4 text-xl text-white/80">
                ⏱️ Moving to next stage...
              </div>
            )}
          </div>
        )}

        {/* Continue Button */}
        {currentData.autoProgress && !currentData.choices && (
          <button
            onClick={handleContinue}
            className="px-12 py-6 bg-white text-gray-900 rounded-full font-black text-2xl shadow-2xl transform transition-all active:scale-95 border-4 border-white/50"
          >
            Continue →
          </button>
        )}

        {/* Final Score */}
        {currentStage === 'complete' && (
          <div className="mt-8 bg-black/50 p-8 rounded-3xl max-w-xl">
            <h3 className="text-3xl font-bold text-yellow-400 mb-4">Final Score</h3>
            <div className="space-y-2 text-white text-xl">
              <p>⭐ Points: {score}</p>
              <p>🎯 Evidence Collected: {collectedEvidence.length}</p>
              <p>✅ Grammar Accuracy: {Math.round((score / (score + mistakes * 10)) * 100)}%</p>
              <p>❌ Mistakes: {mistakes}</p>
            </div>
            <button
              onClick={() => window.location.href = '/mobile'}
              className="mt-6 px-8 py-4 bg-yellow-500 text-black rounded-full font-black text-xl"
            >
              Play Again
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-15px) scale(1.1); }
        }
        .animate-bounce-gentle {
          animation: bounce-gentle 1.5s ease-in-out infinite;
        }
        @keyframes scale-in {
          0% { transform: scale(0.5) rotate(-5deg); opacity: 0; }
          50% { transform: scale(1.1) rotate(2deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        .animate-scale-in {
          animation: scale-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        @keyframes success-pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
          50% { transform: scale(1.02); box-shadow: 0 0 30px 10px rgba(34, 197, 94, 0); }
        }
        .animate-success-pulse {
          animation: success-pulse 1.5s ease-in-out infinite;
        }
        @keyframes shake-continuous {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake-continuous {
          animation: shake-continuous 0.5s ease-in-out;
        }
        @keyframes slide-up {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.5s ease-out;
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 10px rgba(168, 85, 247, 0.5); }
          50% { box-shadow: 0 0 25px rgba(168, 85, 247, 0.8), 0 0 40px rgba(168, 85, 247, 0.4); }
        }
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
        @keyframes particle-explode {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(var(--tx), var(--ty)) scale(0);
            opacity: 0;
          }
        }
        .animate-particle-explode {
          animation: particle-explode 1.5s cubic-bezier(0.4, 0.0, 0.6, 1) forwards;
        }
      `}</style>
    </div>
  )
}
