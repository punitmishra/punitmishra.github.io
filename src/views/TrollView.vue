<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

/* ------------------------------ cowsay engine ----------------------------- */
// Word-wrap a message to a max column width (classic cowsay default is 40).
function wrapText(text, width = 40) {
  const words = String(text).split(/\s+/).filter(Boolean);
  if (!words.length) return [""];
  const lines = [];
  let line = "";
  for (let word of words) {
    // Hard-split any single word longer than the bubble.
    while (word.length > width) {
      if (line) {
        lines.push(line);
        line = "";
      }
      lines.push(word.slice(0, width));
      word = word.slice(width);
    }
    if (!line) line = word;
    else if ((line + " " + word).length <= width) line += " " + word;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

// Build the speech bubble. One line uses < >, multiple lines use / \ | | \ /.
function speechBubble(text) {
  const lines = wrapText(text, 40);
  const width = Math.max(...lines.map((l) => l.length));
  const top = " " + "_".repeat(width + 2);
  const bottom = " " + "-".repeat(width + 2);
  const body = lines.map((l, i) => {
    const padded = l.padEnd(width, " ");
    let left = "|";
    let right = "|";
    if (lines.length === 1) {
      left = "<";
      right = ">";
    } else if (i === 0) {
      left = "/";
      right = "\\";
    } else if (i === lines.length - 1) {
      left = "\\";
      right = "/";
    }
    return `${left} ${padded} ${right}`;
  });
  return [top, ...body, bottom].join("\n");
}

function cowBody(eyes = "oo") {
  const e = (String(eyes) + "oo").slice(0, 2);
  return [
    "        \\   ^__^",
    `         \\  (${e})\\_______`,
    "            (__)\\       )\\/\\",
    "                ||----w |",
    "                ||     ||",
  ].join("\n");
}

function cowsay(message, eyes = "oo") {
  return speechBubble(message) + "\n" + cowBody(eyes);
}

/* -------------------------------- reactive -------------------------------- */
const prompt = "you@your-mac ~ % ";
const fullCommand = 'cowsay "you have been p0wned"';
const typedCommand = ref("");
const commandDone = ref(false);
const showCow = ref(false);
const poweringOff = ref(false);
const rainbow = ref(false);
const hintVisible = ref(false);

const taunts = [
  "you have been p0wned",
  "yes, this is your real computer",
  "you left it unlocked. classic.",
  "i could have emailed your boss",
  "a friendly reminder from a cow:",
  "L O C K   Y O U R   S C R E E N",
  "moo. ha. ha.",
  "ok, i'll stop. lock it next time.",
];
const taunt = ref(0);
const eyes = ref("oo");

const cowLines = computed(() => cowsay(taunts[taunt.value], eyes.value).split("\n"));

/* ------------------------------ timers / loop ----------------------------- */
const reduceMotion =
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let cancelled = false;
const timers = new Set();
const intervals = new Set();

function track(id) {
  timers.add(id);
  return id;
}
const wait = (ms) =>
  new Promise((resolve) => {
    const id = track(
      setTimeout(() => {
        timers.delete(id);
        resolve();
      }, ms),
    );
  });

async function runSequence() {
  await wait(reduceMotion ? 120 : 520);
  for (let i = 0; i < fullCommand.length; i++) {
    if (cancelled) return;
    typedCommand.value += fullCommand[i];
    // Human-ish typing cadence; small pause after the space before the quote.
    const jitter = reduceMotion ? 10 : 45 + Math.random() * 75;
    await wait(jitter);
  }
  commandDone.value = true;
  await wait(reduceMotion ? 120 : 460);
  if (cancelled) return;
  showCow.value = true;

  await wait(1500);
  if (cancelled) return;

  // Blink.
  intervals.add(
    setInterval(() => {
      if (cancelled) return;
      eyes.value = "--";
      const blinkId = track(
        setTimeout(() => {
          timers.delete(blinkId);
          eyes.value = eyes.value === "--" ? "oo" : eyes.value;
        }, 140),
      );
    }, 4200),
  );

  // Rotate the taunts so the bubble re-renders and the cow feels alive.
  intervals.add(
    setInterval(() => {
      if (cancelled) return;
      taunt.value = (taunt.value + 1) % taunts.length;
    }, 3600),
  );
}

/* ----------------------------- troll mechanics ---------------------------- */
let interacted = false;
let audioCtx = null;

function beep() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    audioCtx = audioCtx || new Ctx();
    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.setValueAtTime(440, t + 0.09);
    gain.gain.setValueAtTime(0.05, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.24);
  } catch {
    /* audio is a nice-to-have */
  }
}

