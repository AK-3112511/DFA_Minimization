# [DFA Minimization Simulator](https://dfa-minimization-lime.vercel.app/)
## TOC Project
### By - Arham Kansal (S20240010013, Section-1)

# DFA Minimization Simulator

An interactive web-based simulator that visualizes the **Myhill-Nerode Theorem** for minimizing Deterministic Finite Automata (DFA). Step through the algorithm, watch equivalence tables evolve, and explore the minimized result — all in a sleek, dark-themed interface.

## Key Features

- **Interactive DFA Input** — Define states, alphabet, start/final states, and transition table through an intuitive form.
- **Step-by-Step Visualization** — Walk through the Myhill-Nerode algorithm one step at a time with play, pause, forward, and backward controls.
- **Equivalence Table** — Watch the triangular distinguishability table get filled in real-time as pairs are marked across iterations.
- **Clickable Cells & Steps** — Click any cell in the equivalence table to jump to the step where it was evaluated. Click any step in the execution log to jump directly to that point in the simulation.
- **DFA Graph Visualization** — View both the original and minimized DFA as interactive, draggable node graphs with curved edges, self-loops, and start/final state indicators.
- **Execution Log** — A detailed trace log on the right pane shows every evaluation decision made by the algorithm.
- **Minimized Result** — Once the algorithm completes, visualize the minimized DFA along with the computed equivalence classes.

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **UI Styling** | [Tailwind CSS](https://tailwindcss.com/) |
| **State Management** | [Zustand](https://zustand-demo.pmnd.rs/) |
| **Graph Visualization** | [React Flow (@xyflow/react)](https://reactflow.dev/) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Deployment** | [Vercel](https://vercel.com/) |

## How to Use

1. **Define Your DFA**
   - Enter the states (comma-separated, e.g., `A, B, C, D, E, F`).
   - Enter the alphabet (e.g., `0, 1`).
   - Set the start state and final (accepting) states.
   - Fill in the transition table by selecting the target state for each state-symbol pair.

2. **Run the Algorithm**
   - Click **"Run Myhill-Nerode"** to start the simulation.
   - The interface splits into three panes:
     - **Left** — Original DFA graph (draggable nodes).
     - **Center** — Equivalence table(s) showing the algorithm progress.
     - **Right** — Step-by-step execution log.

3. **Control Playback**
   - Use the **Play/Pause** button to auto-step through the algorithm.
   - Use **Forward/Backward** buttons to manually step one at a time.
   - Click on any **step in the log** to jump to that point.
   - Click on any **cell in the table** to jump to when that pair was evaluated.

4. **View the Result**
   - Once the algorithm finishes, click **"Visualize Minimal DFA"** to see the minimized automaton.
   - The equivalence classes are displayed alongside the minimized graph.

5. **Reset**
   - Click the **Reset** button to start over with a new DFA configuration.
