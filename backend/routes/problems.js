const express = require('express');
const router = express.Router();
const Problem = require('../models/Problem');
const Progress = require('../models/Progress');
const auth = require('../middleware/auth');

// @route   GET api/problems
// @desc    Get all problems (with filters)
// @access  Private
router.get('/', auth, async (req, res) => {
  const { pattern, difficulty, platform, search, company } = req.query;
  const filter = {};

  if (pattern) filter.pattern = pattern;
  if (difficulty) filter.difficulty = difficulty;
  if (platform) filter.platform = platform;
  if (search) {
    filter.title = { $regex: search, $options: 'i' };
  }
  if (company) {
    filter.tags = company.toLowerCase();
  }

  try {
    const problems = await Problem.find(filter);
    
    // Get user progress to mark solved problems
    const solvedProgress = await Progress.find({ userId: req.user.id, status: 'solved' });
    const solvedIds = new Set(solvedProgress.map(p => p.problemId.toString()));

    const problemsWithStatus = problems.map(problem => ({
      ...problem.toObject(),
      isSolved: solvedIds.has(problem._id.toString())
    }));

    res.json(problemsWithStatus);
  } catch (error) {
    console.error('Fetch problems error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/problems/recommendations
// @desc    Get personalized problem recommendations
// @access  Private
router.get('/recommendations', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = req.user;

    // 1. Get all solved problem IDs
    const progress = await Progress.find({ userId, status: 'solved' });
    const solvedProblemIds = progress.map(p => p.problemId);

    // 2. Identify weak patterns (mastery < 40 or lowest mastery)
    const patternMastery = Object.fromEntries(user.patternMastery || new Map());
    
    // Find patterns sorted by mastery score (ascending)
    const sortedPatterns = Object.entries(patternMastery)
      .sort((a, b) => a[1] - b[1]) // lower mastery first
      .map(entry => entry[0]);

    // If no pattern mastery is recorded, initialize with first few patterns
    const preferredPatterns = sortedPatterns.length > 0 ? sortedPatterns.slice(0, 5) : ['Arrays', 'Strings', 'Two Pointers'];

    // 3. Formulate query
    const filter = {
      _id: { $nin: solvedProblemIds } // Avoid solved problems
    };

    // Prioritize companies if set
    if (user.selectedCompanies && user.selectedCompanies.length > 0) {
      filter.tags = { $in: user.selectedCompanies.map(c => c.toLowerCase()) };
    }

    // Try finding unsolved problems in preferred patterns first
    let recommendations = await Problem.find({
      ...filter,
      pattern: { $in: preferredPatterns }
    }).limit(4);

    // If we don't have enough, fill with any unsolved problems
    if (recommendations.length < 4) {
      const remainingLimit = 4 - recommendations.length;
      const recIds = recommendations.map(r => r._id);
      
      const extraProblems = await Problem.find({
        ...filter,
        _id: { $nin: [...solvedProblemIds, ...recIds] }
      }).limit(remainingLimit);

      recommendations = [...recommendations, ...extraProblems];
    }

    // If we STILL don't have enough problems (e.g. database has few problems), get any problems
    if (recommendations.length === 0) {
      recommendations = await Problem.find({}).limit(4);
    }

    res.json(recommendations);
  } catch (error) {
    console.error('Recommendations error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/problems/generate-ai-bulk
// @desc    Bulk generate problems for all patterns using Groq AI
// @access  Private
router.post('/generate-ai-bulk', auth, async (req, res) => {
  const apiKey = process.env.GROQ_API_KEY;
  const isMockKey = !apiKey || apiKey === 'YOUR_GROQ_API_KEY_HERE' || apiKey.startsWith('gsk_mock');

  if (isMockKey) {
    // Generate a set of mock problems for all patterns
    const patterns = [
      "Arrays", "Strings", "Hashing", "Prefix Sum", "Two Pointers",
      "Sliding Window", "Binary Search", "Linked List", "Stack", "Queue",
      "Heap / Priority Queue", "Trees", "Binary Search Trees", "Trie",
      "Greedy", "Backtracking", "Dynamic Programming", "Graphs",
      "Union Find", "Bit Manipulation"
    ];
    
    const mockProblems = [];
    for (const pattern of patterns) {
      mockProblems.push({
        title: `Standard Mock Problem for ${pattern}`,
        platform: 'LeetCode',
        difficulty: 'Medium',
        pattern,
        url: 'https://leetcode.com/',
        tags: [pattern.toLowerCase(), 'mock'],
        estimatedSolveTime: 25
      });
    }

    try {
      const inserted = await Problem.insertMany(mockProblems);
      return res.json({ message: 'Bulk mock problems seeded successfully', count: inserted.length });
    } catch (err) {
      console.error('Bulk mock seeding error:', err.message);
      return res.status(500).json({ message: 'Failed to bulk seed mock problems' });
    }
  }

  // Real Groq API Bulk Generation
  const patterns = [
    "Arrays", "Strings", "Hashing", "Prefix Sum", "Two Pointers",
    "Sliding Window", "Binary Search", "Linked List", "Stack", "Queue",
    "Heap / Priority Queue", "Trees", "Binary Search Trees", "Trie",
    "Greedy", "Backtracking", "Dynamic Programming", "Graphs",
    "Union Find", "Bit Manipulation"
  ];

  try {
    // We will generate problems for all 20 patterns in 5 parallel batches to make it extremely fast!
    const batchSize = 4;
    const promises = [];

    for (let i = 0; i < patterns.length; i += batchSize) {
      const batch = patterns.slice(i, i + batchSize);
      
      const systemPrompt = `You are a DSA problem database generator. Generate exactly 4 popular standard programming problems for each of the following patterns: ${batch.join(', ')}.
The problems MUST be from the platforms: LeetCode, CodeChef, or HackerRank (ensure a mix of these sources).
Return a JSON object with a single key "problems" containing a list of objects.
JSON Schema:
{
  "problems": [
    {
      "title": "Problem Title",
      "platform": "LeetCode" | "CodeChef" | "HackerRank",
      "difficulty": "Easy" | "Medium" | "Hard",
      "pattern": "Exact Pattern Name from the requested list",
      "url": "https://...",
      "tags": ["tag1", "tag2"],
      "estimatedSolveTime": 25
    }
  ]
}
Return ONLY valid JSON. No other text.`;

      const promise = fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Generate problems for patterns: ${batch.join(', ')}` }
          ],
          temperature: 0.7,
          response_format: { type: 'json_object' }
        })
      }).then(async (response) => {
        if (!response.ok) throw new Error(`Groq status ${response.status}`);
        const data = await response.json();
        const parsed = JSON.parse(data.choices[0].message.content);
        return parsed.problems || [];
      });

      promises.push(promise);
    }

    const results = await Promise.all(promises);
    const allGenerated = results.flat();

    // Filter duplicates
    const existingTitles = new Set(
      (await Problem.find({}).select('title')).map(p => p.title.toLowerCase())
    );

    const newProblems = allGenerated.filter(p => p.title && !existingTitles.has(p.title.toLowerCase()));

    if (newProblems.length > 0) {
      // Normalize platform enum values
      newProblems.forEach(p => {
        if (!p.platform || !['LeetCode', 'CodeChef', 'HackerRank'].includes(p.platform)) {
          const platLower = String(p.platform || '').toLowerCase();
          if (platLower.includes('codechef')) {
            p.platform = 'CodeChef';
          } else if (platLower.includes('hackerrank')) {
            p.platform = 'HackerRank';
          } else {
            p.platform = 'LeetCode';
          }
        }
      });
      const inserted = await Problem.insertMany(newProblems);
      return res.json({ message: `Successfully seeded ${inserted.length} new AI-generated problems!`, count: inserted.length });
    } else {
      return res.json({ message: 'No new unique problems generated to insert', count: 0 });
    }
  } catch (error) {
    console.error('Bulk generation error:', error.message);
    res.status(500).json({ message: 'Failed bulk generation with AI' });
  }
});

// @route   POST api/problems/generate-ai
// @desc    Generate new problems for a specific pattern using Groq AI
// @access  Private
router.post('/generate-ai', auth, async (req, res) => {
  const { pattern } = req.body;
  if (!pattern) {
    return res.status(400).json({ message: 'Pattern name is required' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  const isMockKey = !apiKey || apiKey === 'YOUR_GROQ_API_KEY_HERE' || apiKey.startsWith('gsk_mock');

  if (isMockKey) {
    // Generate mock problems if offline / fallback mode
    const mockProblems = [
      {
        title: `Dynamic Mock Problem ${Math.floor(Math.random() * 100)} for ${pattern}`,
        platform: Math.random() > 0.5 ? 'LeetCode' : (Math.random() > 0.5 ? 'CodeChef' : 'HackerRank'),
        difficulty: Math.random() > 0.6 ? 'Hard' : (Math.random() > 0.3 ? 'Medium' : 'Easy'),
        pattern,
        url: 'https://leetcode.com/problemset/all/',
        tags: [pattern.toLowerCase(), 'mock'],
        estimatedSolveTime: 20
      },
      {
        title: `Advanced Mock Problem ${Math.floor(Math.random() * 100)} for ${pattern}`,
        platform: Math.random() > 0.5 ? 'CodeChef' : 'LeetCode',
        difficulty: 'Medium',
        pattern,
        url: 'https://www.codechef.com/',
        tags: [pattern.toLowerCase(), 'mock'],
        estimatedSolveTime: 30
      }
    ];

    try {
      const inserted = await Problem.insertMany(mockProblems);
      return res.json({ message: 'Mock problems generated successfully', problems: inserted });
    } catch (err) {
      console.error('Mock problem creation error:', err.message);
      return res.status(500).json({ message: 'Failed to create mock problems' });
    }
  }

  // Real Groq API Call
  const systemPrompt = `You are a DSA problem database generator. Generate exactly 4 popular standard coding problems for the DSA pattern: "${pattern}".
The problems MUST be from the platforms: LeetCode, CodeChef, or HackerRank (ensure a mix of these sources).
Return a JSON object with a single key "problems" containing a list of objects.
JSON Schema:
{
  "problems": [
    {
      "title": "Problem Title",
      "platform": "LeetCode" | "CodeChef" | "HackerRank",
      "difficulty": "Easy" | "Medium" | "Hard",
      "pattern": "${pattern}",
      "url": "https://...",
      "tags": ["tag1", "tag2"],
      "estimatedSolveTime": 25
    }
  ]
}
Return ONLY valid JSON. No other text.`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Generate problems for pattern: ${pattern}` }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      throw new Error(`Groq returned status ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const parsed = JSON.parse(content);

    if (parsed && Array.isArray(parsed.problems)) {
      // Filter out duplicate titles
      const existingTitles = new Set(
        (await Problem.find({ pattern }).select('title')).map(p => p.title.toLowerCase())
      );
      
      const newProblems = parsed.problems.filter(p => !existingTitles.has(p.title.toLowerCase()));

      if (newProblems.length > 0) {
        // Normalize platform enum values
        newProblems.forEach(p => {
          if (!p.platform || !['LeetCode', 'CodeChef', 'HackerRank'].includes(p.platform)) {
            const platLower = String(p.platform || '').toLowerCase();
            if (platLower.includes('codechef')) {
              p.platform = 'CodeChef';
            } else if (platLower.includes('hackerrank')) {
              p.platform = 'HackerRank';
            } else {
              p.platform = 'LeetCode';
            }
          }
        });
        const inserted = await Problem.insertMany(newProblems);
        return res.json({ message: `Successfully generated ${inserted.length} new problems`, problems: inserted });
      } else {
        return res.json({ message: 'No new unique problems found to insert', problems: [] });
      }
    } else {
      throw new Error('Invalid response structure from AI model');
    }
  } catch (error) {
    console.error('AI problem generation error:', error.message);
    res.status(500).json({ message: 'Failed to generate problems with AI' });
  }
});

// @route   POST api/problems/generate-company-ai
// @desc    Generate new problems for a specific company using Groq AI
// @access  Private
router.post('/generate-company-ai', auth, async (req, res) => {
  const { company } = req.body;
  if (!company) {
    return res.status(400).json({ message: 'Company name is required' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  const isMockKey = !apiKey || apiKey === 'YOUR_GROQ_API_KEY_HERE' || apiKey.startsWith('gsk_mock');

  if (isMockKey) {
    // Return mock company problems based on company name
    const companyLower = company.toLowerCase();
    let mockProblems = [];

    if (companyLower === 'netflix') {
      mockProblems = [
        {
          title: "Group Anagrams (Netflix Edition)",
          platform: "LeetCode",
          difficulty: "Medium",
          pattern: "Hashing",
          url: "https://leetcode.com/problems/group-anagrams/",
          tags: ["netflix", "hashing"],
          estimatedSolveTime: 25
        },
        {
          title: "Merge k Sorted Lists (Netflix Edition)",
          platform: "LeetCode",
          difficulty: "Hard",
          pattern: "Heap / Priority Queue",
          url: "https://leetcode.com/problems/merge-k-sorted-lists/",
          tags: ["netflix", "heap"],
          estimatedSolveTime: 40
        },
        {
          title: "Task Scheduler (Netflix Edition)",
          platform: "LeetCode",
          difficulty: "Medium",
          pattern: "Greedy",
          url: "https://leetcode.com/problems/task-scheduler/",
          tags: ["netflix", "greedy"],
          estimatedSolveTime: 30
        },
        {
          title: "Longest Sliding Window Subarray (Netflix Edition)",
          platform: "LeetCode",
          difficulty: "Medium",
          pattern: "Sliding Window",
          url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
          tags: ["netflix", "sliding-window"],
          estimatedSolveTime: 25
        }
      ];
    } else if (companyLower === 'apple') {
      mockProblems = [
        {
          title: "Two Sum (Apple Edition)",
          platform: "LeetCode",
          difficulty: "Easy",
          pattern: "Arrays",
          url: "https://leetcode.com/problems/two-sum/",
          tags: ["apple", "arrays"],
          estimatedSolveTime: 15
        },
        {
          title: "Valid Parentheses (Apple Edition)",
          platform: "LeetCode",
          difficulty: "Easy",
          pattern: "Stack",
          url: "https://leetcode.com/problems/valid-parentheses/",
          tags: ["apple", "stack"],
          estimatedSolveTime: 15
        },
        {
          title: "Course Schedule (Apple Edition)",
          platform: "LeetCode",
          difficulty: "Medium",
          pattern: "Graphs",
          url: "https://leetcode.com/problems/course-schedule/",
          tags: ["apple", "graphs"],
          estimatedSolveTime: 35
        },
        {
          title: "Edit Distance (Apple Edition)",
          platform: "LeetCode",
          difficulty: "Hard",
          pattern: "Dynamic Programming",
          url: "https://leetcode.com/problems/edit-distance/",
          tags: ["apple", "dynamic programming"],
          estimatedSolveTime: 40
        }
      ];
    } else {
      mockProblems = [
        {
          title: `${company} Target Practice 1`,
          platform: "LeetCode",
          difficulty: "Easy",
          pattern: "Arrays",
          url: "https://leetcode.com/problemset/all/",
          tags: [companyLower, "arrays"],
          estimatedSolveTime: 15
        },
        {
          title: `${company} Target Practice 2`,
          platform: "LeetCode",
          difficulty: "Medium",
          pattern: "Two Pointers",
          url: "https://leetcode.com/problemset/all/",
          tags: [companyLower, "two-pointers"],
          estimatedSolveTime: 25
        },
        {
          title: `${company} Target Practice 3`,
          platform: "LeetCode",
          difficulty: "Medium",
          pattern: "Trees",
          url: "https://leetcode.com/problemset/all/",
          tags: [companyLower, "trees"],
          estimatedSolveTime: 30
        },
        {
          title: `${company} Target Practice 4`,
          platform: "LeetCode",
          difficulty: "Hard",
          pattern: "Graphs",
          url: "https://leetcode.com/problemset/all/",
          tags: [companyLower, "graphs"],
          estimatedSolveTime: 45
        }
      ];
    }

    try {
      // Filter out duplicate titles
      const existingTitles = new Set(
        (await Problem.find({}).select('title')).map(p => p.title.toLowerCase())
      );
      
      const newProblems = mockProblems.filter(p => !existingTitles.has(p.title.toLowerCase()));

      if (newProblems.length > 0) {
        const inserted = await Problem.insertMany(newProblems);
        return res.json({ message: `Successfully generated ${inserted.length} mock problems for ${company}`, problems: inserted });
      } else {
        return res.json({ message: `Problems for ${company} are already loaded.`, problems: [] });
      }
    } catch (err) {
      console.error('Mock problem creation error:', err.message);
      return res.status(500).json({ message: 'Failed to create mock problems' });
    }
  }

  // Real Groq API completions call
  const systemPrompt = `You are a DSA problem database generator. Generate exactly 4 popular standard coding problems commonly asked in technical interviews at the company: "${company}".
The problems MUST be from the platforms: LeetCode, CodeChef, or HackerRank (ensure a mix of these sources).
Return a JSON object with a single key "problems" containing a list of objects.
JSON Schema:
{
  "problems": [
    {
      "title": "Problem Title",
      "platform": "LeetCode" | "CodeChef" | "HackerRank",
      "difficulty": "Easy" | "Medium" | "Hard",
      "pattern": "Exact Pattern Name (must match a standard category like: Arrays, Strings, Hashing, Prefix Sum, Two Pointers, Sliding Window, Binary Search, Linked List, Stack, Queue, Heap / Priority Queue, Trees, Binary Search Trees, Trie, Greedy, Backtracking, Dynamic Programming, Graphs, Union Find, Bit Manipulation)",
      "url": "https://...",
      "tags": ["${company.toLowerCase()}"],
      "estimatedSolveTime": 25
    }
  ]
}
Return ONLY valid JSON. No other text.`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Generate problems for company: ${company}` }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      throw new Error(`Groq returned status ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const parsed = JSON.parse(content);

    if (parsed && Array.isArray(parsed.problems)) {
      // Normalize platform enum values and tags
      parsed.problems.forEach(p => {
        if (!p.platform || !['LeetCode', 'CodeChef', 'HackerRank'].includes(p.platform)) {
          const platLower = String(p.platform || '').toLowerCase();
          if (platLower.includes('codechef')) {
            p.platform = 'CodeChef';
          } else if (platLower.includes('hackerrank')) {
            p.platform = 'HackerRank';
          } else {
            p.platform = 'LeetCode';
          }
        }
        if (!p.tags) p.tags = [];
        if (!p.tags.some(t => t.toLowerCase() === company.toLowerCase())) {
          p.tags.push(company.toLowerCase());
        }
      });

      // Filter out duplicate titles
      const existingTitles = new Set(
        (await Problem.find({}).select('title')).map(p => p.title.toLowerCase())
      );
      
      const newProblems = parsed.problems.filter(p => !existingTitles.has(p.title.toLowerCase()));

      if (newProblems.length > 0) {
        const inserted = await Problem.insertMany(newProblems);
        return res.json({ message: `Successfully generated ${inserted.length} new problems for ${company}`, problems: inserted });
      } else {
        return res.json({ message: `Problems generated, but all were duplicates. No new problems inserted.`, problems: [] });
      }
    } else {
      throw new Error('Invalid response structure from AI model');
    }
  } catch (error) {
    console.error('AI company problem generation error:', error.message);
    res.status(500).json({ message: 'Failed to generate problems with AI' });
  }
});

module.exports = router;
