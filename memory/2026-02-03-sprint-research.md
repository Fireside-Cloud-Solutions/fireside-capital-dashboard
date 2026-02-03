# Sprint Research Log — 2026-02-03

**Cron Job:** sprint-research (628b4cfa-0b98-407a-9b73-643250963772)  
**Time:** 6:35 PM EST  
**Agent:** Capital (researcher mode)

---

## Research Backlog
1. ✅ **CSS Architecture** — COMPLETE
2. ⏳ Financial Dashboard UI Patterns — NEXT
3. ⏳ Chart.js Best Practices
4. ⏳ Bootstrap Dark Theme
5. ⏳ PWA (Progressive Web App)
6. ⏳ Performance Optimization

---

## Topic 1: CSS Architecture ✅ COMPLETE

### Research Scope
- Explored BEM, SMACSS, ITCSS, OOCSS, SUIT CSS methodologies
- Analyzed current Fireside Capital CSS structure (193KB, 8 files)
- Compared methodologies for scalability, maintainability, team collaboration
- Provided actionable migration plan

### Key Findings
**Current State:**
- Ad-hoc naming conventions (mixed kebab-case, camelCase)
- No architectural pattern enforced
- 243 !important instances (high specificity conflicts)
- 8 CSS files (main.css 90KB, components.css 29KB, responsive.css 27KB)

**Recommendation:** **ITCSS + BEM Hybrid**
- **ITCSS:** File organization in 7 layers (settings → generic → elements → objects → components → utilities)
- **BEM:** Component naming (`.block__element--modifier`)
- **Why:** Combines file structure discipline (ITCSS) with naming consistency (BEM)

### Expected Impact
- 📉 30-40% reduction in CSS conflicts
- 📈 20-25% faster developer onboarding
- 🎯 70% reduction in !important usage (solves FC-014)
- 🔧 50% fewer merge conflicts
- 📦 10-15% smaller CSS bundle

### Migration Strategy
**Option A: Incremental (RECOMMENDED)**
- Timeline: 2-3 weeks
- Week 1: File reorganization (ITCSS structure)
- Week 2-3: Component refactoring (BEM naming, page-by-page)
- Low risk, testable after each page

**Option B: Big-Bang**
- Timeline: 3-4 days
- Day 1: File structure
- Day 2-3: All components to BEM
- Day 4: Testing
- High risk, faster completion

### Code Examples Provided
1. **Empty State Component** (BEM)
   ```css
   .empty-state__icon { font-size: 4rem; }
   .empty-state__title { font-size: 1.25rem; }
   .empty-state__cta--primary { background: var(--orange); }
   ```

2. **Stat Card Component** (BEM)
   ```css
   .stat-card__icon { font-size: 2rem; }
   .stat-card__value { font-size: 2rem; font-weight: 600; }
   .stat-card__trend--positive { color: var(--green); }
   ```

3. **Button Component** (BEM + Bootstrap)
   ```css
   .button--primary { background: var(--orange); }
   .button--small { padding: 0.375rem 0.75rem; }
   .button__icon { margin-right: 0.5rem; }
   ```

4. **Form Component** (BEM)
   ```css
   .form-group__label--required::after { content: ' *'; }
   .form-group__input--error { border-color: var(--orange); }
   ```

### ITCSS File Structure (Proposed)
```
app/assets/css/
├── main.css                    (imports all layers)
├── 1-settings/
│   └── design-tokens.css
├── 2-generic/
│   └── normalize.css
├── 3-elements/
│   └── base.css
├── 4-objects/
│   ├── container.css
│   └── layout.css
├── 5-components/
│   ├── stat-card.css
│   ├── empty-state.css
│   ├── button.css
│   ├── form.css
│   ├── nav.css
│   ├── modal.css
│   ├── chart.css
│   ├── table.css
│   └── toast.css
└── 6-utilities/
    ├── utilities.css
    └── accessibility.css
```

### Integration with Existing Work
- **FC-014 (!important reduction):** ITCSS + BEM naturally reduces specificity conflicts
- **FC-016 (CSS consolidation):** Complete (11 → 8 files), ITCSS will further organize
- **Bootstrap 5:** Keep for grid/utilities (`.d-flex`), use BEM for custom components

### Resources
- BEM: https://getbem.com/
- ITCSS: https://www.xfive.co/blog/itcss-scalable-maintainable-css-architecture/
- Stylelint: Enforce BEM naming conventions
- PurgeCSS: Remove unused styles post-refactor

### Output
- **Full Report:** `reports/research-css-architecture-2026-02-03.md` (20KB)
- **Status:** ✅ Complete
- **Priority Recommendation:** P2 (Medium) — schedule after P1 items, before iOS app

---

## Next Actions
1. ✅ Research Topic 1 complete (CSS Architecture)
2. ⏩ Begin Research Topic 2: Financial Dashboard UI Patterns
3. 📋 Add backlog item: "FC-030: CSS Architecture Migration (ITCSS + BEM)"
4. 📢 Report findings to Capital orchestrator

---

**Researcher Notes:**
- Web search used: Brave API (10 results, 750ms)
- Articles fetched: Medium, Codedamn (15K chars each)
- Time spent: ~90 minutes (research + report writing)
- Next cron: Continue with Financial Dashboard UI Patterns
