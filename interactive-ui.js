(() => {
  const stage = document.querySelector('#demoStage');
  const demo = document.querySelector('.app-demo');
  const title = document.querySelector('#demoTitle');
  const tabs = [...document.querySelectorAll('.demo-tabs button')];
  if (!stage || !demo || tabs.length < 3) return;

  const flashCards = [
    ['Why is a delayed low-air warning dangerous?', 'It reduces reaction time before unsafe pressure loss and spring-brake application.'],
    ['What are cut-in and cut-out pressures?', 'Cut-in starts compressor loading; cut-out stops it after full pressure is reached.'],
    ['Why must air tanks be drained?', 'To remove water and oil that can damage components or freeze in cold weather.'],
    ['What causes spring brakes to apply?', 'They apply when air is released for parking or system pressure becomes dangerously low.'],
    ['What causes brake fade on a downgrade?', 'Excessive heat reduces friction and braking power. Select the proper gear before descending.'],
    ['What does excessive slack-adjuster movement mean?', 'The brakes may be out of adjustment and need inspection before driving.'],
    ['Why are there two air-pressure gauges?', 'They monitor the two independent parts of a dual air-brake system.'],
    ['What does ABS help prevent?', 'Wheel lockup during hard braking; it does not necessarily shorten stopping distance.'],
    ['Why perform an applied leakage test?', 'To find excessive leakage while the service brakes are held fully applied.'],
    ['What should you do after a low-air warning?', 'Stop safely as soon as possible and have the system inspected.']
  ];
  const examQuestions = [
    ['A driver says automatic slack adjusters mean brake stroke never needs inspection. What is correct?', ['Stroke must still be inspected because automatic adjusters can fail', 'Correct; automatic adjusters remove inspection duties', 'Only ABS-equipped brakes need inspection', 'Inspection is needed only after a warning light'], 0],
    ['When should the low-air warning activate?', ['Before pressure falls below 60 psi', 'Only after spring brakes apply', 'At normal cut-out pressure', 'When the engine is switched off'], 0],
    ['What is the safest response to a low-air warning while driving?', ['Stop safely as soon as possible', 'Pump the brakes to rebuild pressure', 'Increase engine speed and continue', 'Pull the parking brake immediately'], 0],
    ['Why drain air tanks?', ['To remove moisture and oil', 'To increase governor cut-out pressure', 'To test ABS wiring', 'To release spring brakes'], 0],
    ['What does the air compressor governor control?', ['When the compressor pumps air', 'The force applied at each brake', 'The ABS warning lamp', 'The parking brake valve'], 0],
    ['During a static leakage test, excessive pressure loss indicates what?', ['A leak that requires repair', 'Normal brake adjustment', 'A fully charged system', 'Correct governor operation'], 0],
    ['What happens when brakes are repeatedly applied with the engine off?', ['Air pressure decreases', 'Air pressure increases', 'Spring brakes release', 'The compressor reaches cut-out'], 0],
    ['Why check the slack adjusters?', ['To identify excessive brake travel', 'To drain the supply tank', 'To test the governor', 'To inspect tire tread'], 0],
    ['What is brake fade?', ['Reduced braking from excessive heat', 'A sudden rise in air pressure', 'Automatic ABS activation', 'Normal lining break-in'], 0],
    ['Long mountain downgrades create an air-brake challenge because they:', ['Improve tire grip', 'Reduce stopping distance', 'Can lead to brake overheating if not managed properly', 'Eliminate brake-fade risk'], 2]
  ];

  let flashIndex = 0;
  let revealed = false;
  let whyOpen = false;
  let ratings = { again: 0, hard: 0, good: 0, easy: 0 };
  let ratingByCard = Array(10).fill(null);
  let examIndex = 0;
  let examAnswers = Array(10).fill(null);
  let reviewIndex = 0;
  let trainingQueue = [];
  let trainingIndex = 0;
  let trainingCorrect = 0;
  let trainingAnswered = false;
  let examTimerMinutes = 0;
  let examSecondsRemaining = 0;
  let examTimerId = null;
  let examAdvanceTimeout = null;

  const stopExamTimer = () => {
    if (examTimerId) clearInterval(examTimerId);
    examTimerId = null;
  };

  const formatExamTime = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  const startExamTimer = () => {
    stopExamTimer();
    if (!examTimerMinutes || examSecondsRemaining <= 0) return;
    examTimerId = setInterval(() => {
      examSecondsRemaining = Math.max(0, examSecondsRemaining - 1);
      const liveTime = stage.querySelector('.exam-live-time');
      if (liveTime) liveTime.textContent = formatExamTime(examSecondsRemaining);
      if (examSecondsRemaining === 0) {
        stopExamTimer();
        finishExam();
      }
    }, 1000);
  };

  const activate = (mode) => {
    clearTimeout(examAdvanceTimeout);
    if (mode !== 'exam') stopExamTimer();
    tabs.forEach((tab) => tab.classList.toggle('active', tab.dataset.mode === mode));
    demo.classList.remove('mode-practice', 'mode-flashcards', 'mode-exam');
    demo.classList.add(`mode-${mode}`);
    title.textContent = mode === 'flashcards' ? 'Flashcards' : 'Exam Mode';
  };

  const finishFlash = () => {
    const total = Object.values(ratings).reduce((sum, value) => sum + value, 0);
    stage.innerHTML = `<div class="flash-summary-ui">
      <section class="flash-summary-hero"><i>🏆</i><div><h3>Great Work!</h3><p>You reviewed ${total} flashcards today.</p></div></section>
      <section class="flash-summary-card"><h3>Session Summary</h3>
        <div class="summary-row total"><i>▰</i><b>Total Reviewed</b><strong>${total}</strong></div>
        <div class="summary-row again"><i>↻</i><b>Again</b><strong>${ratings.again}</strong></div>
        <div class="summary-row hard"><i>◆</i><b>Hard</b><strong>${ratings.hard}</strong></div>
        <div class="summary-row good"><i>●</i><b>Good</b><strong>${ratings.good}</strong></div>
        <div class="summary-row easy"><i>✓</i><b>Easy</b><strong>${ratings.easy}</strong></div>
      </section>
      <section class="flash-insights"><h3>Performance Insights</h3><article class="needs"><b>↘ &nbsp; Needs Review</b><p>${flashCards[0][0]}</p></article><article class="strong"><b>↗ &nbsp; Strongest Card</b><p>${flashCards[8][0]}</p></article></section>
      <button class="summary-back">← &nbsp; Back to Deck</button>
    </div>`;
    stage.querySelector('.summary-back').onclick = startFlash;
  };

  const advanceFlash = (rating = 'good') => {
    const previousRating = ratingByCard[flashIndex];
    if (previousRating) ratings[previousRating] -= 1;
    ratingByCard[flashIndex] = rating;
    ratings[rating] += 1;
    if (flashIndex === flashCards.length - 1) return finishFlash();
    flashIndex += 1;
    revealed = false;
    whyOpen = false;
    renderFlash();
  };

  const renderFlash = () => {
    const card = flashCards[flashIndex];
    stage.innerHTML = `<div class="flash-session app-flash-session">
      <div class="mode-title"><span>←</span><b>Flashcards – air_brakes</b><span>⋮</span></div>
      <div class="flash-progress"><i><em style="width:${(flashIndex + 1) * 10}%"></em></i><span>Card ${flashIndex + 1} of 10</span></div>
      <div class="app-flash-card ${revealed ? 'answer-side' : 'question-side'}">
        ${revealed ? `<span class="answer-label">CORRECT ANSWER</span><div class="answer-panel"><i>✓</i><h3>${card[1]}</h3></div><h4>How well did you know this?</h4><div class="rating-grid"><button data-rating="again">Again</button><button data-rating="hard">Hard</button><button data-rating="good">Good</button><button data-rating="easy">Easy</button></div><button class="why-button" aria-expanded="${whyOpen}"><span>●</span><b>Why</b><em>${whyOpen ? 'Show less⌃' : 'Show more⌄'}</em></button>${whyOpen ? `<div class="why-explanation"><p>${card[2] || card[1]}</p></div>` : ''}` : `<span class="question-pill">ⓘ &nbsp; QUESTION</span><i class="question-icon">?</i><h3>${card[0]}</h3><button class="reveal-answer">☝ &nbsp; Tap to reveal answer</button>`}
      </div>
      <div class="flash-nav"><button class="flash-prev" ${flashIndex === 0 ? 'disabled' : ''}>‹ &nbsp; Previous</button><button class="flash-next">Next &nbsp; ›</button></div>
      <button class="restart-deck">↻ &nbsp; Restart Deck</button>
    </div>`;
    stage.querySelector('.reveal-answer')?.addEventListener('click', () => { revealed = true; whyOpen = false; renderFlash(); });
    stage.querySelector('.why-button')?.addEventListener('click', () => { whyOpen = !whyOpen; renderFlash(); });
    stage.querySelectorAll('[data-rating]').forEach((button) => button.onclick = () => advanceFlash(button.dataset.rating));
    stage.querySelector('.flash-next').onclick = () => advanceFlash('good');
    stage.querySelector('.flash-prev').onclick = () => { if (flashIndex > 0) { flashIndex -= 1; revealed = false; whyOpen = false; renderFlash(); } };
    stage.querySelector('.restart-deck').onclick = startFlash;
  };

  function startFlash() {
    activate('flashcards');
    flashIndex = 0;
    revealed = false;
    whyOpen = false;
    ratings = { again: 0, hard: 0, good: 0, easy: 0 };
    ratingByCard = Array(10).fill(null);
    renderFlash();
  }

  const examScore = () => examAnswers.reduce((sum, answer, i) => sum + (answer === examQuestions[i][2] ? 1 : 0), 0);
  const renderExam = () => {
    const question = examQuestions[examIndex];
    const correct = examScore();
    const answeredCount = examAnswers.filter((answer) => answer !== null).length;
    stage.innerHTML = `<div class="exam-ui">
      <div class="exam-back">‹</div>
      <section class="exam-simulator-head"><div class="exam-icon">▣</div><div class="exam-head-copy"><h3>Air Brakes</h3><p>DMV simulation · 8/10 required to pass</p></div><label class="exam-timer-picker"><span>⏱</span><select aria-label="Exam timer"><option value="0" ${examTimerMinutes === 0 ? 'selected' : ''}>Timer off</option><option value="10" ${examTimerMinutes === 10 ? 'selected' : ''}>10 min</option><option value="15" ${examTimerMinutes === 15 ? 'selected' : ''}>15 min</option><option value="30" ${examTimerMinutes === 30 ? 'selected' : ''}>30 min</option></select>${examTimerMinutes ? `<small class="exam-live-time">${formatExamTime(examSecondsRemaining)}</small>` : ''}</label><i><em style="width:${(examIndex + 1) * 10}%"></em></i><b>${examIndex + 1}/10</b></section>
      <section class="exam-question-card"><span>QUESTION</span><h3>${question[0]}</h3></section>
      <div class="exam-answer-list">${question[1].map((answer, i) => `<button data-answer="${i}" class="${examAnswers[examIndex] === i ? 'selected' : ''}"><b>${String.fromCharCode(65 + i)}</b><span>${answer}</span></button>`).join('')}</div>
      <section class="exam-live-stats"><div><b>${correct}</b><span>Correct</span></div><div><b>${10 - answeredCount}</b><span>Remaining</span></div><div><b>${Math.max(0, 8 - correct)}</b><span>To Pass</span></div></section>
    </div>`;
    stage.querySelectorAll('[data-answer]').forEach((button) => button.onclick = () => {
      if (examAnswers[examIndex] !== null) return;
      examAnswers[examIndex] = Number(button.dataset.answer);
      stage.querySelectorAll('[data-answer]').forEach((answerButton) => { answerButton.disabled = true; });
      button.classList.add('selected');
      examAdvanceTimeout = setTimeout(() => {
        if (examIndex < examQuestions.length - 1) {
          examIndex += 1;
          renderExam();
        } else finishExam();
      }, 350);
    });
    stage.querySelector('.exam-timer-picker select').onchange = (event) => {
      examTimerMinutes = Number(event.target.value);
      examSecondsRemaining = examTimerMinutes * 60;
      renderExam();
      startExamTimer();
    };
  };

  const finishExam = () => {
    clearTimeout(examAdvanceTimeout);
    stopExamTimer();
    const score = examScore();
    const percent = score * 10;
    const passed = score >= 8;
    stage.innerHTML = `<div class="exam-result-ui ${passed ? 'passed' : 'failed'}">
      <section class="exam-result-hero"><i>↗</i><h3>${passed ? 'Road Ready' : 'Almost There'}</h3><p>${passed ? 'You reached the passing target.' : `You missed ${10 - score}. Train weak areas and retake.`}</p><strong>${percent}%</strong><span><em style="width:${percent}%"></em></span><div><b>${score}/10<small>Score</small></b><b>8<small>Pass Mark</small></b></div></section>
      <section class="result-stat-grid"><div><i>◎</i><b>${percent}%</b><span>Accuracy</span></div><div><i>△</i><b>${10 - score}</b><span>Missed</span></div><div><i>↗</i><b>${passed ? 'Pass' : 'Train'}</b><span>Status</span></div></section>
      <section class="weak-breakdown"><h3>Weak Area Breakdown</h3><p>These misses were saved into your weak-area engine.</p><article><div><b>Air Brakes</b><span>High Risk</span></div><strong>${100 - percent}%</strong><i><em style="width:${100 - percent}%"></em></i><button class="weak-detail-button">⌄ &nbsp; View Details</button></article></section>
      <section class="result-insight"><b>Learning Insight</b><p>Your weak-area engine adapts based on answer history, recovery, and repeated misses.</p></section>
      <section class="result-recommend"><b>Recommended Next Step</b><p>Focus on air brakes to improve your weakest performance area.</p></section>
      <button class="train-button">? &nbsp; Train Weak Areas</button><button class="review-button">▣ &nbsp; Review Answers</button><button class="exam-restart">← &nbsp; Back to Exam Mode</button>
    </div>`;
    const openReview = () => { reviewIndex = examAnswers.findIndex((answer, i) => answer !== examQuestions[i][2]); if (reviewIndex < 0) reviewIndex = 0; renderReview(); };
    stage.querySelector('.review-button').onclick = openReview;
    stage.querySelector('.weak-detail-button').onclick = openReview;
    stage.querySelector('.exam-restart').onclick = startExam;
    stage.querySelector('.train-button').onclick = startTraining;
  };

  const renderReview = () => {
    const question = examQuestions[reviewIndex];
    const selected = examAnswers[reviewIndex];
    const correct = question[2];
    const isCorrect = selected === correct;
    stage.innerHTML = `<div class="exam-review-ui">
      <button class="review-title" type="button">‹ &nbsp; <b>Review Answers</b></button>
      <section class="review-head ${isCorrect ? 'correct' : ''}"><i>${isCorrect ? '✓' : '×'}</i><div><h3>${isCorrect ? 'Correct' : 'Incorrect'}</h3><p>Question ${reviewIndex + 1} of 10</p></div><b>${reviewIndex + 1}/10</b><span><em style="width:${(reviewIndex + 1) * 10}%"></em></span></section>
      <div class="review-chips">${examQuestions.map((q, i) => `<button data-review="${i}" class="${i === reviewIndex ? 'active' : ''} ${examAnswers[i] === q[2] ? 'right' : 'wrong'}">${i + 1}</button>`).join('')}</div>
      <section class="review-question"><span>AIR BRAKES · REVIEW</span><h3>${question[0]}</h3></section>
      <div class="review-answers">${question[1].map((answer, i) => `<article class="${i === correct ? 'correct-answer' : i === selected ? 'your-answer' : ''}"><b>${String.fromCharCode(65 + i)}</b><div><strong>${answer}</strong>${i === correct ? '<span>Correct Answer</span>' : i === selected ? '<span>Your Answer</span>' : ''}</div><i>${i === correct ? '✓' : i === selected ? '×' : ''}</i></article>`).join('')}</div>
      <div class="review-nav"><button class="review-prev" ${reviewIndex === 0 ? 'disabled' : ''}>← &nbsp; Previous</button><button class="review-next" ${reviewIndex === 9 ? 'disabled' : ''}>Next &nbsp; →</button></div>
      <button class="review-train">? &nbsp; Train All Missed Questions</button>
    </div>`;
    stage.querySelectorAll('[data-review]').forEach((button) => button.onclick = () => { reviewIndex = Number(button.dataset.review); renderReview(); });
    stage.querySelector('.review-title').onclick = finishExam;
    stage.querySelector('.review-prev').onclick = () => { if (reviewIndex > 0) { reviewIndex -= 1; renderReview(); } };
    stage.querySelector('.review-next').onclick = () => { if (reviewIndex < 9) { reviewIndex += 1; renderReview(); } };
    stage.querySelector('.review-train').onclick = startTraining;
  };

  function startTraining() {
    trainingQueue = examQuestions.map((question, i) => ({ question, originalIndex: i })).filter((item) => examAnswers[item.originalIndex] !== item.question[2]);
    trainingIndex = 0;
    trainingCorrect = 0;
    trainingAnswered = false;
    if (!trainingQueue.length) return renderTrainingComplete();
    renderTraining();
  }

  const renderTraining = () => {
    const item = trainingQueue[trainingIndex];
    const question = item.question;
    stage.innerHTML = `<div class="weak-training-ui">
      <div class="training-title">‹ &nbsp; <b>Train Weak Areas</b></div>
      <section class="training-head"><div class="training-icon">△</div><div><h3>Air Brakes</h3><p>Targeted training · missed exam questions</p></div><span>${trainingIndex + 1}/${trainingQueue.length}</span><i><em style="width:${((trainingIndex + 1) / trainingQueue.length) * 100}%"></em></i></section>
      <section class="training-question"><span>WEAK AREA QUESTION</span><h3>${question[0]}</h3></section>
      <div class="training-answers">${question[1].map((answer, i) => `<button data-training-answer="${i}"><b>${String.fromCharCode(65 + i)}</b><span>${answer}</span><i></i></button>`).join('')}</div>
      <button class="training-next" disabled>${trainingIndex === trainingQueue.length - 1 ? 'See Recovery Result' : 'Next Missed Question'} &nbsp; →</button>
    </div>`;
    stage.querySelectorAll('[data-training-answer]').forEach((button) => button.onclick = () => {
      if (trainingAnswered) return;
      trainingAnswered = true;
      const selected = Number(button.dataset.trainingAnswer);
      const correct = question[2];
      if (selected === correct) trainingCorrect += 1;
      const buttons = [...stage.querySelectorAll('[data-training-answer]')];
      buttons[selected].classList.add(selected === correct ? 'correct' : 'wrong');
      buttons[selected].querySelector('i').textContent = selected === correct ? '✓' : '×';
      buttons[correct].classList.add('correct');
      buttons[correct].querySelector('i').textContent = '✓';
      stage.querySelector('.training-next').disabled = false;
    });
    stage.querySelector('.training-next').onclick = () => {
      if (!trainingAnswered) return;
      if (trainingIndex < trainingQueue.length - 1) {
        trainingIndex += 1;
        trainingAnswered = false;
        renderTraining();
      } else renderTrainingComplete();
    };
  };

  const renderTrainingComplete = () => {
    const total = trainingQueue.length;
    const recovered = total ? Math.round((trainingCorrect / total) * 100) : 100;
    stage.innerHTML = `<div class="training-complete-ui">
      <section><i>✓</i><h3>${total ? 'Weak-Area Retry Complete' : 'No Missed Questions'}</h3><p>${total ? 'You retried every question missed on the exam.' : 'You answered every exam question correctly.'}</p><strong>${recovered}%</strong></section>
      <div><article><b>${total}</b><span>Retried</span></article><article><b>${trainingCorrect}</b><span>Recovered</span></article><article><b>${Math.max(0, total - trainingCorrect)}</b><span>Still Weak</span></article></div>
      <button class="retry-weak">↻ &nbsp; Retry Missed Again</button><button class="back-results">← &nbsp; Back to Exam Results</button>
    </div>`;
    stage.querySelector('.retry-weak').onclick = startTraining;
    stage.querySelector('.back-results').onclick = finishExam;
  };

  function startExam() {
    clearTimeout(examAdvanceTimeout);
    activate('exam');
    examIndex = 0;
    examAnswers = Array(10).fill(null);
    examSecondsRemaining = examTimerMinutes * 60;
    renderExam();
    startExamTimer();
  }

  const practiceTab = tabs.find((tab) => tab.dataset.mode === 'practice');
  practiceTab.addEventListener('click', () => { stopExamTimer(); demo.classList.remove('mode-flashcards', 'mode-exam'); });
  tabs.find((tab) => tab.dataset.mode === 'flashcards').onclick = startFlash;
  tabs.find((tab) => tab.dataset.mode === 'exam').onclick = startExam;
})();
