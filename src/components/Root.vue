<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import videos from "../assets/videos.json";

const currentVideoIndex = ref(0);
const selectedTags = ref<string[]>([]);
const videoTitle = ref("");
const videoChannel = ref("");

const allTags = (() => {
  const tagSet = new Set<string>();
  videos.forEach((video) => {
    video.tags.forEach((tag) => tagSet.add(tag));
  });
  return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
})();

const filteredVideos = computed(() => {
  if (selectedTags.value.length === 0) return videos;
  return videos.filter((video) =>
    video.tags.some((tag) => selectedTags.value.includes(tag)),
  );
});

const videoIds = computed(() => filteredVideos.value.map((video) => video.id));
const hasVideos = computed(() => videoIds.value.length > 0);
const currentVideoId = computed(() => {
  if (!hasVideos.value) return "";
  const maxIndex = videoIds.value.length - 1;
  const safeIndex = Math.min(Math.max(0, currentVideoIndex.value), maxIndex);
  return videoIds.value[safeIndex] ?? "";
});
const isVideoVisible = ref(false);

const handleVideoEnd = () => {
  if (videoIds.value.length === 0) return;
  currentVideoIndex.value =
    (currentVideoIndex.value + 1) % videoIds.value.length;
};

let player: any = null;
let isYouTubeApiLoading = false;
let isYouTubeApiLoaded = false;
let isPlayerReady = false;
let isIframeLoaded = false;

const loadYouTubeApi = () => {
  if (isYouTubeApiLoaded || isYouTubeApiLoading) return;
  isYouTubeApiLoading = true;

  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  const firstScriptTag = document.getElementsByTagName("script")[0];
  firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

  (window as any).onYouTubeIframeAPIReady = () => {
    isYouTubeApiLoaded = true;
    // Try to setup player if iframe is already loaded
    if (isIframeLoaded) {
      setupPlayer();
    }
  };
};

const setupPlayer = () => {
  const iframe = document.querySelector("iframe");
  if (!iframe) {
    return;
  }

  if (player?.destroy) {
    player.destroy();
  }
  isPlayerReady = false;

  player = new (window as any).YT.Player(iframe, {
    events: {
      onReady: (event: any) => {
        isPlayerReady = true;
        // Disable captions
        try {
          const options = event.target.getOptions();
          if (options.includes('cc')) {
            event.target.unloadModule('cc');
          }
          event.target.setOption('captions', 'track', {});
        } catch (e) {
          console.log('Could not disable captions:', e);
        }
        // Fetch video details
        try {
          const videoData = event.target.getVideoData();
          videoTitle.value = videoData.title || "";
          videoChannel.value = videoData.author || "";
        } catch (e) {
          console.log('Could not fetch video details:', e);
        }
      },
      onStateChange: (event: any) => {
        // YT.PlayerState.ENDED = 0
        if (event.data === 0) {
          handleVideoEnd();
        }
      },
    },
  });
};

const setupVideoEndListener = () => {
  isIframeLoaded = true;
  // Only setup player if YouTube API is ready
  if ((window as any).YT && (window as any).YT.Player) {
    setupPlayer();
  }
};

const selectRandomIndex = () => {
  if (videoIds.value.length === 0) {
    currentVideoIndex.value = 0;
    return;
  }
  currentVideoIndex.value = Math.floor(Math.random() * videoIds.value.length);
};

const handleStartVideo = () => {
  selectRandomIndex();
  isVideoVisible.value = true;
  loadYouTubeApi();
};

const handleKeyPress = (event: KeyboardEvent) => {
  if (!isVideoVisible.value || videoIds.value.length === 0) return;
  if (event.key === "ArrowUp") {
    // Previous video
    currentVideoIndex.value =
      (currentVideoIndex.value - 1 + videoIds.value.length) %
      videoIds.value.length;
  } else if (event.key === "ArrowDown") {
    // Next video
    currentVideoIndex.value =
      (currentVideoIndex.value + 1) % videoIds.value.length;
  } else if (event.key === "ArrowRight") {
    seekBy(10);
  } else if (event.key === "ArrowLeft") {
    seekBy(-10);
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleKeyPress);
  selectRandomIndex();
});

const seekBy = (deltaSeconds: number) => {
  if (!isPlayerReady || !player?.getCurrentTime || !player?.seekTo) return;
  const currentTime = player.getCurrentTime();
  const duration = player.getDuration?.() ?? 0;
  const unclamped = currentTime + deltaSeconds;
  const nextTime =
    duration > 0
      ? Math.min(Math.max(0, unclamped), duration)
      : Math.max(0, unclamped);
  player.seekTo(nextTime, true);
};

watch(filteredVideos, (nextVideos) => {
  if (nextVideos.length === 0) {
    currentVideoIndex.value = 0;
    return;
  }
  if (currentVideoIndex.value >= nextVideos.length) {
    selectRandomIndex();
  }
});

watch(currentVideoId, () => {
  // Reset iframe loaded state when video changes (iframe recreates due to :key)
  isIframeLoaded = false;
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyPress);
});
</script>

