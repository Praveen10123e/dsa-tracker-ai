const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Problem = require('../models/Problem');

dotenv.config();

const problems = [
  // Arrays
  {
    title: "Two Sum",
    platform: "LeetCode",
    difficulty: "Easy",
    pattern: "Arrays",
    url: "https://leetcode.com/problems/two-sum/",
    tags: ["array", "hash-map"],
    estimatedSolveTime: 15
  },
  {
    title: "Contains Duplicate",
    platform: "LeetCode",
    difficulty: "Easy",
    pattern: "Arrays",
    url: "https://leetcode.com/problems/contains-duplicate/",
    tags: ["array", "hash-set"],
    estimatedSolveTime: 10
  },
  {
    title: "Maximum Subarray (Kadane's)",
    platform: "LeetCode",
    difficulty: "Medium",
    pattern: "Arrays",
    url: "https://leetcode.com/problems/maximum-subarray/",
    tags: ["array", "dynamic-programming"],
    estimatedSolveTime: 25
  },

  // Strings
  {
    title: "Valid Anagram",
    platform: "LeetCode",
    difficulty: "Easy",
    pattern: "Strings",
    url: "https://leetcode.com/problems/valid-anagram/",
    tags: ["string", "sorting", "hash-map"],
    estimatedSolveTime: 10
  },
  {
    title: "Valid Palindrome",
    platform: "LeetCode",
    difficulty: "Easy",
    pattern: "Strings",
    url: "https://leetcode.com/problems/valid-palindrome/",
    tags: ["string", "two-pointers"],
    estimatedSolveTime: 12
  },
  {
    title: "Longest Common Prefix",
    platform: "LeetCode",
    difficulty: "Easy",
    pattern: "Strings",
    url: "https://leetcode.com/problems/longest-common-prefix/",
    tags: ["string"],
    estimatedSolveTime: 15
  },

  // Hashing
  {
    title: "Group Anagrams",
    platform: "LeetCode",
    difficulty: "Medium",
    pattern: "Hashing",
    url: "https://leetcode.com/problems/group-anagrams/",
    tags: ["hash-table", "string", "sorting"],
    estimatedSolveTime: 30
  },
  {
    title: "Top K Frequent Elements",
    platform: "LeetCode",
    difficulty: "Medium",
    pattern: "Hashing",
    url: "https://leetcode.com/problems/top-k-frequent-elements/",
    tags: ["hash-table", "heap", "bucket-sort"],
    estimatedSolveTime: 25
  },

  // Prefix Sum
  {
    title: "Subarray Sum Equals K",
    platform: "LeetCode",
    difficulty: "Medium",
    pattern: "Prefix Sum",
    url: "https://leetcode.com/problems/subarray-sum-equals-k/",
    tags: ["array", "prefix-sum", "hash-map"],
    estimatedSolveTime: 30
  },
  {
    title: "Range Sum Query - Immutable",
    platform: "LeetCode",
    difficulty: "Easy",
    pattern: "Prefix Sum",
    url: "https://leetcode.com/problems/range-sum-query-immutable/",
    tags: ["array", "design", "prefix-sum"],
    estimatedSolveTime: 15
  },

  // Two Pointers
  {
    title: "Two Sum II - Input Array Is Sorted",
    platform: "LeetCode",
    difficulty: "Medium",
    pattern: "Two Pointers",
    url: "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/",
    tags: ["array", "two-pointers", "binary-search"],
    estimatedSolveTime: 15
  },
  {
    title: "3Sum",
    platform: "LeetCode",
    difficulty: "Medium",
    pattern: "Two Pointers",
    url: "https://leetcode.com/problems/3sum/",
    tags: ["array", "two-pointers", "sorting"],
    estimatedSolveTime: 35
  },
  {
    title: "Container With Most Water",
    platform: "LeetCode",
    difficulty: "Medium",
    pattern: "Two Pointers",
    url: "https://leetcode.com/problems/container-with-most-water/",
    tags: ["array", "two-pointers", "greedy"],
    estimatedSolveTime: 25
  },

  // Sliding Window
  {
    title: "Longest Substring Without Repeating Characters",
    platform: "LeetCode",
    difficulty: "Medium",
    pattern: "Sliding Window",
    url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
    tags: ["string", "hash-table", "sliding-window"],
    estimatedSolveTime: 30
  },
  {
    title: "Minimum Size Subarray Sum",
    platform: "LeetCode",
    difficulty: "Medium",
    pattern: "Sliding Window",
    url: "https://leetcode.com/problems/minimum-size-subarray-sum/",
    tags: ["array", "two-pointers", "sliding-window"],
    estimatedSolveTime: 25
  },
  {
    title: "Best Time to Buy and Sell Stock",
    platform: "LeetCode",
    difficulty: "Easy",
    pattern: "Sliding Window",
    url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
    tags: ["array", "sliding-window"],
    estimatedSolveTime: 15
  },

  // Binary Search
  {
    title: "Binary Search",
    platform: "LeetCode",
    difficulty: "Easy",
    pattern: "Binary Search",
    url: "https://leetcode.com/problems/binary-search/",
    tags: ["array", "binary-search"],
    estimatedSolveTime: 8
  },
  {
    title: "Search in Rotated Sorted Array",
    platform: "LeetCode",
    difficulty: "Hard",
    pattern: "Binary Search",
    url: "https://leetcode.com/problems/search-in-rotated-sorted-array/",
    tags: ["array", "binary-search"],
    estimatedSolveTime: 35
  },
  {
    title: "Find Minimum in Rotated Sorted Array",
    platform: "LeetCode",
    difficulty: "Medium",
    pattern: "Binary Search",
    url: "https://leetcode.com/problems/find-min-in-rotated-sorted-array/",
    tags: ["array", "binary-search"],
    estimatedSolveTime: 25
  },

  // Linked List
  {
    title: "Reverse Linked List",
    platform: "LeetCode",
    difficulty: "Easy",
    pattern: "Linked List",
    url: "https://leetcode.com/problems/reverse-linked-list/",
    tags: ["linked-list", "recursion"],
    estimatedSolveTime: 12
  },
  {
    title: "Merge Two Sorted Lists",
    platform: "LeetCode",
    difficulty: "Easy",
    pattern: "Linked List",
    url: "https://leetcode.com/problems/merge-two-sorted-lists/",
    tags: ["linked-list", "recursion"],
    estimatedSolveTime: 15
  },
  {
    title: "Linked List Cycle",
    platform: "LeetCode",
    difficulty: "Easy",
    pattern: "Linked List",
    url: "https://leetcode.com/problems/linked-list-cycle/",
    tags: ["linked-list", "two-pointers"],
    estimatedSolveTime: 15
  },
  {
    title: "Remove Nth Node From End of List",
    platform: "LeetCode",
    difficulty: "Medium",
    pattern: "Linked List",
    url: "https://leetcode.com/problems/remove-nth-node-from-end-of-list/",
    tags: ["linked-list", "two-pointers"],
    estimatedSolveTime: 25
  },

  // Stack
  {
    title: "Valid Parentheses",
    platform: "LeetCode",
    difficulty: "Easy",
    pattern: "Stack",
    url: "https://leetcode.com/problems/valid-parentheses/",
    tags: ["string", "stack"],
    estimatedSolveTime: 10
  },
  {
    title: "Min Stack",
    platform: "LeetCode",
    difficulty: "Medium",
    pattern: "Stack",
    url: "https://leetcode.com/problems/min-stack/",
    tags: ["stack", "design"],
    estimatedSolveTime: 20
  },
  {
    title: "Evaluate Reverse Polish Notation",
    platform: "LeetCode",
    difficulty: "Medium",
    pattern: "Stack",
    url: "https://leetcode.com/problems/evaluate-reverse-polish-notation/",
    tags: ["array", "math", "stack"],
    estimatedSolveTime: 25
  },

  // Queue
  {
    title: "Implement Queue using Stacks",
    platform: "LeetCode",
    difficulty: "Easy",
    pattern: "Queue",
    url: "https://leetcode.com/problems/implement-queue-using-stacks/",
    tags: ["stack", "queue", "design"],
    estimatedSolveTime: 15
  },
  {
    title: "Number of Recent Calls",
    platform: "LeetCode",
    difficulty: "Easy",
    pattern: "Queue",
    url: "https://leetcode.com/problems/number-of-recent-calls/",
    tags: ["queue", "design"],
    estimatedSolveTime: 15
  },

  // Heap / Priority Queue
  {
    title: "Kth Largest Element in an Array",
    platform: "LeetCode",
    difficulty: "Medium",
    pattern: "Heap / Priority Queue",
    url: "https://leetcode.com/problems/kth-largest-element-in-an-array/",
    tags: ["array", "divide-and-conquer", "heap", "quickselect"],
    estimatedSolveTime: 25
  },
  {
    title: "Merge k Sorted Lists",
    platform: "LeetCode",
    difficulty: "Hard",
    pattern: "Heap / Priority Queue",
    url: "https://leetcode.com/problems/merge-k-sorted-lists/",
    tags: ["linked-list", "divide-and-conquer", "heap", "merge-sort"],
    estimatedSolveTime: 40
  },
  {
    title: "Find Median from Data Stream",
    platform: "LeetCode",
    difficulty: "Hard",
    pattern: "Heap / Priority Queue",
    url: "https://leetcode.com/problems/find-median-from-data-stream/",
    tags: ["two-heaps", "design", "sorting"],
    estimatedSolveTime: 45
  },

  // Trees
  {
    title: "Maximum Depth of Binary Tree",
    platform: "LeetCode",
    difficulty: "Easy",
    pattern: "Trees",
    url: "https://leetcode.com/problems/maximum-depth-of-binary-tree/",
    tags: ["tree", "depth-first-search", "binary-tree"],
    estimatedSolveTime: 10
  },
  {
    title: "Invert Binary Tree",
    platform: "LeetCode",
    difficulty: "Easy",
    pattern: "Trees",
    url: "https://leetcode.com/problems/invert-binary-tree/",
    tags: ["tree", "depth-first-search", "breadth-first-search", "binary-tree"],
    estimatedSolveTime: 8
  },
  {
    title: "Binary Tree Level Order Traversal",
    platform: "LeetCode",
    difficulty: "Medium",
    pattern: "Trees",
    url: "https://leetcode.com/problems/binary-tree-level-order-traversal/",
    tags: ["tree", "breadth-first-search", "binary-tree"],
    estimatedSolveTime: 25
  },

  // Binary Search Trees
  {
    title: "Validate Binary Search Tree",
    platform: "LeetCode",
    difficulty: "Medium",
    pattern: "Binary Search Trees",
    url: "https://leetcode.com/problems/validate-binary-search-tree/",
    tags: ["tree", "depth-first-search", "binary-search-tree", "binary-tree"],
    estimatedSolveTime: 30
  },
  {
    title: "Lowest Common Ancestor of a Binary Search Tree",
    platform: "LeetCode",
    difficulty: "Medium",
    pattern: "Binary Search Trees",
    url: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/",
    tags: ["tree", "depth-first-search", "binary-search-tree", "binary-tree"],
    estimatedSolveTime: 20
  },

  // Trie
  {
    title: "Implement Trie (Prefix Tree)",
    platform: "LeetCode",
    difficulty: "Medium",
    pattern: "Trie",
    url: "https://leetcode.com/problems/implement-trie-prefix-tree/",
    tags: ["trie", "design", "hash-table"],
    estimatedSolveTime: 30
  },
  {
    title: "Word Search II",
    platform: "LeetCode",
    difficulty: "Hard",
    pattern: "Trie",
    url: "https://leetcode.com/problems/word-search-ii/",
    tags: ["array", "string", "backtracking", "trie", "matrix"],
    estimatedSolveTime: 50
  },

  // Greedy
  {
    title: "Jump Game",
    platform: "LeetCode",
    difficulty: "Medium",
    pattern: "Greedy",
    url: "https://leetcode.com/problems/jump-game/",
    tags: ["array", "dynamic-programming", "greedy"],
    estimatedSolveTime: 25
  },
  {
    title: "Merge Intervals",
    platform: "LeetCode",
    difficulty: "Medium",
    pattern: "Greedy",
    url: "https://leetcode.com/problems/merge-intervals/",
    tags: ["array", "sorting", "greedy"],
    estimatedSolveTime: 30
  },

  // Backtracking
  {
    title: "Subsets",
    platform: "LeetCode",
    difficulty: "Medium",
    pattern: "Backtracking",
    url: "https://leetcode.com/problems/subsets/",
    tags: ["array", "backtracking", "bit-manipulation"],
    estimatedSolveTime: 25
  },
  {
    title: "Permutations",
    platform: "LeetCode",
    difficulty: "Medium",
    pattern: "Backtracking",
    url: "https://leetcode.com/problems/permutations/",
    tags: ["array", "backtracking"],
    estimatedSolveTime: 25
  },
  {
    title: "N-Queens",
    platform: "LeetCode",
    difficulty: "Hard",
    pattern: "Backtracking",
    url: "https://leetcode.com/problems/n-queens/",
    tags: ["array", "backtracking"],
    estimatedSolveTime: 50
  },

  // Dynamic Programming
  {
    title: "Climbing Stairs",
    platform: "LeetCode",
    difficulty: "Easy",
    pattern: "Dynamic Programming",
    url: "https://leetcode.com/problems/climbing-stairs/",
    tags: ["math", "dynamic-programming", "memoization"],
    estimatedSolveTime: 12
  },
  {
    title: "Coin Change",
    platform: "LeetCode",
    difficulty: "Medium",
    pattern: "Dynamic Programming",
    url: "https://leetcode.com/problems/coin-change/",
    tags: ["array", "dynamic-programming", "breadth-first-search"],
    estimatedSolveTime: 35
  },
  {
    title: "Longest Increasing Subsequence",
    platform: "LeetCode",
    difficulty: "Medium",
    pattern: "Dynamic Programming",
    url: "https://leetcode.com/problems/longest-increasing-subsequence/",
    tags: ["array", "binary-search", "dynamic-programming"],
    estimatedSolveTime: 30
  },
  {
    title: "Edit Distance",
    platform: "LeetCode",
    difficulty: "Hard",
    pattern: "Dynamic Programming",
    url: "https://leetcode.com/problems/edit-distance/",
    tags: ["string", "dynamic-programming"],
    estimatedSolveTime: 40
  },

  // Graphs
  {
    title: "Number of Islands",
    platform: "LeetCode",
    difficulty: "Medium",
    pattern: "Graphs",
    url: "https://leetcode.com/problems/number-of-islands/",
    tags: ["array", "depth-first-search", "breadth-first-search", "union-find", "matrix"],
    estimatedSolveTime: 30
  },
  {
    title: "Clone Graph",
    platform: "LeetCode",
    difficulty: "Medium",
    pattern: "Graphs",
    url: "https://leetcode.com/problems/clone-graph/",
    tags: ["hash-table", "depth-first-search", "breadth-first-search", "graph"],
    estimatedSolveTime: 30
  },
  {
    title: "Course Schedule",
    platform: "LeetCode",
    difficulty: "Medium",
    pattern: "Graphs",
    url: "https://leetcode.com/problems/course-schedule/",
    tags: ["depth-first-search", "breadth-first-search", "graph", "topological-sort"],
    estimatedSolveTime: 35
  },

  // Union Find
  {
    title: "Redundant Connection",
    platform: "LeetCode",
    difficulty: "Medium",
    pattern: "Union Find",
    url: "https://leetcode.com/problems/redundant-connection/",
    tags: ["depth-first-search", "breadth-first-search", "union-find", "graph"],
    estimatedSolveTime: 30
  },
  {
    title: "Number of Provinces",
    platform: "LeetCode",
    difficulty: "Medium",
    pattern: "Union Find",
    url: "https://leetcode.com/problems/number-of-provinces/",
    tags: ["depth-first-search", "breadth-first-search", "union-find", "graph"],
    estimatedSolveTime: 25
  },

  // Bit Manipulation
  {
    title: "Single Number",
    platform: "LeetCode",
    difficulty: "Easy",
    pattern: "Bit Manipulation",
    url: "https://leetcode.com/problems/single-number/",
    tags: ["array", "bit-manipulation"],
    estimatedSolveTime: 10
  },
  {
    title: "Number of 1 Bits",
    platform: "LeetCode",
    difficulty: "Easy",
    pattern: "Bit Manipulation",
    url: "https://leetcode.com/problems/number-of-1-bits/",
    tags: ["divide-and-conquer", "bit-manipulation"],
    estimatedSolveTime: 10
  },
  {
    title: "Counting Bits",
    platform: "LeetCode",
    difficulty: "Easy",
    pattern: "Bit Manipulation",
    url: "https://leetcode.com/problems/counting-bits/",
    tags: ["dynamic-programming", "bit-manipulation"],
    estimatedSolveTime: 15
  }
];

