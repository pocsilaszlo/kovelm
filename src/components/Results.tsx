import { AnswerResult } from '../App'
import './Results.css'

interface ResultsProps {
  answers: AnswerResult[]
  score: number
  totalQuestions: number
  onRestart: () => void
}

export default function Results({ answers, score, totalQuestions, onRestart }: ResultsProps) {
  const incorrectAnswers = answers.filter(a => !a.isCorrect)
  const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0

  return (
    <div className="results-container">
      <div className="results-header">
        <h1>Kvíz Eredmények</h1>
        <div className="final-score">
          <div className="score-circle">
            <div className="score-number">{score}</div>
            <div className="score-total">/ {totalQuestions}</div>
          </div>
          <div className="score-percentage">{percentage.toFixed(1)}%</div>
        </div>
      </div>

      {incorrectAnswers.length > 0 ? (
        <div className="incorrect-questions">
          <h2>Helytelen vagy részben helytelen válaszok</h2>
          {incorrectAnswers.map((answerResult, index) => (
            <div key={index} className="question-review">
              <h3 className="review-question">{answerResult.question.question}</h3>
              <div className="review-options">
                {answerResult.question.options.map((option, optionIndex) => {
                  const isCorrect = answerResult.question.correctAnswers.includes(optionIndex)
                  const isUserSelected = answerResult.userAnswers.includes(optionIndex)
                  
                  let className = 'review-option'
                  if (isCorrect && isUserSelected) {
                    className += ' correct'
                  } else if (isCorrect && !isUserSelected) {
                    className += ' correct-missed'
                  } else if (!isCorrect && isUserSelected) {
                    className += ' incorrect'
                  }

                  return (
                    <div key={optionIndex} className={className}>
                      {option}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="perfect-score">
          <h2>Gratulálok! 🎉</h2>
          <p>Minden kérdésre helyesen válaszoltál!</p>
        </div>
      )}

      <button className="btn btn-restart" onClick={onRestart}>
        Újraindítás
      </button>
    </div>
  )
}

