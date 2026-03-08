# Get Amazed

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- A random fact generator web app with Gen Z aesthetic
- 50-100 curated facts organized by category (Science, History, Nature, Mind-Blowing)
- Homepage with header ("Get Amazed"), main fact section, and footer
- Large "Get Amazed ✨" CTA button that reveals a random fact
- Fact display card with smooth fade-in animation
- "Amaze Me Again" button to cycle to the next fact
- Category filter tabs (All, Science, History, Nature, Mind-Blowing)
- Share button that copies the fact to clipboard with success feedback
- Mobile-first responsive layout

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan
1. Backend: Store facts array with category metadata; expose getRandomFact and getFactByCategory query calls
2. Frontend: Build layout with header, category filter tabs, fact card component with fade animation, CTA + share buttons, footer
3. Fact card fades in on each new fact reveal using CSS transitions
4. Share button copies fact text to clipboard and shows brief "Copied!" toast confirmation
5. Category tabs filter the fact pool before random selection
6. All state managed in React (current fact, selected category, loading/copied states)
