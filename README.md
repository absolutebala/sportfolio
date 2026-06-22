# iSportOne

**The lifelong home for every athlete.**

iSportOne is a sports professional network — the LinkedIn for sports — built under [iDataOne](https://github.com/absolutebala). It combines a lifelong sports passport, a broadcast-style community feed, and club management tools, serving athletes, parents, coaches, and club admins across every age and every sport, globally.

> "A lifelong sports passport, community feed, and club management platform for athletes of every level and every sport — globally."

## Current Status

This repo currently contains the **Welcome / Sign-up screen** (web), the first screen in the onboarding flow. It is a static HTML/CSS prototype intended to be rebuilt in the final frontend framework once tech stack is finalized.

### What's in this screen
- Full-screen athlete action photography background
- Centered floating auth card — Google / Apple / Facebook sign-in
- "Sign in" link for returning users
- Parent sign-up entry point for under-16 athletes
- iDataOne footer with copyright

## Project Structure

```
isportone/
├── index.html       # Welcome screen markup + styles
└── hero-bg.png       # Hero background image
```

## Running locally

Just open `index.html` in a browser — no build step required for this static prototype.

```bash
open index.html
```

## Roadmap

Phase 1 (Foundation) scope includes:
- Athlete profiles (adaptive: competitive & recreational)
- Lifelong sports passport
- Parent account + under-16 flow
- Tagging & Activity Linking
- Basic club pages
- Community feed (three-zone hybrid)
- Notifications & re-engagement nudges
- Basic internal tournaments

Full product requirements are documented in the project's PRD (not included in this public repo).

## License

Proprietary — © iDataOne. All rights reserved.