async function goFullscreen() {
  try {
    const el = document.documentElement;
    const request = el.requestFullscreen || el.webkitRequestFullscreen;
    const current = document.fullscreenElement || document.webkitFullscreenElement;
    if (!current && request) await request.call(el);
  } catch {
    /* the browser may refuse; that's fine */
  }
}

// Exit fullscreen across vendors, swallowing the returned promise's rejection
// (exitFullscreen() rejects, it does not throw synchronously).
function exitFullscreenSafe() {
  try {
    const current = document.fullscreenElement || document.webkitFullscreenElement;
    const exit = document.exitFullscreen || document.webkitExitFullscreen;
    if (current && exit) {
      const result = exit.call(document);
      if (result && typeof result.catch === "function") result.catch(() => {});
    }
  } catch {
    /* ignore */
  }
}

function surprise() {
  eyes.value = "OO";
  const id = track(
    setTimeout(() => {
      timers.delete(id);
      eyes.value = eyes.value === "OO" ? "oo" : eyes.value;
    }, 900),
  );
}

function firstInteract() {
  if (interacted) return;
  interacted = true;
  goFullscreen();
  beep();
  surprise();
}

const KONAMI = [
  "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
  "b", "a",
];
let konami = [];
let typedBuffer = "";
let escTimer = null;
let titleObserver = null;
let leaveTimer = null;
let leaving = false;

function onKeydown(e) {
  firstInteract();

  if (e.key === "Escape") {
    if (!escTimer) escTimer = setTimeout(leave, 1200);
    return;
  }

  const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  konami.push(key);
  if (konami.length > KONAMI.length) konami.shift();
  if (konami.length === KONAMI.length && konami.every((v, i) => v === KONAMI[i])) {
    rainbow.value = true;
  }

  if (e.key.length === 1) {
    typedBuffer = (typedBuffer + e.key.toLowerCase()).slice(-12);
    if (typedBuffer.endsWith("exit") || typedBuffer.endsWith("unlock")) leave();
  }
}

function onKeyup(e) {
  if (e.key === "Escape" && escTimer) {
    clearTimeout(escTimer);
    escTimer = null;
  }
}

function onPointerdown() {
  firstInteract();
}

/* -------------------------------- teardown -------------------------------- */
function clearAll() {
  cancelled = true;
  timers.forEach(clearTimeout);
  intervals.forEach(clearInterval);
  timers.clear();
  intervals.clear();
  if (escTimer) {
    clearTimeout(escTimer);
    escTimer = null;
  }
  if (titleObserver) {
    titleObserver.disconnect();
    titleObserver = null;
  }
  if (leaveTimer) {
    clearTimeout(leaveTimer);
    leaveTimer = null;
  }
}

function leave() {
  if (leaving) return;
  leaving = true;
  clearAll();
  exitFullscreenSafe();
  // Read the motion preference live so a mid-session toggle is honored.
  const prefersReduced =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) {
    router.push("/");
    return;
  }
  poweringOff.value = true;
  leaveTimer = setTimeout(() => router.push("/"), 650);
}

