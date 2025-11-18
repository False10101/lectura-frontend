import React, { useState, useMemo, useEffect, useCallback } from "react";
import SideBar from "../components/SideBar";
import quizQuestions from "../lib/quizQuestions";

const COLORS = {
  questionMarkBg: "#382A86",
  boxBorder: "#45378D",
  progressStart: "#4439CA",
  progressEnd: "#2E1B8C",
  buttonStart: "#45378D",
  buttonEnd: "#4A1E94",
};

export const Quiz = () => {
  const total = quizQuestions.length;
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [dominant, setDominant] = useState(null);
  // const [varkResult, setVarkResult] = useState(""); // <-- Removed, no longer needed

  const percent = Math.round(((current + 1) / total) * 100);
  const currentQ = quizQuestions[current];
  const selectedIndex = answers[currentQ.id];

  const selectOption = (idx) => {
    setAnswers((prev) => ({ ...prev, [currentQ.id]: idx }));
  };

  const goNext = () => {
    if (current < total - 1) setCurrent((c) => c + 1);
    else submitQuiz();
  };

  const goPrev = () => {
    // <-- FIXED BUG HERE (was c + 1)
    if (current > 0) setCurrent((c) => c - 1);
  };

  const submitQuiz = () => {
    // 1. Initialize totals
    const totals = { V: 0, A: 0, R: 0, K: 0 };

    // 2. Loop over each question
    quizQuestions.forEach((question) => {
      // 3. Get the index of the answer the user chose (e.g., 0, 1, 2)
      const selectedOptionIndex = answers[question.id];

      // 4. Check if they answered this question
      if (selectedOptionIndex !== undefined) {
        
        // 5. Get the specific option object they chose
        // e.g., { text: "...", weights: { V: 5 } }
        const chosenOption = question.options[selectedOptionIndex];
        
        // 6. Get the weights object from it
        // e.g., { V: 5 }
        const weightsObj = chosenOption.weights;

        // 7. Get the key (e.g., "V")
        const varkType = Object.keys(weightsObj)[0];
        
        // 8. Get the value (e.g., 5)
        const weightValue = weightsObj[varkType];

        // 9. Add that value to the correct total
        if (totals.hasOwnProperty(varkType)) {
          totals[varkType] += weightValue;
        }
      }
    });

    // This part from before is now correct
    const order = ["V", "A", "R", "K"];
    let best = order[0]; // Start with 'V'

    // Loop and find the highest score
    order.forEach((k) => {
      if (totals[k] > totals[best]) {
        best = k;
      }
    });

    setDominant(best);
    setSubmitted(true);

    console.log("VARK totals:", totals); // This will now show correct totals
    console.log("Dominant:", best);  // This will now show the correct winner
  };

  const handleSetVark = useCallback(async () => {
    if (!dominant) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/user/vark/${dominant}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      // ===================================
      // ADD THIS CHECK
      // ===================================
      if (!res.ok) {
        // We got an error, like 404 or 500
        const errorData = await res.json();
        console.error("Failed to set VARK type:", res.status, errorData.payload);
        return; // Stop here
      }
      // ===================================

      // This line will ONLY run if res.ok was true
      console.log("VARK type set successfully:", dominant);

    } catch (error) {
      // This catch block is for NETWORK errors
      console.error("Network error setting VARK:", error);
    }
  }, [dominant]); // <-- Dependency is dominant

  const labelFor = useMemo(
    () => ({
      V: "Visual",
      A: "Auditory",
      R: "Read / Write",
      K: "Kinesthetic",
    }),
    []
  );

  useEffect(() => {
    // Check for dominant instead of varkResult
    if (submitted && dominant) {
      handleSetVark();
    }
  }, [submitted, dominant, handleSetVark]); // <-- Dependency is dominant

  // Result Screen
  if (submitted) {
    return (
      <div className="flex h-screen bg-white">
        <SideBar />
        <div className="flex-1 p-10 flex flex-col items-center justify-center">
          <div className="text-center">
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 999,
                background: COLORS.questionMarkBg,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto",
                fontWeight: "700",
                fontSize: 48,
              }}
            >
              ?
            </div>
            <h1
              className="text-3xl font-bold mt-4"
              style={{ color: COLORS.boxBorder }}
            >
              Quiz Completed
            </h1>
            <p className="mt-3 text-gray-600">
              Your dominant learning style is:
            </p>

            <div
              className="mt-6 inline-block px-8 py-4 rounded-lg shadow"
              style={{ border: `2px solid ${COLORS.boxBorder}` }}
            >
              <h2
                className="text-2xl font-extrabold"
                style={{ color: COLORS.boxBorder }}
              >
                {labelFor[dominant]}
              </h2>
            </div>

            <div className="mt-6 flex gap-4 justify-center">
              <button
                onClick={() =>
                  alert(`User's VARK type: "${labelFor[dominant]}"`)
                }
                className="px-6 py-2 rounded-md text-white"
                style={{
                  background: `linear-gradient(90deg, ${COLORS.buttonStart}, ${COLORS.buttonEnd})`,
                }}
              >
                OK
              </button>

              <button
                onClick={() => {
                  setSubmitted(false);
                  setDominant(null);
                  setAnswers({});
                  setCurrent(0);
                  // setVarkResult(""); // <-- Removed
                }}
                className="px-6 py-2 rounded-md border"
              >
                Retake
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  //Quiz Form
  return (
    <div className="flex h-screen bg-gray-50">
      <SideBar />
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto text-center mb-6">
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 999,
              background: COLORS.questionMarkBg,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
              fontWeight: "700",
              fontSize: 48,
            }}
          >
            ?
          </div>

          <h1 className="mt-3 text-3xl font-bold" style={{ color: COLORS.boxBorder }}>
            Let's Get To Know You
          </h1>
          <p className="text-gray-600 mt-2">
            Take this short quiz so we can personalize how your lecture notes are explained.
          </p>
        </div>

        <div className="max-w-4xl mx-auto mb-3 px-4">
          <div className="flex items-center justify-between text-sm text-gray-700 mb-2">
            <div style={{ color: "#333" }}>
              Question {current + 1} of {total}
            </div>
            <div style={{ color: "#333" }}>{percent}% Complete</div>
          </div>

          <div
            style={{
              height: 10,
              background: "#ececec",
              borderRadius: 999,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${percent}%`,
                background: `linear-gradient(90deg, ${COLORS.progressStart}, ${COLORS.progressEnd})`,
                transition: "width 300ms ease",
              }}
            />
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 relative">
          <div
            style={{
              borderRadius: 14,
              border: `3px solid ${COLORS.boxBorder}`,
              padding: 28,
              background: "#fff",
              boxShadow: "0 6px 18px rgba(0,0,0,0.04)",
            }}
          >
            <h2 className="text-xl font-semibold text-center mb-6" style={{ color: "#111" }}>
              {currentQ.question}
            </h2>

            <div className="flex flex-col gap-4">
              {currentQ.options.map((opt, i) => {
                const isSelected = selectedIndex === i;
                return (
                  <button
                    key={i}
                    onClick={() => selectOption(i)}
                    className="w-full text-left p-4 rounded-lg transition-all"
                    style={{
                      border: isSelected ? `2px solid ${COLORS.boxBorder}` : "1px solid #e8e8e8",
                      background: isSelected ? "rgba(69,55,141,0.06)" : "#fff",
                      boxShadow: isSelected ? "0 6px 12px rgba(69,55,141,0.06)" : "none",
                    }}
                  >
                    <div style={{ color: "#111" }}>{opt.text}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={goPrev}
            disabled={current === 0}
            className="absolute -left-16"
            style={{
              bottom: -120,
              padding: "8px 16px",
              borderRadius: 6,
              background: current === 0 ? "#f3f3f3" : `linear-gradient(90deg, ${COLORS.buttonStart}, ${COLORS.buttonEnd})`,
              color: "#fff",
              border: "none",
              cursor: current === 0 ? "not-allowed" : "pointer",
            }}
          >
            ← Previous
          </button>

          <button
            onClick={goNext}
            disabled={selectedIndex === undefined}
            className="absolute -right-16"
            style={{
              bottom: -120,
              padding: "8px 16px",
              borderRadius: 6,
              background:
                selectedIndex === undefined
                  ? "#cfc7f5"
                  : `linear-gradient(90deg, ${COLORS.buttonStart}, ${COLORS.buttonEnd})`,
              color: "#fff",
              border: "none",
              cursor: selectedIndex === undefined ? "not-allowed" : "pointer",
            }}
          >
            {current === total - 1 ? "Submit" : "Next Question →"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Quiz;