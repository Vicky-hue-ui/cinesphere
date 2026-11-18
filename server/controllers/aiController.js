// AI Controller for CineSphere
// Provides:
//  1. CineChat - conversational movie recommendation assistant (Gemini 2.5 Flash)
//  2. Review Synthesizer - Pros, Cons, Verdict + Spoiler-Safe Plot (Gemini 2.5 Flash)

const { GoogleGenAI } = require('@google/genai');

// Lazy-init the client so the server boots fine even if the key is set later
let genaiClient = null;
const getGenAIClient = () => {
  if (!genaiClient) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }
    genaiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return genaiClient;
};

const MODEL = 'gemini-2.5-flash';

// Fallback knowledge base used when Gemini is unavailable
const genreRecommendations = {
  action: [
    { title: 'John Wick: Chapter 4', reason: 'Hyper-kinetic choreography, peak neon noir cinematography.' },
    { title: 'Mad Max: Fury Road', reason: 'A relentless high-octane masterclass in practical action.' },
    { title: 'Top Gun: Maverick', reason: 'Jaw-dropping cockpit aerial sequences and emotional tension.' },
    { title: 'The Dark Knight', reason: 'Legendary clash of ideologies with Heath Ledger\'s iconic Joker.' },
  ],
  scifi: [
    { title: 'Interstellar', reason: 'Cosmic scope, mind-bending relativity, Hans Zimmer\'s pipe-organ score.' },
    { title: 'Blade Runner 2049', reason: 'Visually transcendent cyberpunk atmosphere and deep philosophy.' },
    { title: 'Dune: Part Two', reason: 'Massive desert warfare and breathtaking audiovisual direction.' },
    { title: 'Arrival', reason: 'Profound examination of language, determinism, and human connection.' },
  ],
  horror: [
    { title: 'Hereditary', reason: 'Suffocating dread, generational grief, unforgettable psychological horror.' },
    { title: 'The Conjuring', reason: 'Masterful tension building, classic haunted house scares.' },
    { title: 'Talk to Me', reason: 'Modern supernatural thrill with chilling practical effects.' },
    { title: 'Get Out', reason: 'Sharp social commentary laced with razor-sharp suspense.' },
  ],
  romance: [
    { title: 'La La Land', reason: 'Bittersweet homage to classic musicals with electric chemistry.' },
    { title: 'Before Sunrise', reason: 'Intimate walk-and-talk romance centered on honest conversation.' },
    { title: 'Past Lives', reason: 'Delicate heartbreaking meditation on destiny and paths not taken.' },
    { title: 'About Time', reason: 'Warm poignant story about savoring ordinary moments.' },
  ],
  comedy: [
    { title: 'The Grand Budapest Hotel', reason: 'Wes Anderson\'s delightfully eccentric wit and impeccable timing.' },
    { title: 'Knives Out', reason: 'Whodunit mystery with witty banter and standout performances.' },
    { title: 'Superbad', reason: 'Unfiltered laugh-out-loud coming-of-age comedy with enduring heart.' },
  ],
  thriller: [
    { title: 'Prisoners', reason: 'Morally complex pitch-black mystery with electrifying tension.' },
    { title: 'Shutter Island', reason: 'Haunting psychological atmosphere and legendary twist.' },
    { title: 'Parasite', reason: 'Brilliantly calibrated dark comedy turned shocking class-struggle thriller.' },
  ],
};

const detectGenre = (text) => {
  const lower = text.toLowerCase();
  if (lower.match(/sci.?fi|space|future|time.travel|alien|robot|dystop/)) return 'scifi';
  if (lower.match(/scar|horror|spook|ghost|creep|haunt/)) return 'horror';
  if (lower.match(/love|romance|romantic|couple|date night|heartfelt/)) return 'romance';
  if (lower.match(/funny|laugh|comedy|humor|witty/)) return 'comedy';
  if (lower.match(/mystery|thriller|crime|suspense|twist|whodunit/)) return 'thriller';
  if (lower.match(/action|fight|hero|war|explosion|stunt/)) return 'action';
  const genres = Object.keys(genreRecommendations);
  return genres[Math.floor(Math.random() * genres.length)];
};

const buildFallbackReply = (message) => {
  const genre = detectGenre(message);
  const recs = genreRecommendations[genre];
  return {
    reply:
      `Here are CineSphere's top curated recommendations:\n\n` +
      recs.map((r, i) => `${i + 1}. **${r.title}** — ${r.reason}`).join('\n\n') +
      `\n\n💡 *Click on Search or type any title above to view trailer, reviews, and score breakdown!*`,
    genre,
    recommendations: recs.map((r) => r.title),
  };
};