onMounted(() => {
  // Hold a bare "compromised" title for the duration of the prank. The router's
  // SEO afterEach hook also writes document.title on navigation and, because this
  // view is a lazy async component, it can run *after* onMounted — so a one-shot
  // assignment races and loses. A MutationObserver re-asserts our title whenever
  // anything rewrites it while mounted; clearAll() disconnects it before we
  // navigate away, so the destination route keeps its own SEO title. We
  // deliberately never "restore" a previous title.
  const SCARY_TITLE = "⚠ SYSTEM COMPROMISED";
  const keepTitle = () => {
    if (document.title !== SCARY_TITLE) document.title = SCARY_TITLE;
  };
  keepTitle();
  const titleEl = document.querySelector("title");
  if (titleEl && typeof MutationObserver !== "undefined") {
    titleObserver = new MutationObserver(keepTitle);
    titleObserver.observe(titleEl, {
      childList: true,
      characterData: true,
      subtree: true,
    });
  }
  window.addEventListener("keydown", onKeydown);
  window.addEventListener("keyup", onKeyup);
  window.addEventListener("pointerdown", onPointerdown);

  // Nobody should ever be truly stuck. On touch / no-keyboard devices the typed
  // and Escape escapes can't be used, so reveal the exit button quickly there;
  // on desktop keep it a subtle last resort that appears after a while.
  const coarsePointer =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(hover: none), (pointer: coarse)").matches;
  track(setTimeout(() => (hintVisible.value = true), coarsePointer ? 2500 : 18000));

  runSequence();
});

onBeforeUnmount(() => {
  clearAll();
  window.removeEventListener("keydown", onKeydown);
  window.removeEventListener("keyup", onKeyup);
  window.removeEventListener("pointerdown", onPointerdown);
  exitFullscreenSafe();
  if (audioCtx) {
    try {
      audioCtx.close();
    } catch {
      /* ignore */
    }
    audioCtx = null;
  }
});
</script>

<template>
  <div
    class="troll"
    :class="{ 'is-rainbow': rainbow, 'power-off': poweringOff }"
  >
    <p class="sr-only">
      This is a harmless prank "terminal" page. To leave, type the word "exit",
      press and hold the Escape key, or use the exit button.
    </p>

    <div
      class="crt"
      aria-hidden="true"
    >
      <div class="screen">
        <div class="term">
          <div class="line dim">
            Last login: a moment too late on ttys001
          </div>
          <div class="line dim">
            guest left this screen unlocked while you stepped away for coffee  c[_]
          </div>
          <div class="line blank">
&nbsp;
          </div>
          <div class="line">
            <span class="prompt">{{ prompt }}</span><span class="cmd">{{ typedCommand }}</span><span
              v-if="!commandDone"
              class="cursor"
            >&#9611;</span>
          </div>
          <template v-if="showCow">
            <div class="line blank">
&nbsp;
            </div>
            <div
              v-for="(l, i) in cowLines"
              :key="i"
              class="line cow"
            >
              {{ l || " " }}
            </div>
            <div class="line blank">
&nbsp;
            </div>
            <div class="line">
              <span class="prompt">{{ prompt }}</span><span class="cursor">&#9611;</span>
            </div>
          </template>
        </div>
      </div>

      <div
        class="scanlines"
        aria-hidden="true"
      />
      <div
        class="vignette"
        aria-hidden="true"
      />
      <div
        v-if="rainbow"
        class="party"
        aria-hidden="true"
      >
        &#127752;  P A R T Y   C O W   M O D E  &#127881;
      </div>
    </div>

    <button
      v-if="hintVisible"
      class="hint"
      type="button"
      @click="leave"
    >
      psst &mdash; type &ldquo;exit&rdquo; or tap here to wake up
    </button>
  </div>
</template>

<style scoped>
.troll {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: #050a05;
  color: #35ff6d;
  font-family: "JetBrains Mono", "Fira Code", ui-monospace, "SF Mono", monospace;
  overflow: hidden;
  cursor: default;
  user-select: none;
  -webkit-user-select: none;
}

.crt {
  position: absolute;
  inset: 0;
  transform-origin: center;
}

.screen {
  position: absolute;
  inset: 0;
  padding: clamp(1rem, 4vw, 3rem);
  overflow: auto;
  animation: flicker 3s infinite;
}

.term {
  font-size: clamp(0.62rem, min(2.6vw, 2.6vh), 1.6rem);
  line-height: 1.35;
  text-shadow:
    0 0 2px rgba(53, 255, 109, 0.85),
    0 0 10px rgba(53, 255, 109, 0.45);
  letter-spacing: 0.5px;
}

