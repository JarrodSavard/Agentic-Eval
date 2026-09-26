<template>
  <div>
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header">
      <NuxtLink to="/" class="brand" aria-label="Observatory home"
        ><svg viewBox="0 0 36 36" aria-hidden="true" width="35" height="35">
          <circle cx="18" cy="18" r="12" fill="none" stroke="currentColor" stroke-width="1.2" />
          <path d="M4 25 30 9M8 29 27 5" stroke="currentColor" stroke-width="1.2" />
          <circle cx="18" cy="18" r="3.5" fill="currentColor" /></svg
        ><span>Observatory<small>Agent Reliability Lab</small></span></NuxtLink
      >
      <nav aria-label="Main navigation">
        <NuxtLink to="/compare">Comparison</NuxtLink><NuxtLink to="/replay">Replay</NuxtLink
        ><NuxtLink to="/scenarios">Scenarios</NuxtLink
        ><NuxtLink to="/methodology">Methodology</NuxtLink>
      </nav>
      <a
        class="source-link"
        href="https://github.com/JarrodSavard/Agentic-Eval"
        target="_blank"
        rel="noopener noreferrer"
        >View source <ArrowIcon
      /></a>
    </header>
    <main id="main" class="site-main"><NuxtPage /></main>
    <footer class="site-footer">
      <span>Built by Jarrod Savard</span><span>A fictional world. Inspectable evidence.</span
      ><a href="https://github.com/JarrodSavard/Agentic-Eval/blob/main/LICENSE"
        >© 2026 Jarrod Savard · All rights reserved</a
      >
    </footer>
  </div>
</template>
