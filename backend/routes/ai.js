const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const auth = require('../middleware/auth');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

// Helper to check if API key is mock/placeholder
const isMockKey = () => {
  const key = process.env.GROQ_API_KEY;
  return !key || key === 'YOUR_GROQ_API_KEY_HERE' || key.startsWith('gsk_mock');
};

// --- MOCK RESPONSE GENERATORS FOR OFFLINE / TEST MODE ---

const getMockChatResponse = (message) => {
  const msg = message.toLowerCase();
  
  if (msg.includes('climbing stairs') || msg.includes('dynamic programming') || msg.includes('dp')) {
    return `### Dynamic Programming (DP) & Climbing Stairs

Dynamic programming is about breaking down a problem into overlapping subproblems, solving each once, and storing their solutions.

For **Climbing Stairs** (LeetCode 70):
1. **Recurrence Relation**: To reach step \`n\`, you can come from step \`n-1\` (1 step jump) or step \`n-2\` (2 steps jump). Thus:
   $$\\text{ways}(n) = \\text{ways}(n-1) + \\text{ways}(n-2)$$
2. **Base Cases**:
   - \`ways(1) = 1\`
   - \`ways(2) = 2\`
3. **Complexity**:
   - **Time Complexity**: $\\mathcal{O}(N)$ as we calculate states up to \`n\` once.
   - **Space Complexity**: $\\mathcal{O}(1)$ if we only keep track of the last two steps.

Would you like me to show you the template code or suggest a follow-up problem?`;
  }
  
  if (msg.includes('two pointers') || msg.includes('3sum') || msg.includes('container')) {
    return `### Two Pointers Pattern

The **Two Pointers** pattern involves maintaining two indices (usually left and right) that traverse a sorted array/list in coordinate directions to optimize searching from $\\mathcal{O}(N^2)$ to $\\mathcal{O}(N)$.

**Key Recognition Clues**:
* Sorted input array.
* Finding pairs or triplets matching a target sum (e.g., Two Sum II, 3Sum).
* Shifting pointers inward based on value comparison (e.g., Container With Most Water).

**Template Code**:
\`\`\`javascript
function twoSumSorted(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  while (left < right) {
    const sum = arr[left] + arr[right];
    if (sum === target) return [left, right];
    else if (sum < target) left++; // Need a larger sum
    else right--; // Need a smaller sum
  }
  return [-1, -1];
}
\`\`\`

Let me know if you want to write code for a problem or want tips on edge cases!`;
  }

  return `Hello! I am your **DSA Pattern Mentor AI**. 

I can assist you with:
1. **Teaching DSA concepts** (e.g., Sliding Window, Trees, Graphs).
2. **Reviewing code** for time and space optimizations.
3. **Analyzing problem statements** to detect the correct pattern.
4. **Providing incremental hints** for stuck problems.
5. **Simulating mock interviews** for top companies.

*Note: I am running in Fallback Mock Mode because a valid Groq API key was not detected. For full LLM intelligence, add your key to the backend \`.env\` file.*

What would you like to learn today?`;
};

