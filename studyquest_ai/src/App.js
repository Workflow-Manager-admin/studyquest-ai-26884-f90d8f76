import React, { useState, useRef } from 'react';
import './App.css';

// Color scheme as per requirements
const COLOR_PRIMARY = "#000000";
const COLOR_SECONDARY = "#95D5B2";
const COLOR_ACCENT = "#FFD166";

/**
 * PUBLIC_INTERFACE
 * MainContainer: Primary React container for StudyQuest AI Functionalities.
 */
function MainContainer() {
  // UI State Management
  const [file, setFile] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [mcqs, setMcqs] = useState([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [apiError, setApiError] = useState('');
  const fileInputRef = useRef();

  // Allowed file types
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  // PUBLIC_INTERFACE
  // Handle file upload & reset
  function handleFileChange(e) {
    setUploadError('');
    setApiError('');
    setFile(null);
    setExtractedText('');
    setQuizStarted(false);
    setUserAnswers([]);
    setMcqs([]);
    setQuizIndex(0);
    setShowFeedback(false);

    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;
    if (!allowedTypes.includes(uploadedFile.type)) {
      setUploadError('Only PDF and DOCX files are supported.');
      return;
    }
    setFile(uploadedFile);
  }

  // PUBLIC_INTERFACE
  // Extract text from file using async API (mock or real endpoint)
  async function extractTextFromFile(file) {
    /* This function sends the uploaded file to a backend/API for text extraction.
     * Update the endpoint variable to your actual backend API for text extraction as needed.
     * Returns extracted text as string.
     */
    const API_URL = "/api/extract_text"; // Example: '/api/extract_text' or replace with external service
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Try real API first: comment out below and use next block for real server
      // Real API call version:
      // const response = await fetch(API_URL, { method: "POST", body: formData });
      // if (!response.ok) throw new Error("Text extraction failed!");
      // const data = await response.json();
      // if (!data.text) throw new Error("No text extracted from document.");
      // return data.text;

      // -- MOCK fallback (no real endpoint) --
      return await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (file.type === "application/pdf")
            resolve("This is sample extracted text from the uploaded PDF file about World War II.");
          else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
            resolve("This is extracted content from the DOCX file about the water cycle.");
          else
            reject("Unsupported file type for extraction.");
        }, 1200);
      });
    } catch (e) {
      throw typeof e === "string" ? e : (e.message || "Failed to extract text.");
    }
  }

  // PUBLIC_INTERFACE
  // Generate MCQs from extracted text using API (mock or real endpoint)
  async function generateMCQsFromText(text) {
    /* This function sends text to a backend/API for MCQ generation.
     * Update with your real API endpoint as needed.
     * Returns array of MCQ objects, where each object contains:
     *   { question: string, options: array of string, correct: integer, explanation: string }
     */
    const API_URL = "/api/generate_mcq";

    try {
      // Uncomment below for real API usage and adapt as necessary for your backend's return format.
      // const response = await fetch(API_URL, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ text })
      // });
      // if (!response.ok) throw new Error("MCQ generation failed!");
      // const data = await response.json();
      // // Defensive: Normalize/transform response if API return structure is different or inconsistent
      // if (Array.isArray(data.questions)) {
      //   // Common backend response { questions: [...] }
      //   return data.questions.map(q => ({
      //     question: q.question || q.text || "",
      //     options: q.options || q.choices || [],
      //     correct: typeof q.correct === "number" ? q.correct : (Array.isArray(q.answers) ? q.answers[0] : 0),
      //     explanation: q.explanation || ""
      //   }));
      // } else if (Array.isArray(data)) {
      //   // Raw array response
      //   return data.map(q => ({
      //     question: q.question || q.text || "",
      //     options: q.options || q.choices || [],
      //     correct: typeof q.correct === "number" ? q.correct : (Array.isArray(q.answers) ? q.answers[0] : 0),
      //     explanation: q.explanation || ""
      //   }));
      // }
      // throw new Error("No questions generated or invalid response from MCQ API.");

      // -- MOCK fallback (matches expected schema for quiz rendering) --
      return await new Promise((resolve) => {
        setTimeout(() => {
          resolve([
            {
              question: "What is one major cause of World War II?",
              options: ["Discovery of America", "Versailles Treaty", "Space Race", "Internet Revolution"],
              correct: 1, // correct index in options
              explanation: "The Treaty of Versailles imposed harsh reparations on Germany, contributing to the rise of WWII."
            },
            {
              question: "What is the primary process in the water cycle?",
              options: ["Evaporation", "Photosynthesis", "Gravity", "Eruption"],
              correct: 0,
              explanation: "Evaporation turns water into vapor, beginning the water cycle."
            }
          ]);
        }, 1300);
      });
    } catch (e) {
      throw typeof e === "string" ? e : (e.message || "Failed to generate questions.");
    }
  }

  // PUBLIC_INTERFACE
  // Full submit process: extract & generate MCQs
  async function handleProcessFile() {
    setIsProcessing(true);
    setApiError('');
    setShowFeedback(false);
    setQuizStarted(false);
    setExtractedText('');
    setMcqs([]);
    setQuizIndex(0);
    setUserAnswers([]);
    try {
      // Step 1: Extract Text from backend API or mock
      const text = await extractTextFromFile(file);
      setExtractedText(text);

      // Step 2: Generate MCQs via API or mock
      const generatedMCQs = await generateMCQsFromText(text);

      setMcqs(generatedMCQs);
      setQuizStarted(true);
      setUserAnswers(Array(generatedMCQs.length).fill(null));
      setQuizIndex(0);
      setApiError('');
    } catch (err) {
      setApiError(typeof err === 'string' ? err : 'An error occurred during processing.');
    }
    setIsProcessing(false);
  }

  // PUBLIC_INTERFACE
  // Handle user selecting an answer
  function handleAnswerSelect(optionIdx) {
    if (!quizStarted || userAnswers[quizIndex] !== null) return;
    const updatedAnswers = [...userAnswers];
    updatedAnswers[quizIndex] = optionIdx;
    setUserAnswers(updatedAnswers);
    setShowFeedback(true);
  }

  // PUBLIC_INTERFACE
  // Next question navigation
  function handleNext() {
    if (quizIndex < mcqs.length - 1) {
      setQuizIndex(quizIndex + 1);
      setShowFeedback(false);
    }
  }

  // PUBLIC_INTERFACE
  // Previous question navigation
  function handlePrev() {
    if (quizIndex > 0) {
      setQuizIndex(quizIndex - 1);
      setShowFeedback(false);
    }
  }

  // PUBLIC_INTERFACE
  // Reset back to beginning
  function handleRestart() {
    setQuizStarted(false);
    setUserAnswers([]);
    setMcqs([]);
    setQuizIndex(0);
    setExtractedText('');
    setFile(null);
    setUploadError('');
    setApiError('');
    fileInputRef.current.value = '';
  }

  // Quiz progress
  const totalAnswered = userAnswers.filter((ans) => ans !== null).length;

  // UI: File Upload Step
  const renderFileUpload = () => (
    <section
      style={{
        background: COLOR_PRIMARY,
        padding: "32px 0 24px",
        marginBottom: "20px",
        borderRadius: 16,
        boxShadow: "0 1px 8px rgba(0,0,0,0.16)",
        border: `1px solid ${COLOR_SECONDARY}`,
      }}
      className="upload-section"
    >
      <h2 style={{ color: COLOR_ACCENT, fontWeight: 600, fontSize: "1.5rem", marginBottom: 12 }}>
        Upload Your Study Material
      </h2>
      <p style={{ color: "#BBBBBB", marginBottom: 18 }}>
        Supported formats: <span style={{ color: COLOR_SECONDARY, fontWeight: 500 }}>PDF</span>,{" "}
        <span style={{ color: COLOR_SECONDARY, fontWeight: 500 }}>DOCX</span>
      </p>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf, .docx, application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleFileChange}
        disabled={isProcessing}
        style={{ background: COLOR_PRIMARY, color: COLOR_SECONDARY, marginBottom: 16 }}
      />
      <br/>
      <button
        className="btn btn-large"
        style={{
          backgroundColor: COLOR_ACCENT,
          color: "#000",
          marginTop: 8,
          opacity: file && !isProcessing ? 1 : 0.6,
          cursor: (file && !isProcessing) ? "pointer" : "not-allowed"
        }}
        onClick={handleProcessFile}
        disabled={!file || isProcessing}
        tabIndex={0}
      >
        {isProcessing ? "Processing..." : "Generate MCQs"}
      </button>
      {uploadError && <div style={{ color: "#FF4040", marginTop: 12 }}>{uploadError}</div>}
      {apiError && <div style={{ color: "#FF4040", marginTop: 12 }}>{apiError}</div>}
    </section>
  );

  // UI: Progress indicator
  const renderProgress = () => (
    <div style={{ marginTop: 32, color: COLOR_SECONDARY }}>
      <span className="loader" style={{
        display: 'inline-block',
        border: `3px solid ${COLOR_ACCENT}`,
        borderRadius: '50%',
        borderTop: `3px solid ${COLOR_PRIMARY}`,
        width: 26, height: 26,
        animation: 'spin 1s linear infinite',
        marginRight: 10,
        verticalAlign: "middle",
      }} />
      Processing file and generating MCQs...
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg);}
          100% {transform: rotate(360deg);}
        }
      `}</style>
    </div>
  );

  // UI: Quiz Card / Interactive MCQ
  const renderQuiz = () => {
    if (!mcqs || !mcqs.length) return null;
    const current = mcqs[quizIndex];
    const userAns = userAnswers[quizIndex];
    const isCorrect = userAns === current.correct;
    return (
      <section
        style={{
          background: COLOR_PRIMARY,
          border: `1px solid ${COLOR_SECONDARY}`,
          borderRadius: 12,
          padding: "32px 5vw",
          marginTop: 32,
          boxShadow: "0 2px 10px rgba(0,0,0,0.13)"
        }}
        className="quiz-section"
      >
        <div style={{ marginBottom: 20, fontSize: "1.1rem", color: COLOR_ACCENT, fontWeight: 500 }}>
          Question {quizIndex + 1} of {mcqs.length}
        </div>
        <h3 style={{ marginBottom: 20, color: COLOR_SECONDARY, fontWeight: 600 }}>{current.question}</h3>
        <div>
          {current.options.map((opt, idx) => {
            // visual feedback coloring
            let optionStyle = {
              background: COLOR_SECONDARY,
              color: "#000",
              marginBottom: 12,
              padding: "10px 22px",
              border: "none",
              borderRadius: 6,
              fontSize: "1rem",
              cursor: quizStarted && userAns === null ? "pointer" : "not-allowed",
              minWidth: 200,
              textAlign: "left",
              opacity: 1,
              transition: "background-color 0.18s"
            };
            if (showFeedback && userAns !== null) {
              if (idx === userAns) {
                optionStyle.background = idx === current.correct ? "#40916C" : "#D7263D";
                optionStyle.color = "#fff";
              } else if (idx === current.correct) {
                optionStyle.background = "#40916C";
                optionStyle.color = "#fff";
              } else {
                optionStyle.opacity = 0.6;
              }
            }
            return (
              <button
                key={idx}
                className="btn"
                style={optionStyle}
                onClick={() => handleAnswerSelect(idx)}
                disabled={!quizStarted || userAns !== null}
                tabIndex={0}
              >
                {opt}
              </button>
            );
          })}
        </div>
        {/* Feedback */}
        {showFeedback && userAns !== null && (
          <div
            style={{
              marginTop: 22,
              color: isCorrect ? "#58D68D" : "#E74C3C",
              background: isCorrect ? "#233C27" : "#2E151B",
              borderRadius: 6,
              padding: "11px 18px",
              fontWeight: 500
            }}
          >
            {isCorrect ? "✅ Correct!" : "❌ Incorrect."}{" "}
            <span style={{ color: COLOR_ACCENT, fontWeight: 400 }}>
              {current.explanation}
            </span>
          </div>
        )}
        {/* Navigation */}
        <div style={{ marginTop: 30, display: "flex", justifyContent: "space-between" }}>
          <button
            className="btn"
            style={{
              backgroundColor: COLOR_SECONDARY,
              color: "#111",
              opacity: quizIndex === 0 ? 0.5 : 1,
              pointerEvents: quizIndex === 0 ? "none" : "auto"
            }}
            onClick={handlePrev}
            disabled={quizIndex === 0}
            tabIndex={0}
          >
            Previous
          </button>
          <button
            className="btn"
            style={{
              backgroundColor: COLOR_ACCENT,
              color: "#000",
              opacity: quizIndex < mcqs.length - 1 ? 1 : 0.5,
              pointerEvents: quizIndex < mcqs.length - 1 ? "auto" : "none"
            }}
            onClick={handleNext}
            disabled={quizIndex >= mcqs.length - 1}
            tabIndex={0}
          >
            Next
          </button>
        </div>
        {/* Quiz Progress/Finish */}
        <div style={{ marginTop: 27, color: "#aaa", fontWeight: 400 }}>
          {totalAnswered === mcqs.length && (
            <>
              🎉 Quiz complete! You answered {mcqs.filter((q, idx) => userAnswers[idx] === q.correct).length} / {mcqs.length} correctly.
              <button
                className="btn"
                style={{ backgroundColor: COLOR_SECONDARY, color: "#000", marginLeft: 25, fontWeight: 500 }}
                onClick={handleRestart}
                tabIndex={0}
              >
                Restart
              </button>
            </>
          )}
        </div>
      </section>
    );
  };

  return (
    <div className="app" style={{ minHeight: "100vh", background: COLOR_PRIMARY }}>
      {/* NAVBAR */}
      <nav className="navbar" style={{ background: COLOR_PRIMARY, borderBottom: `2px solid ${COLOR_SECONDARY}` }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div className="logo" style={{ fontSize: "1.6rem", color: COLOR_ACCENT }}>
            <span className="logo-symbol" style={{ fontSize: "1.4em", marginRight: 4, color: COLOR_ACCENT }}>★</span>
            StudyQuest <span style={{ fontWeight: 300, fontSize: "0.95em", color: COLOR_SECONDARY, marginLeft: 10 }}>AI</span>
          </div>
          <a
            href="https://github.com"
            className="btn"
            style={{
              backgroundColor: COLOR_SECONDARY,
              color: "#111",
              fontWeight: 600,
              fontSize: "1em"
            }}
            tabIndex={0}
          >
            Help
          </a>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main>
        <div className="container">
          {/* HERO / Headline */}
          <section className="hero" style={{ paddingTop: 115, paddingBottom: 45, marginBottom: 30 }}>
            <div className="subtitle" style={{ color: COLOR_ACCENT }}>AI-Powered Revision Made Easy</div>
            <h1 className="title" style={{ color: "#fff", fontSize: "3.5em", marginTop: 0, marginBottom: 14 }}>
              StudyQuest <span style={{ color: COLOR_SECONDARY }}>AI</span>
            </h1>
            <div className="description" style={{ color: "#bbb", maxWidth: 620, marginBottom: 4 }}>
              Upload your study material, let AI generate tailored MCQs, and practice interactively for smarter, faster revision. Student-friendly, instant feedback, no stress!
            </div>
          </section>
          {/* File Upload Section */}
          {!quizStarted && renderFileUpload()}
          {/* Show "Processing..." progress */}
          {isProcessing && renderProgress()}
          {/* Quiz UI */}
          {quizStarted && !isProcessing && renderQuiz()}
        </div>
      </main>
      {/* Simple footer */}
      <footer style={{
        marginTop: "60px",
        padding: "18px 0",
        textAlign: "center",
        backgroundColor: COLOR_PRIMARY,
        color: COLOR_SECONDARY,
        fontSize: "0.96em",
        letterSpacing: 0.04,
        borderTop: `1px solid ${COLOR_SECONDARY}`,
      }}>
        © {new Date().getFullYear()} StudyQuest AI &bull; Smart Revision for Students
      </footer>
    </div>
  );
}

export default MainContainer;
