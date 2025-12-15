import { useState, useEffect } from 'react'
import Quiz from './components/Quiz'
import Results from './components/Results'
import questionsData from './data/questions.json'
import './App.css'

export interface Question {
  id: number
  question: string
  options: string[]
  correctAnswers: number[]
  multipleChoice: boolean
}

export interface AnswerResult {
  question: Question
  userAnswers: number[]
  isCorrect: boolean
  points: number
}

function App() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<AnswerResult[]>([])
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)

  useEffect(() => {
    const shuffled = [...questionsData] as Question[]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    setQuestions(shuffled)
  }, [])

  const handleAnswerSubmit = (selectedAnswers: number[], question: Question) => {
    const isCorrect = 
      selectedAnswers.length === question.correctAnswers.length &&
      selectedAnswers.every(answer => question.correctAnswers.includes(answer)) &&
      question.correctAnswers.every(answer => selectedAnswers.includes(answer))
    
    const points = isCorrect ? 1 : 0
    
    const answerResult: AnswerResult = {
      question,
      userAnswers: selectedAnswers,
      isCorrect,
      points
    }

    setUserAnswers(prev => [...prev, answerResult])
    setScore(prev => prev + points)
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      setShowResults(true)
    }
  }

  const handleRestart = () => {
    const shuffled = [...questionsData] as Question[]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    setQuestions(shuffled)
    setCurrentQuestionIndex(0)
    setUserAnswers([])
    setShowResults(false)
    setScore(0)
  }

  if (questions.length === 0) {
    return <div className="loading">Betöltés...</div>
  }

  if (showResults) {
    return (
      <Results
        answers={userAnswers}
        score={score}
        totalQuestions={questions.length}
        onRestart={handleRestart}
      />
    )
  }

  return (
    <div className="app">
      <div className="score-display">
        <div className="score-item">
          <span className="score-label">Pontszám</span>
          <span className="score-value">{score} / {questions.length}</span>
        </div>
        <div className="score-item">
          <span className="score-label">Kérdés</span>
          <span className="score-value">{currentQuestionIndex + 1} / {questions.length}</span>
        </div>
      </div>

      <Quiz
        question={questions[currentQuestionIndex]}
        onAnswerSubmit={handleAnswerSubmit}
        onNextQuestion={handleNextQuestion}
      />
    </div>
  )
}

export default App