const getMockPatternDetection = (statement) => {
  const text = statement.toLowerCase();
  let pattern = "Arrays";
  let difficulty = "Medium";
  let confidence = 0.65;
  let approach = "Use an array to keep track of elements and search linearly or sort first.";

  if (text.includes("subarray") && (text.includes("sum equals k") || text.includes("prefix"))) {
    pattern = "Prefix Sum";
    difficulty = "Medium";
    confidence = 0.95;
    approach = "Create a prefix sum variable and a hash map that stores (prefixSum, count). As you iterate, check if (prefixSum - target) exists in the map.";
  } else if (text.includes("longest substring") || text.includes("sliding window") || (text.includes("k distinct") || text.includes("subarray") && text.includes("length"))) {
    pattern = "Sliding Window";
    difficulty = "Medium";
    confidence = 0.90;
    approach = "Maintain a window using left and right pointers. Expand right, update character frequencies, and contract left when invalid.";
  } else if (text.includes("sorted") && (text.includes("search") || text.includes("target") || text.includes("rotated"))) {
    pattern = "Binary Search";
    difficulty = "Medium";
    confidence = 0.88;
    approach = "Divide and conquer. Perform standard binary search while checking mid. If rotated, identify which half is sorted first.";
  } else if (text.includes("parentheses") || text.includes("stack") || text.includes("push") || text.includes("pop")) {
    pattern = "Stack";
    difficulty = "Easy";
    confidence = 0.92;
    approach = "Push opening brackets onto a stack. When encountering a closing bracket, pop from the stack and verify it matches the bracket type.";
  } else if (text.includes("islands") || text.includes("graph") || text.includes("matrix") || text.includes("shortest path")) {
    pattern = "Graphs";
    difficulty = "Medium";
    confidence = 0.85;
    approach = "Model the matrix cells as graph nodes. Traversal using DFS or BFS. Mark visited cells in-place or using a set to avoid cycles.";
  } else if (text.includes("subset") || text.includes("permutation") || text.includes("combination") || text.includes("backtrack")) {
    pattern = "Backtracking";
    difficulty = "Medium";
    confidence = 0.91;
    approach = "State-space tree exploration. Recursively choose elements, recurse, then undo the choice (backtrack) to explore alternative solutions.";
  }

  return {
    pattern,
    difficulty,
    confidence,
    suggestedApproach: approach,
    timeComplexity: "O(N)",
    spaceComplexity: "O(N)"
  };
};

const getMockHint = (title, hintNum) => {
  const name = title.toLowerCase();
  const num = Number(hintNum);
  
  if (name.includes("two sum") || name.includes("2sum")) {
    if (num === 1) return "Hint 1: The brute force approach is to check every pair, which takes O(N^2) time. Can we do better using extra space?";
    if (num === 2) return "Hint 2: Since we need to find two numbers that add up to a target, for any number x, we are looking for (target - x). Can we store visited numbers somewhere for O(1) lookups?";
    if (num === 3) return `### Two Sum - Template (Java & C)
#### Java Template:
\`\`\`java
class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Initialize a HashMap to store number and its index
        // Loop through the array
        // Calculate complement = target - nums[i]
        // Check map.containsKey(complement)
    }
}
\`\`\`
#### C Template:
\`\`\`c
/**
 * Note: The returned array must be malloced, assume caller calls free().
 */
int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    // Set returnSize to 2 for result array
    // Implement hash lookup or optimized search
    // Return dynamically allocated array of size 2
}
\`\`\``;
    return `### Two Sum - Full Solution (Java & C)
#### Java Solution:
\`\`\`java
import java.util.HashMap;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        HashMap<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[] {};
    }
}
\`\`\`
#### C Solution:
\`\`\`c
#include <stdlib.h>

int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    for (int i = 0; i < numsSize; i++) {
        for (int j = i + 1; j < numsSize; j++) {
            if (nums[i] + nums[j] == target) {
                int* result = (int*)malloc(2 * sizeof(int));
                result[0] = i;
                result[1] = j;
                *returnSize = 2;
                return result;
            }
        }
    }
    *returnSize = 0;
    return NULL;
}
\`\`\`
**Complexity**:
* **Time Complexity**: $\\mathcal{O}(N)$
* **Space Complexity**: $\\mathcal{O}(N)$`;
  }

  // Generic hint generator
  if (num === 1) return "Hint 1: Think about how you would solve this manually. Identify the brute-force approach first.";
  if (num === 2) return "Hint 2: Consider sorting the input array or using a hash map to decrease time complexity.";
  if (num === 3) return `### Structural Code Template (Java & C)
#### Java Template:
\`\`\`java
class Solution {
    public void solve() {
        // Implement standard structure, variables, loops
    }
}
\`\`\`
#### C Template:
\`\`\`c
void solve() {
    // Implement standard structure, variables, loops
}
\`\`\``;
  return `### Full Solution (Java & C)
#### Java:
\`\`\`java
class Solution {
    public void solve() {
        // Complete working implementation in Java
    }
}
\`\`\`
#### C:
\`\`\`c
void solve() {
    // Complete working implementation in C
}
\`\`\`
**Complexity**:
* **Time Complexity**: $\\mathcal{O}(N)$
* **Space Complexity**: $\\mathcal{O}(1)$`;
};

