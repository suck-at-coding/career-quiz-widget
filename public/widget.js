(() => {
  const QUESTIONS = [
    { id: 'analytical', text: 'I enjoy solving complex numerical problems.', weight: 1 },
    { id: 'creative',    text: 'I like to come up with new ideas and designs.', weight: 1 },
    { id: 'social',      text: 'I prefer collaborating and helping others daily.', weight: 1 },
    // … add ~10–15 more, each with a unique id you’ll bucket later
  ];

  let current = 0;
  const answers = {};

  const quizEl    = document.getElementById('quiz');
  const nextBtn   = document.getElementById('next-btn');
  const resultsEl = document.getElementById('results');

  function renderQuestion() {
    const q = QUESTIONS[current];
    quizEl.innerHTML = `
      <div class="question">
        <strong>${q.text}</strong>
        <div class="options">
          ${[1,2,3,4,5].map(n =>
            `<label><input type="radio" name="opt" value="${n}"/> ${n}</label>`
           ).join('')}
        </div>
      </div>
    `;
    nextBtn.textContent = current === QUESTIONS.length - 1 ? 'Finish' : 'Next';
  }

  nextBtn.addEventListener('click', async () => {
    const sel = document.querySelector('input[name="opt"]:checked');
    if (!sel) { alert('Please select 1–5'); return; }
    answers[QUESTIONS[current].id] = Number(sel.value);

    if (current < QUESTIONS.length - 1) {
      current++;
      renderQuestion();
    } else {
      // Compute buckets (here just summing into one profile object)
      const profile = Object.assign({}, answers);
      quizEl.style.display = 'none';
      nextBtn.style.display = 'none';
      resultsEl.innerHTML = '<p>Generating your career report…</p>';

      // Ask your serverless function
      try {
        const resp = await fetch('/.netlify/functions/generate-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile })
        });
        const data = await resp.json();
        displayResults(data);
      } catch (e) {
        resultsEl.innerHTML = '<p style="color:red">Oops, something went wrong.</p>';
        console.error(e);
      }
    }
  });

  function displayResults(careers) {
    resultsEl.innerHTML = '<h3>Your Suggested Careers</h3>';
    careers.forEach(c => {
      const div = document.createElement('div');
      div.className = 'career';
      div.innerHTML = `
        <h4>${c.title}</h4>
        <p><em>Why it fits you:</em> ${c.why}</p>
        <p><strong>Top skills:</strong> ${c.skills.join(', ')}</p>
      `;
      resultsEl.appendChild(div);
    });
  }

  // Kick things off
  renderQuestion();
})();
