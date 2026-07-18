const { GoogleAIFileManager } = require('@google/generative-ai/server')
const pdfParse = require('pdf-parse')
const fs = require('fs')


const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY)
const { GoogleGenerativeAI } = require('@google/generative-ai')

if (!process.env.GEMINI_API_KEY) {
  console.warn('⚠️  GEMINI_API_KEY is not set in .env — AI features will fail.')
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const model = genAI.getGenerativeModel({
  model:"gemini-flash-latest"
});

// Strips markdown code fences (```json ... ```) that Gemini sometimes wraps
// around JSON responses, so JSON.parse doesn't blow up.
const cleanJsonResponse = (text) => {
  return text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
}

/**
 * Generates interview questions using Gemini.
 * Returns an array of { questionText, type }.
 */
const generateWithRetry = async (prompt, contentParts = null, retries = 2) => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = contentParts
        ? await model.generateContent([prompt, contentParts])
        : await model.generateContent(prompt)
      return result
    } catch (err) {
      const is503 = err.message?.includes('503') || err.message?.includes('overloaded')
      if (is503 && attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 2000 * (attempt + 1))) // wait longer each retry
        continue
      }
      throw err
    }
  }
}
const generateInterviewQuestions = async ({ topic, difficulty, numQuestions, type }) => {
  const prompt = `You are an expert technical interviewer. Generate exactly ${numQuestions} interview questions for a candidate.

Topic: ${topic}
Difficulty: ${difficulty}
Question category: ${type} (technical, coding, hr, or behavioral)

Rules:
- Questions should be realistic, the kind actually asked in real interviews at tech companies.
- Match the difficulty level precisely: "easy" = fundamentals, "medium" = standard depth, "hard" = senior-level depth requiring nuanced understanding.
- If category is "coding", questions should describe a coding problem to solve (not require code execution, just a clear problem statement).
- If category is "hr" or "behavioral", questions should be realistic HR/behavioral interview questions relevant to the topic/role context.
- Do NOT include answers.

Respond with ONLY a valid JSON array, no markdown, no explanation, in this exact format:
[
  { "questionText": "...", "type": "${type}" },
  { "questionText": "...", "type": "${type}" }
]`

  const result = await generateWithRetry(prompt)
  const responseText = result.response.text()
  const cleaned = cleanJsonResponse(responseText)

  try {
    const questions = JSON.parse(cleaned)
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Empty or invalid questions array')
    }
    return questions
  } catch (err) {
    console.error('Failed to parse Gemini questions response:', responseText)
    throw new Error('AI failed to generate valid questions. Please try again.')
  }
}

/**
 * Extracts text from an uploaded resume PDF, then sends it to Gemini for evaluation.
 * Returns { atsScore, overallScore, strengths, weaknesses, missingKeywords, sectionFeedback, suggestions, summary }
 */
const analyzeResume = async (filePath) => {
  // Step 1: extract raw text from the PDF
  const dataBuffer = fs.readFileSync(filePath)
  const pdfData = await pdfParse(dataBuffer)
  const resumeText = pdfData.text.trim()

  if (!resumeText || resumeText.length < 50) {
    throw new Error('Could not extract readable text from this PDF. Please upload a text-based resume, not a scanned image.')
  }

  // Step 2: send extracted text to Gemini for evaluation
  const prompt = `You are an expert technical recruiter and resume reviewer who has screened thousands of resumes for software engineering and tech roles.

Analyze the following resume text and provide detailed, actionable feedback.

RESUME TEXT:
"""
${resumeText}
"""

Evaluate:
- ATS (Applicant Tracking System) friendliness — formatting, structure, use of standard section headers, keyword density
- Overall quality — clarity, impact of bullet points, use of metrics/numbers, relevance
- Missing but commonly expected keywords/skills for this type of resume
- Section-by-section feedback (e.g. Summary, Experience, Skills, Projects, Education — only include sections that are actually present)
- Specific, actionable suggestions for improvement

Respond with ONLY valid JSON, no markdown, no explanation, in this exact format:
{
  "atsScore": 75,
  "overallScore": 68,
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "missingKeywords": ["...", "..."],
  "sectionFeedback": [
    { "section": "Experience", "feedback": "..." },
    { "section": "Skills", "feedback": "..." }
  ],
  "suggestions": ["...", "..."],
  "summary": "A 2-3 sentence overall verdict on this resume."
}`

  const result = await model.generateContent(prompt)
  const responseText = result.response.text()
  const cleaned = cleanJsonResponse(responseText)

  try {
    const evaluation = JSON.parse(cleaned)
    return { ...evaluation, extractedText: resumeText }
  } catch (err) {
    console.error('Failed to parse Gemini resume analysis:', responseText)
    throw new Error('AI failed to analyze the resume. Please try again.')
  }
}