const getMockCodeReview = (code) => {
  let timeComplexity = "O(N^2)";
  let spaceComplexity = "O(1)";
  let suggestions = [
    "You are using nested loops which causes quadratic time complexity.",
    "Consider sorting the inputs first or using a hash map to trade space for time.",
    "Ensure you validate input parameters for null or empty values before beginning execution."
  ];
  let edgeCases = [
    "Empty array/input list",
    "Negative numbers or duplicate values",
    "Overflow limits for integer calculations"
  ];
  let feedback = "Your implementation is functionally correct but contains inefficiencies due to the nested loop design. In interviews, seek O(N) or O(N log N) optimizations first.";

  if (!code.includes('for') && !code.includes('while')) {
    timeComplexity = "O(1)";
    spaceComplexity = "O(1)";
    suggestions = ["Excellent constant time operation!"];
  } else if ((code.match(/for|while/g) || []).length === 1) {
    timeComplexity = "O(N)";
    if (code.includes('Map') || code.includes('Set') || code.includes('new Array') || code.includes('push')) {
      spaceComplexity = "O(N)";
    }
    suggestions = [
      "Good job implementing a linear time algorithm!",
      "If you are building arrays or tracking visits, confirm if pointers can achieve O(1) space."
    ];
    feedback = "Fantastic work! An O(N) linear scan is optimal for this problem. Make sure to clearly state your time and space complexity to your interviewer.";
  }

  return {
    timeComplexity,
    spaceComplexity,
    suggestions,
    edgeCases,
    feedback
  };
};

// --- ROUTE HANDLERS ---

// @route   POST api/ai/chat
// @desc    Chat with the AI DSA Mentor
// @access  Private
router.post('/chat', auth, async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ message: 'Message is required' });
  }

  try {
    // Fetch or create user chat log
    let chat = await Chat.findOne({ userId: req.user.id });
    if (!chat) {
      chat = new Chat({ userId: req.user.id, messages: [] });
    }

    // Append user message
    chat.messages.push({ role: 'user', content: message });

    let assistantResponse = '';

    if (isMockKey()) {
      // Mock mode fallback
      assistantResponse = getMockChatResponse(message);
    } else {
      // Real API Call
      const systemMessage = {
        role: 'system',
        content: `You are an expert DSA Pattern Mentor. Your goal is to guide students to learn DSA through patterns (such as Sliding Window, Two Pointers, Trees, Backtracking, Dynamic Programming, Graphs). 
Keep explanations structured, beautiful, and concise. Use Markdown with LaTeX formatting (e.g. $O(N)$) for complexities. 
Never write the entire solution unless explicitly asked. Help them understand concepts, keywords, and templates.`
      };

      // Get last 10 messages for context
      const chatContext = chat.messages.slice(-10).map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          messages: [systemMessage, ...chatContext],
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`Groq API returned status ${response.status}`);
      }

      const data = await response.json();
      assistantResponse = data.choices[0].message.content;
    }

    // Append assistant response and save
    chat.messages.push({ role: 'assistant', content: assistantResponse });
    await chat.save();

    res.json({ response: assistantResponse, history: chat.messages });
  } catch (error) {
    console.error('AI chat error:', error.message);
    // Graceful fallback to mock response if Groq API fails
    const fallbackResponse = getMockChatResponse(message) + "\n\n*(Note: Fallback triggered due to API connection error)*";
    res.json({ response: fallbackResponse });
  }
});

// @route   POST api/ai/detect-pattern
// @desc    Detect problem pattern from problem statement
// @access  Private
router.post('/detect-pattern', auth, async (req, res) => {
  const { statement } = req.body;

  if (!statement) {
    return res.status(400).json({ message: 'Problem statement is required' });
  }

  try {
    if (isMockKey()) {
      return res.json(getMockPatternDetection(statement));
    }

    const systemPrompt = `You are a DSA pattern classifier. Analyze the problem statement and return a JSON object with fields:
{
  "pattern": "String (matching core patterns like Sliding Window, two pointers, etc.)",
  "difficulty": "Easy/Medium/Hard",
  "confidence": 0.0 to 1.0 (float),
  "suggestedApproach": "String explaining the general logic",
  "timeComplexity": "O(...) representation",
  "spaceComplexity": "O(...) representation"
}
Return ONLY valid JSON. No other conversational text.`;

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: statement }
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) throw new Error("Groq API Classify error");

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    res.json(result);
  } catch (error) {
    console.error('Pattern detect error:', error.message);
    res.json(getMockPatternDetection(statement));
  }
});

