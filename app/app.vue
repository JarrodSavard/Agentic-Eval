<template>
  <div>
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header">
      <NuxtLink to="/" class="brand" aria-label="Road Test home"
        ><svg viewBox="0 0 36 36" aria-hidden="true" width="35" height="35">
          <path
            d="M5 24v-8l4-7h18l4 7v8H5ZM6 16h24M10 24v4M26 24v4"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linejoin="round"
          />
          <circle cx="11" cy="20" r="1.5" />
          <circle cx="25" cy="20" r="1.5" /></svg
        ><span>Road Test<small>AI booking challenge</small></span></NuxtLink
      >
      <nav aria-label="Main navigation">
        <NuxtLink to="/compare">Comparison</NuxtLink><NuxtLink to="/replay">Replay</NuxtLink
        ><NuxtLink to="/scenarios">Test cases</NuxtLink
        ><NuxtLink to="/methodology">How it works</NuxtLink><NuxtLink to="/live">Live</NuxtLink>
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
      <span>Built by Jarrod Savard</span><span>Made-up cars. Real AI decisions.</span
      ><a href="https://github.com/JarrodSavard/Agentic-Eval/blob/main/LICENSE"
        >© 2026 Jarrod Savard · All rights reserved</a
      >
    </footer>
  </div>
</template>