/**
 * Uploads a video file to Gemini's File API and analyzes the candidate's
 * interview delivery — communication, confidence, pacing, filler words.
 * Returns { overallScore, transcript, communicationFeedback, confidenceFeedback,
 *           paceFeedback, strengths, improvements, fillerWordCount, summary }
 */
const analyzeVideoInterview = async (filePath, mimeType, question) => {
  // Step 1: upload the video to Gemini's file storage (required for files this size)
  const uploadResult = await fileManager.uploadFile(filePath, {
    mimeType,
    displayName: 'interview-answer-video',
  })

  // Step 2: poll until Gemini finishes processing the video (required before analysis)
  let file = uploadResult.file
  while (file.state === 'PROCESSING') {
    await new Promise((resolve) => setTimeout(resolve, 3000))
    file = await fileManager.getFile(file.name)
  }

  if (file.state === 'FAILED') {
    throw new Error('Video processing failed on the AI service. Please try a different file.')
  }

  // Step 3: ask Gemini to analyze the video against the interview question
  const prompt = `You are an expert interview coach analyzing a candidate's recorded video answer.

The question they were answering: "${question}"

Watch and listen to the video, then evaluate:
- What they actually said (a transcript summary)
- Communication clarity — how clearly and coherently they expressed their answer
- Confidence — tone of voice, composure, hesitation patterns
- Pace — whether they spoke too fast, too slow, or at a good pace, and use of pauses
- Approximate count of filler words used ("um", "uh", "like", "you know", etc.)
- Specific strengths shown in their delivery
- Specific areas to improve

Respond with ONLY valid JSON, no markdown, no explanation, in this exact format:
{
  "overallScore": 72,
  "transcript": "A summary of what the candidate said...",
  "communicationFeedback": "...",
  "confidenceFeedback": "...",
  "paceFeedback": "...",
  "fillerWordCount": 8,
  "strengths": ["...", "..."],
  "improvements": ["...", "..."],
  "summary": "A 2-3 sentence overall verdict."
}`

  const result = await model.generateContent([
    prompt,
    { fileData: { fileUri: file.uri, mimeType: file.mimeType } },
  ])
  const responseText = result.response.text()
  const cleaned = cleanJsonResponse(responseText)

  // Clean up: delete the file from Gemini's storage now that we're done with it
  try {
    await fileManager.deleteFile(file.name)
  } catch (cleanupErr) {
    console.warn('Could not delete Gemini file after analysis:', cleanupErr.message)
  }

  try {
    return JSON.parse(cleaned)
  } catch (err) {
    console.error('Failed to parse Gemini video analysis:', responseText)
    throw new Error('AI failed to analyze the video. Please try again.')
  }
}

/**
 * Evaluates all answered questions for an interview using Gemini.
 * Returns { overallScore, overallRating, feedback, strengths, weakAreas, questions: [{ score, feedback, idealAnswer }] }
 */
const evaluateInterview = async ({ topic, difficulty, questions }) => {
  const questionsBlock = questions
    .map((q, i) => `${i + 1}. Question: ${q.questionText}\nCandidate's Answer: ${q.userAnswer || '(No answer provided)'}`)
    .join('\n\n')

  const prompt = `You are an expert technical interviewer evaluating a candidate's mock interview performance.

Topic: ${topic}
Difficulty: ${difficulty}

Here are the questions and the candidate's answers:

${questionsBlock}

For each question, evaluate the candidate's answer and provide:
- A score out of 10 (0 if no answer was provided)
- Brief, specific, constructive feedback (2-3 sentences)
- A concise ideal/model answer (2-4 sentences)

Then provide an overall evaluation:
- overallScore: a percentage (0-100) representing overall performance across all questions
- overallRating: a short phrase like "Strong performance", "Good effort — room to grow", or "Needs more practice"
- feedback: a 3-4 sentence overall summary of the candidate's performance
- strengths: an array of 2-4 short specific strengths demonstrated
- weakAreas: an array of 2-4 short specific areas needing improvement

Respond with ONLY valid JSON, no markdown, no explanation, in this exact format:
{
  "overallScore": 75,
  "overallRating": "Good effort — room to grow",
  "feedback": "...",
  "strengths": ["...", "..."],
  "weakAreas": ["...", "..."],
  "questions": [
    { "score": 8, "feedback": "...", "idealAnswer": "..." }
  ]
}

The "questions" array must have exactly ${questions.length} items, in the same order as given above.`

 const result = await generateWithRetry(prompt)
  const responseText = result.response.text()
  const cleaned = cleanJsonResponse(responseText)

  try {
    const evaluation = JSON.parse(cleaned)
    if (!evaluation.questions || evaluation.questions.length !== questions.length) {
      throw new Error('Evaluation question count mismatch')
    }
    return evaluation
  } catch (err) {
    console.error('Failed to parse Gemini evaluation response:', responseText)
    throw new Error('AI failed to evaluate the interview. Please try again.')
  }
}

module.exports = {
  generateInterviewQuestions,
  evaluateInterview,
  analyzeResume,
  analyzeVideoInterview,
}