// Pre-fill target company maps for popular preparation lists
// We will assign company tags to some problems to help our Company Prep Module recommendation system
const companyAssociations = {
  "Google": ["Two Sum", "3Sum", "Container With Most Water", "Search in Rotated Sorted Array", "Word Search II", "Number of Islands", "Course Schedule", "Find Median from Data Stream", "Merge k Sorted Lists"],
  "Amazon": ["Two Sum", "Contains Duplicate", "Best Time to Buy and Sell Stock", "Longest Substring Without Repeating Characters", "Valid Parentheses", "Invert Binary Tree", "Binary Tree Level Order Traversal", "Merge Intervals", "Number of Islands", "Kth Largest Element in an Array"],
  "Microsoft": ["Two Sum", "Valid Palindrome", "Reverse Linked List", "Merge Two Sorted Lists", "Min Stack", "Validate Binary Search Tree", "Climbing Stairs", "Coin Change", "Clone Graph", "Number of Provinces"],
  "Meta": ["Two Sum", "3Sum", "Valid Palindrome", "Search in Rotated Sorted Array", "Remove Nth Node From End of List", "Binary Tree Level Order Traversal", "Subsets", "Merge Intervals", "Redundant Connection"],
  "Adobe": ["Two Sum", "Contains Duplicate", "Reverse Linked List", "Merge Two Sorted Lists", "Valid Parentheses", "Climbing Stairs", "Single Number", "Maximum Subarray (Kadane's)"],
  "Walmart": ["Two Sum", "Best Time to Buy and Sell Stock", "Min Stack", "Kth Largest Element in an Array", "Climbing Stairs", "Coin Change", "Merge Intervals"]
};

