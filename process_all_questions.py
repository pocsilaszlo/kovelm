#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json
import re

def parse_question(q_data):
    """Parse a question and extract question text, options, and find correct answer indices"""
    question_text = q_data['question']
    answer_text = q_data['answer']
    
    # Split into lines
    lines = [line.strip() for line in question_text.split('\n') if line.strip()]
    
    # Find the question part (usually ends with ?)
    question_lines = []
    options = []
    
    i = 0
    # Collect question lines until we find options
    while i < len(lines):
        line = lines[i]
        # Check if this looks like an option
        if re.match(r'^[a-z]\)\s+|^\d+\.\s+|^[-•]\s+|^[A-Z]\.\s+', line, re.IGNORECASE):
            break
        # If line ends with ? and is long enough, it's likely the end of question
        if '?' in line and len(line) > 15:
            question_lines.append(line)
            i += 1
            # Skip empty lines
            while i < len(lines) and not lines[i].strip():
                i += 1
            break
        question_lines.append(line)
        i += 1
    
    # Remaining lines are options
    options_raw = lines[i:]
    
    # Clean and extract options
    cleaned_options = []
    for opt in options_raw:
        if not opt.strip():
            continue
        # Remove leading markers
        cleaned = re.sub(r'^[a-z]\)\s+', '', opt, flags=re.IGNORECASE)
        cleaned = re.sub(r'^\d+\.\s+', '', cleaned)
        cleaned = re.sub(r'^[A-Z]\.\s+', '', cleaned)
        cleaned = re.sub(r'^[-•]\s+', '', cleaned)
        cleaned = cleaned.strip()
        if cleaned and len(cleaned) > 2:
            cleaned_options.append(cleaned)
    
    # Join question lines
    question = ' '.join(question_lines).strip()
    
    # Parse answer to find correct indices
    answer_lines = [line.strip() for line in answer_text.split('\n') if line.strip()]
    correct_indices = []
    
    # Check for special cases
    answer_lower = answer_text.lower().strip()
    if 'mindegyik' in answer_lower or ('mind' in answer_lower and 'igaz' in answer_lower):
        # All options are correct
        correct_indices = list(range(len(cleaned_options)))
    else:
        # Match each answer line to options
        for answer_line in answer_lines:
            answer_line_clean = answer_line.strip()
            answer_lower = answer_line_clean.lower()
            
            # Try to find matching option
            best_match_idx = None
            best_match_score = 0
            
            for idx, option in enumerate(cleaned_options):
                option_lower = option.lower().strip()
                
                # Exact match
                if option_lower == answer_lower:
                    best_match_idx = idx
                    best_match_score = 100
                    break
                
                # Check if answer is contained in option or vice versa
                if answer_lower in option_lower:
                    score = len(answer_lower) / len(option_lower) * 100
                    if score > best_match_score:
                        best_match_score = score
                        best_match_idx = idx
                elif option_lower in answer_lower:
                    score = len(option_lower) / len(answer_lower) * 100
                    if score > best_match_score:
                        best_match_score = score
                        best_match_idx = idx
                else:
                    # Check word overlap
                    answer_words = set(answer_lower.split())
                    option_words = set(option_lower.split())
                    if len(answer_words) > 0:
                        overlap = len(answer_words.intersection(option_words))
                        score = (overlap / len(answer_words)) * 100
                        if score > 70 and score > best_match_score:
                            best_match_score = score
                            best_match_idx = idx
            
            if best_match_idx is not None and best_match_idx not in correct_indices:
                correct_indices.append(best_match_idx)
    
    # If still no matches, default to first option (will need manual review)
    if not correct_indices:
        correct_indices = [0]
    
    return {
        'question': question,
        'options': cleaned_options,
        'correctAnswers': sorted(correct_indices),
        'multipleChoice': len(correct_indices) > 1
    }

# Read the questions from the user's message
# The user provided a JSON array, so I'll create it here
questions_json = """[
  {
    "question": "A következő tulajdonságok közül melyek elengedhetetlenek a követelményelemzők számára?\\n\\nEmpátia\\nAnalitikus gondolkodás\\nNyilvános beszéd\\nKonfliktuskezelés",
    "answer": "Empátia\\nAnalitikus gondolkodás\\nKonfliktuskezelés"
  }
]"""

def main():
    # Since the user provided the data in their message, I need to read it from a file
    # or process it directly. Let me create a script that reads from stdin or a file
    
    # For now, I'll create a function that processes the questions array
    # The user will need to save their JSON to a file first
    
    print("To process all questions, please save the JSON array to 'all_questions.json'")
    print("Then run this script again.")
    
    # Try to read from file
    try:
        with open('all_questions.json', 'r', encoding='utf-8') as f:
            questions_data = json.load(f)
        
        print(f"Found {len(questions_data)} questions in file")
        
        quiz_questions = []
        for i, q_data in enumerate(questions_data, 1):
            try:
                parsed = parse_question(q_data)
                if len(parsed['options']) >= 2:
                    quiz_questions.append({
                        'id': i,
                        'question': parsed['question'],
                        'options': parsed['options'],
                        'correctAnswers': parsed['correctAnswers'],
                        'multipleChoice': parsed['multipleChoice']
                    })
                else:
                    print(f"Warning: Question {i} has less than 2 options, skipping")
            except Exception as e:
                print(f"Error processing question {i}: {e}")
                continue
        
        # Save to JSON
        output_file = 'src/data/questions.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(quiz_questions, f, ensure_ascii=False, indent=2)
        
        print(f"\nSaved {len(quiz_questions)} questions to {output_file}")
        print(f"Multiple choice questions: {sum(1 for q in quiz_questions if q['multipleChoice'])}")
        print(f"Single answer questions: {sum(1 for q in quiz_questions if not q['multipleChoice'])}")
        
    except FileNotFoundError:
        print("File 'all_questions.json' not found.")
        print("Please create it with the questions JSON array from the user's message.")

if __name__ == '__main__':
    main()



