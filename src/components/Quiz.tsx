import { useState, useEffect } from 'react'
import { Question } from '../App'
import './Quiz.css'

interface QuizProps {
  question: Question
  onAnswerSubmit: (selectedAnswers: number[], question: Question) => void
  onNextQuestion: () => void
}

export default function Quiz({ question, onAnswerSubmit, onNextQuestion }: QuizProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([])
  const [showResult, setShowResult] = useState(false)
  const [shuffledOptions, setShuffledOptions] = useState<{ text: string; index: number }[]>([])

  useEffect(() => {
    const optionsWithIndex = question.options.map((text, index) => ({ text, index }))
    const shuffled = [...optionsWithIndex]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    setShuffledOptions(shuffled)
    setSelectedAnswers([])
    setShowResult(false)
  }, [question.id])

  const handleOptionClick = (originalIndex: number) => {
    if (showResult) return

    if (question.multipleChoice) {
      if (selectedAnswers.includes(originalIndex)) {
        setSelectedAnswers(selectedAnswers.filter(a => a !== originalIndex))
      } else {
        setSelectedAnswers([...selectedAnswers, originalIndex])
      }
    } else {
      setSelectedAnswers([originalIndex])
    }
  }

  const handleSubmit = () => {
    if (selectedAnswers.length === 0) return
    setShowResult(true)
    onAnswerSubmit(selectedAnswers, question)
  }

  const handleNext = () => {
    onNextQuestion()
  }

  const getOptionClass = (originalIndex: number) => {
    if (!showResult) {
      return selectedAnswers.includes(originalIndex) ? 'option selected' : 'option'
    }

    const isCorrect = question.correctAnswers.includes(originalIndex)
    const isSelected = selectedAnswers.includes(originalIndex)

    if (isCorrect && isSelected) {
      return 'option correct'
    } else if (isCorrect && !isSelected) {
      return 'option correct-missed'
    } else if (!isCorrect && isSelected) {
      return 'option incorrect'
    } else {
      return 'option'
    }
  }

  return (
    <div className="quiz-container">
      <h2 className="question-text">{question.question}</h2>
      
      <div className="options-container">
        {shuffledOptions.map((option, displayIndex) => (
          <button
            key={displayIndex}
            className={getOptionClass(option.index)}
            onClick={() => handleOptionClick(option.index)}
            disabled={showResult}
          >
            {option.text}
          </button>
        ))}
      </div>

      <div className="quiz-actions">
        {!showResult ? (
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={selectedAnswers.length === 0}
          >
            Válaszok ellenőrzése
          </button>
        ) : (
          <button className="btn btn-secondary" onClick={handleNext}>
            Következő kérdés
          </button>
        )}
      </div>
    </div>
  )
}