const isMockKey = () => {
  const key = process.env.GROQ_API_KEY;
  return !key || key === 'YOUR_GROQ_API_KEY_HERE' || key.startsWith('gsk_mock');
};

const generateProblemsFromAI = async () => {
  const patterns = [
    "Arrays", "Strings", "Hashing", "Prefix Sum", "Two Pointers",
    "Sliding Window", "Binary Search", "Linked List", "Stack", "Queue",
    "Heap / Priority Queue", "Trees", "Binary Search Trees", "Trie",
    "Greedy", "Backtracking", "Dynamic Programming", "Graphs",
    "Union Find", "Bit Manipulation"
  ];

  console.log("Generating problems from Groq API using model llama-3.3-70b-versatile...");
  const allGenerated = [];
  const batchSize = 4; // Batch patterns to keep response sizes reasonable

  for (let i = 0; i < patterns.length; i += batchSize) {
    const batch = patterns.slice(i, i + batchSize);
    console.log(`Generating problems for batch: ${batch.join(', ')}...`);

    const prompt = `Generate exactly 4 popular standard programming problems for each of the following patterns: ${batch.join(', ')}.
For each problem, choose a mix of sources from LeetCode, CodeChef, and HackerRank.
Return a JSON object with a single key "problems" containing a list of objects.
JSON Schema:
{
  "problems": [
    {
      "title": "Problem Name",
      "platform": "LeetCode" | "CodeChef" | "HackerRank",
      "difficulty": "Easy" | "Medium" | "Hard",
      "pattern": "Exact Pattern Name matching the requested pattern",
      "url": "https://...",
      "tags": ["relevant", "tags"],
      "estimatedSolveTime": 25
    }
  ]
}
Return ONLY valid JSON. No conversational text.`;

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: 'You are a JSON-only database seeder.' },
            { role: 'user', content: prompt }
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
        console.log(`Generated ${parsed.problems.length} problems for this batch.`);
        allGenerated.push(...parsed.problems);
      }
    } catch (err) {
      console.error(`Error generating batch ${batch.join(', ')}:`, err.message);
    }
  }

  return allGenerated;
};

const seedDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dsa_tracker_ai');
    console.log(`Connected to DB: ${conn.connection.host}`);
    
    // Clear existing problems
    await Problem.deleteMany({});
    console.log('Cleared existing problems.');

    let problemsToInsert = [];

    if (isMockKey()) {
      console.log('Using local static problems (Mock/Fallback Mode)...');
      problemsToInsert = problems;
    } else {
      try {
        problemsToInsert = await generateProblemsFromAI();
        if (problemsToInsert.length === 0) {
          console.log('AI generation returned empty, falling back to static problems...');
          problemsToInsert = problems;
        }
      } catch (aiErr) {
        console.error('AI generation failed, falling back to static problems:', aiErr.message);
        problemsToInsert = problems;
      }
    }

    // Apply company tags and normalize platform enum values
    problemsToInsert.forEach(p => {
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
      const compTags = [];
      for (const [company, titles] of Object.entries(companyAssociations)) {
        if (titles.includes(p.title) || p.tags.some(t => t.toLowerCase() === company.toLowerCase())) {
          compTags.push(company.toLowerCase());
        }
      }
      p.tags = [...new Set([...p.tags, ...compTags])];
    });

    // Insert new seed problems
    await Problem.insertMany(problemsToInsert);
    console.log(`Successfully seeded ${problemsToInsert.length} problems!`);

    mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding DB:', error);
    process.exit(1);
  }
};

seedDB();
