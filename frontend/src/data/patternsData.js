export const PATTERNS_DATA = {
  "Arrays": {
    description: "Fundamental sequential storage. Learn indexing, sliding, copying, and sub-sequence strategies.",
    difficulty: "Easy",
    complexityTime: "O(1) access, O(N) search",
    complexitySpace: "O(1) or O(N) depending on copies",
    clues: ["contiguous elements", "in-place operations", "subsegments", "sorting indices"],
    tips: "Always check for empty inputs or inputs with size 1. Think about sorting first to simplify search.",
    template: `function traverse(arr) {
  for (let i = 0; i < arr.length; i++) {
    // Perform standard index operations
    const element = arr[i];
  }
}`
  },
  "Strings": {
    description: "Sequence of characters. Learn indexing, reversal, substring searching, anagrams, and palindrome patterns.",
    difficulty: "Easy",
    complexityTime: "O(N) traversal, O(N) operations",
    complexitySpace: "O(1) or O(N) for string building",
    clues: ["anagrams", "substrings", "characters matching", "palindromic checks"],
    tips: "Remember strings are immutable in many languages (like JS/Java). Use a character count array of size 26 for ASCII optimizations.",
    template: `function stringManipulation(str) {
  const chars = str.split('');
  // Perform character checks or builder
  return chars.join('');
}`
  },
  "Hashing": {
    description: "Using hash tables or sets to lookup elements in constant time. Essential for frequency mapping.",
    difficulty: "Easy",
    complexityTime: "O(1) average lookup/insert",
    complexitySpace: "O(N) to store elements",
    clues: ["lookup target values", "counting frequencies", "determining duplicates", "constant time search"],
    tips: "Use a Hash Map when you need mapping (key-value) and a Hash Set when you only need unique elements.",
    template: `function findUniquePairs(arr, target) {
  const seen = new Set();
  for (const num of arr) {
    if (seen.has(target - num)) {
      return true;
    }
    seen.add(num);
  }
  return false;
}`
  },
  "Prefix Sum": {
    description: "Pre-computes cumulative sums of arrays to answer sum queries on ranges in constant time.",
    difficulty: "Easy",
    complexityTime: "O(N) pre-compute, O(1) query",
    complexitySpace: "O(N) to store sum arrays",
    clues: ["subarray sums", "multiple range queries", "cumulative frequency check"],
    tips: "If you need range sum between indices L and R, use prefixSum[R] - prefixSum[L-1]. Ensure index offset handling is correct.",
    template: `function createPrefixSum(arr) {
  const prefix = new Array(arr.length + 1).fill(0);
  for (let i = 0; i < arr.length; i++) {
    prefix[i + 1] = prefix[i] + arr[i];
  }
  return prefix; // sum(L, R) = prefix[R + 1] - prefix[L]
}`
  },
  "Two Pointers": {
    description: "Maintains two indices that move toward each other or in parallel to search sorted arrays efficiently.",
    difficulty: "Easy",
    complexityTime: "O(N) single pass",
    complexitySpace: "O(1) constant space",
    clues: ["sorted array", "finding pairs/triplets", "target sums", "reverse/swap elements"],
    tips: "Only works on sorted arrays. Shift pointers inward based on sum comparisons (if sum < target, increment left; if sum > target, decrement right).",
    template: `function twoPointers(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  while (left < right) {
    const sum = arr[left] + arr[right];
    if (sum === target) {
      return [left, right];
    } else if (sum < target) {
      left++;
    } else {
      right--;
    }
  }
  return [-1, -1];
}`
  },
  "Sliding Window": {
    description: "Subarray or substring search utilizing a sliding boundaries interval to optimize nested loops.",
    difficulty: "Medium",
    complexityTime: "O(N) linear time",
    complexitySpace: "O(K) window size or O(1)",
    clues: ["longest/shortest subarray", "substring containing constraints", "contiguous elements size", "k length constraints"],
    tips: "Expand the right boundary, add element to state, then shrink the left boundary in a while loop until the window is valid again.",
    template: `function slidingWindow(arr, k) {
  let left = 0;
  let maxVal = 0;
  let currentSum = 0;
  for (let right = 0; right < arr.length; right++) {
    currentSum += arr[right];
    // If window exceeds target size, shrink from left
    while (right - left + 1 > k) {
      currentSum -= arr[left];
      left++;
    }
    maxVal = Math.max(maxVal, currentSum);
  }
  return maxVal;
}`
  },
  "Binary Search": {
    description: "Logarithmic lookup strategy in sorted structures by continuously dividing search intervals in half.",
    difficulty: "Easy",
    complexityTime: "O(log N)",
    complexitySpace: "O(1)",
    clues: ["sorted array", "finding elements in log time", "minimum/maximum optimization", "dividing partitions"],
    tips: "Ensure mid calculation uses low + Math.floor((high - low) / 2) to prevent potential integer overflows.",
    template: `function binarySearch(arr, target) {
  let low = 0;
  let high = arr.length - 1;
  while (low <= high) {
    const mid = low + Math.floor((high - low) / 2);
    if (arr[mid] === target) return mid;
    else if (arr[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  return -1;
}`
  },
  "Linked List": {
    description: "Non-contiguous list connected by memory pointers. Master node swapping, slow/fast pointers, and reversals.",
    difficulty: "Easy",
    complexityTime: "O(N) traversal, O(1) modifications",
    complexitySpace: "O(1)",
    clues: ["sequential nodes", "cycles detection", "merging nodes", "reverse order lists"],
    tips: "Use a Dummy Node pointing to the head to easily manage edge cases like deleting the head or restructuring the list.",
    template: `function reverseList(head) {
  let prev = null;
  let curr = head;
  while (curr !== null) {
    let nextNode = curr.next;
    curr.next = prev;
    prev = curr;
    curr = nextNode;
  }
  return prev;
}`
  },
  "Stack": {
    description: "Last-In, First-Out (LIFO) structure. Used for matching, evaluations, nesting, and monotonic filters.",
    difficulty: "Easy",
    complexityTime: "O(1) push/pop, O(N) operations",
    complexitySpace: "O(N)",
    clues: ["nested brackets", "undo/backtrack actions", "next greater element", "reverse polish notation"],
    tips: "Monotonic stacks are excellent for finding the 'next greater' or 'previous smaller' element in O(N) time.",
    template: `function bracketMatching(str) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (const char of str) {
    if (char === '(' || char === '{' || char === '[') {
      stack.push(char);
    } else if (map[char]) {
      if (stack.pop() !== map[char]) return false;
    }
  }
  return stack.length === 0;
}`
  },
  "Queue": {
    description: "First-In, First-Out (FIFO) structure. Used for scheduling, breadth-first traversal, and buffer queues.",
    difficulty: "Easy",
    complexityTime: "O(1) enqueue/dequeue",
    complexitySpace: "O(N)",
    clues: ["level order traversal", "first come first served", "sliding window maximum", "buffer limits"],
    tips: "In Javascript, standard arrays push/shift runs shift in O(N). For real-world efficiency, design double-pointer lists.",
    template: `class Queue {
  constructor() { this.items = []; }
  enqueue(element) { this.items.push(element); }
  dequeue() { return this.items.shift(); }
  isEmpty() { return this.items.length === 0; }
}`
  },
  "Heap / Priority Queue": {
    description: "Binary tree maintaining max/min properties. Ideal for top-K elements or dynamic sorting.",
    difficulty: "Medium",
    complexityTime: "O(log N) insert/delete, O(1) peek",
    complexitySpace: "O(N)",
    clues: ["kth largest/smallest", "merging sorted lists", "frequent items count", "dynamic medians"],
    tips: "If you need a Min-Heap and only have a Max-Heap library, multiply numbers by -1 before pushing, and multiply by -1 after popping.",
    template: `// Javascript does not have a native Priority Queue. Here is a basic sorted array fallback:
class MinHeap {
  constructor() { this.data = []; }
  insert(val) {
    this.data.push(val);
    this.data.sort((a, b) => a - b);
  }
  pop() { return this.data.shift(); }
  peek() { return this.data[0]; }
}`
  },
  "Trees": {
    description: "Hierarchical structure. Practice Depth-First Search (DFS), Breadth-First Search (BFS), and tree recursive functions.",
    difficulty: "Medium",
    complexityTime: "O(N) traversal",
    complexitySpace: "O(H) recursion height, O(N) max BFS width",
    clues: ["nodes hierarchy", "ancestor paths", "depth limits", "level order lists"],
    tips: "Most tree problems can be solved recursively. Identify base cases first (e.g. if node === null return 0).",
    template: `function maxDepth(root) {
  if (root === null) return 0;
  let leftDepth = maxDepth(root.left);
  let rightDepth = maxDepth(root.right);
  return Math.max(leftDepth, rightDepth) + 1;
}`
  },
  "Binary Search Trees": {
    description: "Nodes organized with left children < root < right children. Ideal for sorting and binary partitioning.",
    difficulty: "Medium",
    complexityTime: "O(log N) average, O(N) worst case",
    complexitySpace: "O(H) height recursion",
    clues: ["sorted tree search", "in-order traversal", "LCA searches", "inserting sorted keys"],
    tips: "An In-Order traversal (Left -> Root -> Right) of a valid Binary Search Tree always yields elements in sorted order.",
    template: `function searchBST(root, val) {
  if (root === null || root.val === val) return root;
  if (val < root.val) return searchBST(root.left, val);
  return searchBST(root.right, val);
}`
  },
  "Trie": {
    description: "Prefix tree structure for character chains. Essential for autocompletes, word searches, and dictionaries.",
    difficulty: "Medium",
    complexityTime: "O(L) word length searches",
    complexitySpace: "O(ALPHABET * L) memory node count",
    clues: ["prefix searches", "word dictionaries", "prefix autocompletes", "word match filters"],
    tips: "Trie nodes typically store a map of child characters and an 'isEndWord' boolean flag indicating complete matching.",
    template: `class TrieNode {
  constructor() {
    this.children = {};
    this.isWord = false;
  }
}
class Trie {
  constructor() { this.root = new TrieNode(); }
  insert(word) {
    let curr = this.root;
    for (const char of word) {
      if (!curr.children[char]) curr.children[char] = new TrieNode();
      curr = curr.children[char];
    }
    curr.isWord = true;
  }
}`
  },
  "Greedy": {
    description: "Makes local optimal choices at each step, hoping to find a global optimum. Hard to prove correctness.",
    difficulty: "Medium",
    complexityTime: "O(N log N) sorting or O(N)",
    complexitySpace: "O(1)",
    clues: ["minimizing meetings", "intervals overlap", "maximizing resource value", "making immediate best choices"],
    tips: "Typically involves sorting intervals/tasks first. Proof of correctness is key: try to think of counterexamples first.",
    template: `function mergeIntervals(intervals) {
  intervals.sort((a, b) => a[0] - b[0]);
  const merged = [];
  for (const interval of intervals) {
    if (merged.length === 0 || merged[merged.length - 1][1] < interval[0]) {
      merged.push(interval);
    } else {
      merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], interval[1]);
    }
  }
  return merged;
}`
  },
  "Backtracking": {
    description: "Exhaustive recursive search method. Explores states, makes choices, recurses, and undoes choices (backtracks).",
    difficulty: "Medium",
    complexityTime: "O(2^N) or O(N!) exponential",
    complexitySpace: "O(N) recursion stack space",
    clues: ["permutations sets", "combinations groups", "generating subsets", "grid path solvers"],
    tips: "Template: make choice, call backtrack, undo choice. Always determine your base cases and validation criteria first.",
    template: `function backtrack(res, temp, nums, start) {
  res.push([...temp]);
  for (let i = start; i < nums.length; i++) {
    temp.push(nums[i]); // make choice
    backtrack(res, temp, nums, i + 1); // recurse
    temp.pop(); // undo choice (backtrack)
  }
}`
  },
  "Dynamic Programming": {
    description: "Solves overlapping subproblems. Includes Top-down (recursion + memoization) and Bottom-up (tabulation) styles.",
    difficulty: "Hard",
    complexityTime: "O(N * M) typical state count",
    complexitySpace: "O(N * M) or O(N) optimized space",
    clues: ["overlapping subproblems", "optimum values (min/max)", "ways to count", "climbing/knapsack scenarios"],
    tips: "Start with a recursive relationship. Add a memoization cache. Then convert it to bottom-up arrays to optimize spaces.",
    template: `function climbStairs(n) {
  if (n <= 2) return n;
  let dp = new Array(n + 1);
  dp[1] = 1;
  dp[2] = 2;
  for (let i = 3; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  return dp[n];
}`
  },
  "Graphs": {
    description: "Networks of nodes connected by edges. Practice DFS, BFS, cycle checks, topological sorting, and shortest paths.",
    difficulty: "Medium",
    complexityTime: "O(V + E) vertices & edges traversal",
    complexitySpace: "O(V) storage sets/queues",
    clues: ["matrices cells connectedness", "islands count", "dependency chains", "connected networks"],
    tips: "Represent graphs using an adjacency list (Map of node -> array of neighbors). Use a Visited set to avoid cycles.",
    template: `function dfs(node, adjList, visited) {
  if (visited.has(node)) return;
  visited.add(node);
  const neighbors = adjList[node] || [];
  for (const nextNode of neighbors) {
    dfs(nextNode, adjList, visited);
  }
}`
  },
  "Union Find": {
    description: "Disjoint Set Union (DSU) data structure. Efficiently manages set mergers and connectivity checks.",
    difficulty: "Medium",
    complexityTime: "O(alpha(N)) nearly constant amortized time",
    complexitySpace: "O(N) parent mapping",
    clues: ["cycles in undirected graphs", "number of connected groups", "dynamic equivalence connectivity", "merging sets"],
    tips: "Implement Path Compression in 'find' and Union by Rank in 'union' to keep tree depth nearly constant.",
    template: `class DSU {
  constructor(size) {
    this.parent = Array.from({ length: size }, (_, idx) => idx);
  }
  find(x) {
    if (this.parent[x] === x) return x;
    return this.parent[x] = this.find(this.parent[x]); // Path compression
  }
  union(x, y) {
    const rootX = this.find(x);
    const rootY = this.find(y);
    if (rootX !== rootY) {
      this.parent[rootX] = rootY;
      return true;
    }
    return false;
  }
}`
  },
  "Bit Manipulation": {
    description: "Performs binary operations directly on integers. Incredibly fast bit masks, toggling, and checks.",
    difficulty: "Medium",
    complexityTime: "O(1) or O(bits length)",
    complexitySpace: "O(1) constant",
    clues: ["finding single unique values", "counting active 1 bits", "binary shifting", "toggling masks"],
    tips: "Learn bitwise operations: XOR (x ^ y), AND (x & y), OR (x | y), and bitwise shifts (x << 1, x >> 1). x ^ x = 0.",
    template: `function countBits(n) {
  let count = 0;
  while (n > 0) {
    count += n & 1;
    n = n >> 1; // logical shift right
  }
  return count;
}`
  }
};