// ─── CineChat AI Assistant ─────────────────────────────────────────────────────
// @route  POST /api/ai/chat
// @access Public
const cineChat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ message: 'A prompt message is required' });
    }

    // Try Gemini first
    try {
      const ai = getGenAIClient();

      // Build conversation context
      const conversationContext = history
        .slice(-6) // keep last 6 turns to stay within context limits
        .map((m) => `${m.sender === 'user' ? 'User' : 'CineChat'}: ${m.text}`)
        .join('\n');

      const systemPrompt = `You are CineChat, an expert AI film consultant for CineSphere — a modern cinematic discovery platform.
Your personality: enthusiastic, knowledgeable, witty, and deeply passionate about cinema.
Your role: provide personalized, conversational movie recommendations with specific, insightful reasons for each pick.

Guidelines:
- Always recommend 3–5 specific movies with compelling, unique reasons (not generic descriptions)
- Match mood, tone, and subgenre accurately (e.g., "cozy thriller" ≠ "gory horror")
- Include a mix of acclaimed hits, hidden gems, and sometimes international films
- Keep responses concise yet engaging — no more than 300 words
- Format movie titles in **bold**
- End with a friendly tip encouraging the user to explore further on CineSphere
- If the user asks follow-up questions, engage naturally in conversation`;

      const userMessage = conversationContext
        ? `Previous conversation:\n${conversationContext}\n\nUser now asks: ${message.trim()}`
        : message.trim();

      const response = await ai.models.generateContent({
        model: MODEL,
        contents: userMessage,
        config: {
          systemInstruction: systemPrompt,
          maxOutputTokens: 600,
          temperature: 0.8,
        },
      });

      const reply = response.text || '';

      // Extract movie titles from response for quick-search links
      const titleMatches = reply.match(/\*\*([^*]+)\*\*/g) || [];
      const recommendations = titleMatches
        .map((t) => t.replace(/\*\*/g, '').trim())
        .filter((t) => t.length > 2 && t.length < 80)
        .slice(0, 5);

      return res.json({ reply, recommendations, genre: detectGenre(message) });
    } catch (geminiError) {
      console.warn('Gemini API unavailable, using fallback:', geminiError.message);
      // Fall back to curated recommendations
      const fallback = buildFallbackReply(message);
      return res.json(fallback);
    }
  } catch (error) {
    console.error('CineChat critical error:', error);
    res.status(500).json({ message: 'CineChat processing failed. Please try again.' });
  }
};