.line {
  white-space: pre;
  min-height: 1.35em;
}

.line.blank {
  color: transparent;
}

.dim {
  color: #1f9c47;
}

.prompt {
  color: #7ee787;
}

.cmd {
  color: #e9ffee;
}

.cow {
  color: #35ff6d;
}

.cursor {
  animation: blink 1s steps(1) infinite;
}

/* CRT overlays -------------------------------------------------------------- */
.scanlines {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 0,
    rgba(0, 0, 0, 0) 2px,
    rgba(0, 0, 0, 0.18) 3px,
    rgba(0, 0, 0, 0.18) 4px
  );
  opacity: 0.55;
}

.scanlines::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  top: -25vh;
  height: 22vh;
  background: linear-gradient(
    to bottom,
    rgba(53, 255, 109, 0) 0%,
    rgba(53, 255, 109, 0.07) 50%,
    rgba(53, 255, 109, 0) 100%
  );
  animation: scan 7s linear infinite;
}

.vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(
    120% 120% at 50% 50%,
    rgba(0, 0, 0, 0) 55%,
    rgba(0, 0, 0, 0.55) 100%
  );
}

/* Konami party mode --------------------------------------------------------- */
.is-rainbow .cow {
  animation: hue 1.4s linear infinite;
}

.party {
  position: absolute;
  top: clamp(0.5rem, 2vw, 1.5rem);
  left: 50%;
  transform: translateX(-50%);
  color: #fff;
  font-weight: 700;
  letter-spacing: 3px;
  white-space: nowrap;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.7);
  animation: hue 1.4s linear infinite;
}

/* Exit hint ----------------------------------------------------------------- */
.hint {
  position: absolute;
  bottom: clamp(0.75rem, 2vw, 1.5rem);
  right: clamp(0.75rem, 2vw, 1.5rem);
  padding: 0.35rem 0.6rem;
  font-family: inherit;
  font-size: 0.72rem;
  color: rgba(53, 255, 109, 0.5);
  background: transparent;
  border: 1px solid rgba(53, 255, 109, 0.25);
  border-radius: 0.3rem;
  cursor: pointer;
  opacity: 0;
  animation: fade-in 1.2s ease forwards;
}

.hint:hover,
.hint:focus-visible {
  color: rgba(53, 255, 109, 0.95);
  border-color: rgba(53, 255, 109, 0.55);
}

.hint:focus-visible {
  outline: 2px solid rgba(53, 255, 109, 0.9);
  outline-offset: 2px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Animations ---------------------------------------------------------------- */
@keyframes blink {
  50% {
    opacity: 0;
  }
}

@keyframes flicker {
  0%,
  100% {
    opacity: 1;
  }
  7% {
    opacity: 0.96;
  }
  9% {
    opacity: 1;
  }
  52% {
    opacity: 0.985;
  }
  54% {
    opacity: 1;
  }
}

@keyframes scan {
  0% {
    top: -25vh;
  }
  100% {
    top: 120vh;
  }
}

@keyframes hue {
  from {
    filter: hue-rotate(0deg) saturate(1.7);
  }
  to {
    filter: hue-rotate(360deg) saturate(1.7);
  }
}

@keyframes fade-in {
  to {
    opacity: 1;
  }
}

.power-off .crt {
  animation: power-off 0.6s cubic-bezier(0.2, 0.7, 0.2, 1) forwards;
}

.power-off .hint {
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

@keyframes power-off {
  0% {
    transform: scale(1, 1);
    filter: brightness(1);
  }
  55% {
    transform: scale(1, 0.006);
    filter: brightness(3);
  }
  70% {
    transform: scale(1, 0.006);
    filter: brightness(3);
  }
  100% {
    transform: scale(0, 0.006);
    filter: brightness(8);
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .screen {
    animation: none;
  }
  .scanlines::after {
    display: none;
  }
  .cursor,
  .is-rainbow .cow,
  .party {
    animation: none;
  }
  .power-off .crt {
    animation: none;
    opacity: 0;
  }
}
</style>