// @route   POST api/ai/hint
// @desc    Get hints incrementally for a problem
// @access  Private
router.post('/hint', auth, async (req, res) => {
  const { problemTitle, hintNumber } = req.body; // hintNumber: 1, 2, 3, or 4 (full solution)
  const level = Number(hintNumber);
  console.log(`[Backend Debug] Hint request: problem="${problemTitle}", level=${level}`);
  console.log(`[Backend Debug] isMockKey: ${isMockKey()}, Key loaded length: ${process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.length : 0}, startsWithMock: ${process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.startsWith('gsk_mock') : false}`);

  try {
    if (isMockKey()) {
      return res.json({ hint: getMockHint(problemTitle || '', level) });
    }

    let prompt = '';
    if (level === 1) {
      prompt = `Provide Hint #1 for the DSA problem "${problemTitle}". 
This must be a high-level conceptual hint. Explain the general direction or the key observation needed to solve the problem. Do NOT mention specific algorithms, data structures, or code.`;
    } else if (level === 2) {
      prompt = `Provide Hint #2 for the DSA problem "${problemTitle}". 
This must be an algorithmic approach hint. Explain the specific strategy, algorithm, or data structure to use (e.g., Two Pointers, HashMap) and the intermediate logic steps. Do NOT provide code or template snippets.`;
    } else if (level === 3) {
      prompt = `Provide Hint #3 for the DSA problem "${problemTitle}". 
This must be a structure or template hint in Java and C ONLY. Provide code template, pseudo-code, or signature logic outlining how to write the solution (e.g., helper loops, conditions, key variable updates) in Java and C. Do NOT provide complete code, and do NOT provide JavaScript or C++ code.`;
    } else {
      prompt = `Provide the optimal full working solution code in Java and C ONLY for "${problemTitle}" with full time and space complexity analysis. Do NOT provide JavaScript or C++ code.`;
    }

    const systemPrompt = `You are a professional DSA tutor. You must provide distinct outputs depending on the requested hint level:
- For Hint Level 1 (Conceptual): Provide a brief high-level concept hint only. DO NOT write any code, algorithms, or complexities.
- For Hint Level 2 (Strategy): Explain the algorithmic approach (e.g., HashMap, Two Pointers) and intermediate steps. DO NOT provide code templates or solution code.
- For Hint Level 3 (Template): Provide the structural code template, helper functions, loops, and conditions in Java and C ONLY. DO NOT write the complete final solution code. Do NOT write JavaScript or C++ code.
- For Hint Level 4 (Full Code): You MUST provide the complete, fully working solution code in Java and C ONLY, with full time and space complexity analysis. Do NOT write JavaScript or C++ code.`;

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5
      })
    });

    if (!response.ok) throw new Error("Groq API Hint error");

    const data = await response.json();
    res.json({ hint: data.choices[0].message.content });
  } catch (error) {
    console.error('Hint API error:', error.message);
    res.json({ hint: getMockHint(problemTitle || '', hintNumber) });
  }
});

// @route   POST api/ai/review-code
// @desc    Review submitted code for complexities and improvements
// @access  Private
router.post('/review-code', auth, async (req, res) => {
  const { code, language } = req.body;

  if (!code) {
    return res.status(400).json({ message: 'Code is required' });
  }

  try {
    if (isMockKey()) {
      return res.json(getMockCodeReview(code));
    }

    const systemPrompt = `You are a strict technical interviewer. Review the user's code. Return a JSON object with:
{
  "timeComplexity": "O(...) representation",
  "spaceComplexity": "O(...) representation",
  "suggestions": ["suggestion 1", "suggestion 2", ...],
  "edgeCases": ["edge case 1", "edge case 2", ...],
  "feedback": "String summarizing general optimization feedback and interview performance"
}
Return ONLY valid JSON. No conversational text outside JSON.`;

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Language: ${language || 'javascript'}\nCode:\n${code}` }
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) throw new Error("Groq API Code Review error");

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    res.json(result);
  } catch (error) {
    console.error('Code review error:', error.message);
    res.json(getMockCodeReview(code));
  }
});

module.exports = router;