<template>
  <section class="relative h-screen w-screen overflow-hidden bg-black">
    <div class="absolute left-0 top-0 z-10 w-full p-4">
      <div
        class="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 rounded-full border border-white/15 bg-black/60 px-4 py-2 text-white backdrop-blur"
      >
        <div class="flex items-center gap-3 min-w-0 flex-1">
          <div class="text-xs uppercase tracking-[0.2em] text-white font-bold whitespace-nowrap">
            Takeoff
          </div>
          <transition name="fade">
            <div v-if="isVideoVisible && (videoTitle || videoChannel)" class="flex items-center gap-2 min-w-0 flex-1">
              <div class="w-px h-4 bg-white/20"></div>
              <div class="marquee-container">
                <div class="marquee-content">
                  <span class="text-xs text-white/90 font-medium whitespace-nowrap">
                    {{ videoTitle }}
                  </span>
                  <span v-if="videoChannel" class="text-xs text-white/60 whitespace-nowrap ml-2">
                    • {{ videoChannel }}
                  </span>
                </div>
              </div>
            </div>
          </transition>
        </div>
        <div class="flex items-center gap-3 flex-shrink-0">
          <a
            v-if="currentVideoId"
            class="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white/90 hover:border-white/40 hover:text-white"
            :href="`https://www.youtube.com/watch?v=${currentVideoId}`"
            target="_blank"
            rel="noreferrer"
          >
            Open Video
          </a>
          <details class="relative">
            <summary
              class="cursor-pointer select-none rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white/90 hover:border-white/40"
            >
              Tags ({{ selectedTags.length }})
            </summary>
            <div
              class="absolute right-0 mt-2 w-64 rounded-2xl border border-white/10 bg-black/90 p-3 text-sm text-white shadow-xl"
            >
              <div class="max-h-56 overflow-auto pr-1">
                <label
                  v-for="tag in allTags"
                  :key="tag"
                  class="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 hover:bg-white/10"
                >
                  <input
                    v-model="selectedTags"
                    type="checkbox"
                    :value="tag"
                    class="h-4 w-4 accent-white"
                  />
                  <span class="text-white/85">{{ tag }}</span>
                </label>
              </div>
              <button
                class="mt-3 w-full rounded-full border border-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white/80 hover:border-white/40 hover:text-white"
                type="button"
                @click="selectedTags = []"
              >
                Clear
              </button>
            </div>
          </details>
        </div>
      </div>
    </div>
    <template v-if="isVideoVisible && hasVideos">
      <transition name="fade-slow">
        <div class="fixed inset-0 h-full w-full overflow-hidden">
          <iframe
            :key="currentVideoId"
            class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style="
              width: 120vw;
              height: 67.5vw;
              min-height: 120vh;
              min-width: 213.33vh;
            "
            :src="`https://www.youtube.com/embed/${currentVideoId}?autoplay=1&controls=0&showinfo=0&modestbranding=1&rel=0&disablekb=1&fs=0&iv_load_policy=3&enablejsapi=1&cc_load_policy=0`"
            title="YouTube video player"
            frameborder="0"
            allow="
              accelerometer;
              autoplay;
              clipboard-write;
              encrypted-media;
              gyroscope;
              picture-in-picture;
              web-share;
            "
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen
            @load="setupVideoEndListener"
          ></iframe>
        </div>
      </transition>
    </template>
    <template v-else-if="isVideoVisible && !hasVideos">
      <div
        class="relative z-1 flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center text-white"
      >
        <h2 class="text-xl font-semibold">No videos match those tags.</h2>
        <p class="text-white/70">Try clearing or adjusting your filters.</p>
        <button
          class="rounded-full border border-white/20 px-5 py-2 text-xs font-semibold uppercase tracking-widest text-white/80 hover:border-white/40 hover:text-white"
          type="button"
          @click="selectedTags = []"
        >
          Clear Filters
        </button>
      </div>
    </template>
    <template v-else>
      <div
        class="relative z-1 flex h-full w-full flex-col items-center justify-center gap-4 p-6 text-center"
      >
        <h1 class="text-4xl font-bold text-white text-shadow-lg">Takeoff</h1>
        <p class="text-white text-shadow-lg">
          Airplane videos while you work / study / relax
        </p>
        <button
          class="rounded-full bg-white/90 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-black transition hover:bg-white cursor-pointer"
          type="button"
          @click="handleStartVideo"
        >
          Gear up →
        </button>
      </div>
    </template>
  </section>
</template>

<style scoped>
.fade-slow-enter-active,
.fade-slow-leave-active {
  transition: opacity 1.6s ease;
}

.fade-slow-enter-from,
.fade-slow-leave-to {
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.marquee-container {
  overflow: hidden;
  position: relative;
  min-width: 0;
  flex: 1;
  max-width: 400px;
  -webkit-mask-image: linear-gradient(to right, transparent, black 30px, black calc(100% - 30px), transparent);
  mask-image: linear-gradient(to right, transparent, black 30px, black calc(100% - 30px), transparent);
}

.marquee-content {
  display: inline-block;
  padding-left: 100%;
  animation: marquee 20s linear infinite;
}

.marquee-content:hover {
  animation-play-state: paused;
}

@keyframes marquee {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(-100%, 0);
  }
}
</style>
