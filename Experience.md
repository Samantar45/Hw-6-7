Vibe Coding Project Experience Documentation
Tool Selection Justification

For this project, I selected ChatGPT as my primary vibe coding tool. I chose it because it provides an interactive, conversational workflow that mimics pair-programming while still offering structured code generation. Unlike traditional code assistants that only autocomplete, ChatGPT allowed me to build the full Tetris game through iterative guidance, corrections, and explanations. This made it especially appealing for larger logic-based projects like Tetris, where game loops, rendering, and collision systems must work together smoothly.

Another reason ChatGPT fit this project well is its ability to understand context across multiple files—HTML, CSS, and JavaScript—and ensure consistency across them. Since Tetris requires syncing canvas setups, input handling, rendering loops, and game logic, having an AI capable of coordinating the entire system from top to bottom was extremely helpful.

Development Process

Throughout development, I used ChatGPT as a dynamic assistant rather than a simple code generator. The process started with requesting full-file templates, then refining them step-by-step. I asked ChatGPT to generate the initial layouts for desktop and mobile, then integrate features like preview pieces, hold system, local storage for high scores, and responsive UI. Each major part of the game—collision logic, matrix management, rendering, and user input—was created through iterative prompting.

The most effective prompts were specific requests like “send the entire scripts.js again with the issue fixed” or “make the layout responsive but keep both mobile and desktop versions.” These caused ChatGPT to rebuild sections cohesively, rather than patch fragments. Development was highly iterative: the full game took around 6–10 major iterations, especially due to a dropping/collision bug that required multiple rewrites of the collide() function and game loop timing logic. ChatGPT handled these iterations well and improved the code each time based on debugging descriptions.

Challenges and Solutions

The biggest challenge was the Tetris drop logic bug, where pieces did not fall all the way down. This required several attempts before the logic for collision checking was fully corrected. I had to describe the behavior myself since ChatGPT can't run the code, which meant the debugging process required clear communication. Eventually, we identified the issue and ChatGPT rewrote the collide() function and updated the drop behavior so pieces now fall correctly.

Another challenge was integrating mobile controls with the JavaScript logic. The tool helped by exposing key functions globally (window.playerMove, etc.), which allowed buttons to call the same actions as keyboard keys. I manually adjusted some HTML and CSS to fit the layout better, demonstrating that AI-generated layouts often require human refinement.

The last major issue was ensuring consistency across filenames—my JavaScript file was named scripts.js instead of tetris.js. ChatGPT adapted quickly, but I needed to remind it several times, showing that accuracy depends on clear instruction.

Reflection

Using a vibe coding tool like ChatGPT was surprisingly efficient. Instead of manually coding every system, I focused on describing problems, refining behavior, and validating logic. The ability to generate whole files, redesign structures, and troubleshoot bugs conversationally completely changed the workflow. It felt more like collaborating with an intelligent assistant than using a tool.

I would definitely use a tool like this for future projects, especially when building prototypes, games, or UI-heavy applications. It accelerates development dramatically, but still requires a developer’s oversight to catch mistakes, test behavior, and ensure code quality. I think this technology will significantly impact software development by shifting the role of programmers from writing raw code to supervising AI-generated code, designing systems, and making architectural decisions.

Vibe coding doesn't replace programming—it changes what programming looks like. Tools like ChatGPT make development faster, more accessible, and more collaborative, and I believe they will become a standard part of future software workflows.