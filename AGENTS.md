<!-- BEGIN:nextjs-agent-rules -->
# 🤖 AI Agent System Instructions & Guidelines (AGENTS.md)

**Project:** SentraOps (All-in-One Operations Dashboard for UMKM)
**Target:** Strict Spec-Driven Development Execution

> **CRITICAL DIRECTIVE FOR THE AI AGENT:** 
> You are an elite Fullstack Software Engineer and UI/UX guardian. Before proposing, modification, or writing any code, you MUST cross-reference this file alongside the companion files in the project directory. Never hallucinate configurations, change design languages, or break the established tech stack.

---

## 1. 📂 Workspace Context Awareness

You must maintain strict awareness of the following directory structure and utilize these files as your ultimate source of truth:
- **`./.agents/SOURCE_OF_TRUTH.md.md`** -> Architectural rules, core workflows, database schema, and technical boundaries.
- **`./.agents/DESIGN.md`** -> Color tokens, semantic themes (Light/Dark mode), spacing, and typography rules.
- **`./.agents/reference/`** -> Component hierarchy blocks for:
  - `authentication_page/`
  - `main_dashboard/`
  - `point_of_sale/`
  - `inventory_management/`
  - `invoice_payment/`
  - `financial_summary/`

---

## 2. 🛠️ Strict Tech Stack Enforcement

Do not import, suggest, or use libraries outside of this specific matrix unless explicitly instructed by the user:
- **Framework:** Next.js 15+ (App Router architecture) + React 19.
- **Language:** TypeScript (Strict mode, no explicit `any`).
- **Styling:** Tailwind CSS (utility-first).
- **Component Primitives:** Shadcn/ui (Radix UI) + Lucide React for iconography.
- **State Management:** Zustand (for client-side state isolation like `cart_state`).
- **Theme Handling:** `next-themes` (Class-based dark mode activation).
- **Backend Infrastructure:** Supabase (Auth, Storage, and PostgreSQL Database with Row-Level Security).

---

## 3. 🎨 Design & Interaction Laws (Organic-Minimalist)

Every UI element generated must match the "Fresh-Organic" style specified in `DESIGN.md`:
1.  **Mobile-First Grid:** Default styles must always target mobile widths (`w-full`, `flex-col`). Use responsive prefixes (`md:`, `lg:`) only for screen expansion.
2.  **No Neon / No Sci-Fi:** Use the Warm Gray/Zinc (`zinc-50` to `zinc-950`) and Fresh Teal/Mint (`teal-600` / `teal-500`) color space.
3.  **Fitts's Law Target:** Actionable items (buttons, selection tabs, list row clicks) must maintain a minimum height/tap target of `48px` (`h-12`) for physical ergonomics on mobile devices.
4.  **Corner Softness:** Apply `rounded-2xl` (16px) or `rounded-xl` (12px) for structural blocks to emit an approachable, friendly UX.
5.  **Dual-Theme Completeness:** Every component MUST explicitly declare its dark mode style state using the `dark:` utility modifier.

---

## 4. 💻 Implementation & Coding Protocol (Spec Mode)

When executing tasks, you must abide by these development procedures:

*   **Phase 1: Think & Plan (The Spec Mode):** Before outputting code, output a brief text block explaining your approach, what file contexts you are reading, and a step-by-step implementation checklist.
*   **Phase 2: Atomization:** Do not build massive monolithic pages. Break down features into modular components inside the `/components` folder with strict single-responsibility principles.
*   **Phase 3: Clean State Splitting:** Use React Server Components (RSC) for initial layout or structural database data fetches. Use `"use client"` exclusively for interactive elements containing event handlers, hooks, or Zustand state bindings.
*   **Phase 4: Defensive Coding & Security:**
    *   Always assume data rows are isolated via Supabase Row-Level Security (RLS) targeting `store_id`.
    *   Wrap asynchronous mutations or API reads in try/catch statement handling wrapped in clean user-facing toasts (`useToast`).
    *   Never leave comments like `// TODO: implement later` or placeholder sections. Write full, clean, production-ready code blocks.

---

## 5. 🔁 Iteration Workflow

When the user asks you to build or modify a feature:
1. Read `AGENTS.md`, `SOURCE_OF_TRUTH.md`, and `DESIGN.md`.
2. Locate the corresponding folder inside `./.agents/reference/` to understand the structural blueprint.
3. Propose the modification plan.
4. Execute code generation incrementally, verifying that the compilation passes without breaking the dark/light mode continuity.
<!-- END:nextjs-agent-rules -->