// ─── Review Synthesizer & Spoiler-Safe Plot Architect ─────────────────────────
// @route  POST /api/ai/synthesize
// @access Public
const synthesizeReviews = async (req, res) => {
  try {
    const { movieId, movieTitle, overview, userReviews = [] } = req.body;

    if (!movieTitle || typeof movieTitle !== 'string') {
      return res.status(400).json({ message: 'Movie title is required' });
    }

    const reviewTexts = userReviews
      .map((r) => r.comment || '')
      .filter(Boolean)
      .join('\n- ');

    const hasUserReviews = reviewTexts.length > 20;

    // Try Gemini
    try {
      const ai = getGenAIClient();

      // ── 1. Pros / Cons / Verdict ──────────────────────────────────────────
      const synthesisPrompt = `You are a professional film critic AI for CineSphere.

Movie: "${movieTitle}"
TMDB Overview: ${overview || 'No overview available.'}
${hasUserReviews ? `Community Reviews:\n- ${reviewTexts}` : '(No community reviews yet — base analysis on TMDB data and general film knowledge.)'}

Analyze this movie and return a JSON object with EXACTLY this structure:
{
  "pros": ["point 1", "point 2", "point 3"],
  "cons": ["point 1", "point 2"],
  "verdict": "One compelling sentence summarizing whether audiences should watch it."
}

Rules:
- pros: 3 specific, insightful positive aspects (cinematography, acting, score, pacing, themes, etc.)
- cons: 2 honest constructive criticisms (pacing issues, underdeveloped characters, etc.)
- verdict: 1 authoritative sentence that captures the film's essence and audience fit
- Keep each point under 15 words
- Return ONLY valid JSON, no markdown fences`;

      const synthesisResponse = await ai.models.generateContent({
        model: MODEL,
        contents: synthesisPrompt,
        config: { maxOutputTokens: 400, temperature: 0.6 },
      });

      let pros = [], cons = [], verdict = '';
      try {
        const rawText = synthesisResponse.text || '';
        // Strip markdown fences if present
        const jsonText = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(jsonText);
        pros = parsed.pros || [];
        cons = parsed.cons || [];
        verdict = parsed.verdict || '';
      } catch {
        // Parse failure — use safe defaults
        pros = [
          `Visually compelling direction and world-building in "${movieTitle}".`,
          'Standout lead performances anchoring the emotional core.',
          'Atmospheric score and sound design elevating tension.',
        ];
        cons = [
          'Second-act pacing occasionally loses momentum.',
          'Some supporting characters feel underdeveloped.',
        ];
        verdict = `"${movieTitle}" is a worthwhile cinematic experience that rewards patient viewers.`;
      }

      // ── 2. Spoiler Arc ────────────────────────────────────────────────────
      const spoilerPrompt = `You are a film story analyst for CineSphere.

Movie: "${movieTitle}"
Overview: ${overview || 'No overview provided.'}

Write a 3-act spoiler narrative arc (DO include plot twists and the ending). Format it as:
**Act I (Catalyst):** [2-3 sentences]

**Act II (Escalation & Turning Point):** [2-3 sentences]

**Act III (Climax & Resolution):** [2-3 sentences — reveal the ending]

Keep each act concise (under 60 words). Be specific to this film's actual story.`;

      const spoilerResponse = await ai.models.generateContent({
        model: MODEL,
        contents: spoilerPrompt,
        config: { maxOutputTokens: 400, temperature: 0.7 },
      });

      const spoilerArc =
        '⚠️ SPOILER WARNING — FULL NARRATIVE ARC:\n\n' +
        (spoilerResponse.text || generateFallbackArc(movieTitle, overview));

      // ── 3. Non-Spoiler Setup ──────────────────────────────────────────────
      const setupNonSpoiler =
        overview && overview.length > 40
          ? overview
          : `The narrative follows a protagonist thrust into an escalating crisis where loyalties are tested and secrets unravel — with stakes that threaten everything they hold dear.`;

      return res.json({
        movieTitle,
        pros,
        cons,
        verdict,
        setupNonSpoiler,
        spoilerArc,
      });
    } catch (geminiError) {
      console.warn('Gemini synthesis unavailable, using fallback:', geminiError.message);
      // Return well-crafted static fallback
      return res.json(buildFallbackSynthesis(movieTitle, overview, hasUserReviews));
    }
  } catch (error) {
    console.error('Synthesizer critical error:', error);
    res.status(500).json({ message: 'Synthesis failed. Please try again.' });
  }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const generateFallbackArc = (title, overview) => {
  const setup = overview ? overview.slice(0, 120) : 'The story begins with an unexpected catalyst';
  return (
    `**Act I (Catalyst):** ${setup}... The central character triggers an unexpected chain of events.\n\n` +
    `**Act II (Escalation & Turning Point):** Alliances fracture as a trusted ally is revealed to be manipulating events. The protagonist suffers a devastating defeat and is forced to regroup.\n\n` +
    `**Act III (Climax & Resolution):** Armed with the truth, the protagonist orchestrates a final confrontation. Sacrifices are made, resolving the conflict in a bittersweet conclusion that permanently transforms the world of "${title}".`
  );
};

const buildFallbackSynthesis = (movieTitle, overview, hasReviews) => ({
  movieTitle,
  pros: [
    `Visually stunning craft with standout direction in "${movieTitle}".`,
    'Compelling lead performances anchoring the emotional stakes.',
    'Engaging cinematic score amplifying atmospheric tension.',
  ],
  cons: [
    'Second-act pacing can drag during dialogue-heavy transitions.',
    'Some secondary characters feel underwritten vs. the antagonist.',
  ],
  verdict: hasReviews
    ? `Audiences applaud "${movieTitle}" for bold creative ambition — an essential watch for genre fans.`
    : `"${movieTitle}" delivers an immersive experience warranting a high-fidelity home theater viewing.`,
  setupNonSpoiler:
    overview && overview.length > 40
      ? overview
      : 'The narrative establishes a protagonist thrust into crisis where loyalties are tested.',
  spoilerArc: generateFallbackArc(movieTitle, overview),
});

module.exports = { cineChat, synthesizeReviews };
