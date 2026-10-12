var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/videos.ts
var videos = [
  {
    "id": "a9o-PE-DLNA",
    "tags": ["pilot-pov", "takeoff", "landing", "cockpit-view"],
    "duration": 1082
  },
  {
    "id": "16XTAK-4Xbk",
    "tags": ["pilot-pov", "takeoff", "cockpit-view"],
    "duration": 300
  },
  {
    "id": "y31o3NYIccA",
    "tags": ["passenger-pov", "takeoff", "landing", "window-view"],
    "duration": 8196
  },
  {
    "id": "it4v-v-bOsY",
    "tags": ["pilot-pov", "takeoff", "landing", "cockpit-view"],
    "duration": 1634
  },
  {
    "id": "phCM8bW5r9Y",
    "tags": ["pilot-pov", "takeoff", "cockpit-view", "atc-audio"],
    "duration": 765
  },
  {
    "id": "TA4Op5V_vBk",
    "tags": ["pilot-pov", "takeoff", "cockpit-view", "atc-audio"],
    "duration": 775
  },
  {
    "id": "6MADRBeTbfM",
    "tags": ["pilot-pov", "landing", "cockpit-view", "atc-audio"],
    "duration": 991
  },
  {
    "id": "N-2dtcCtG3E",
    "tags": ["pilot-pov", "takeoff", "cockpit-view", "4k"],
    "duration": 419
  },
  {
    "id": "8WD949xs1Tg",
    "tags": ["pilot-pov", "landing", "cockpit-view", "4k"],
    "duration": 1618
  },
  {
    "id": "twMJvl4BUXw",
    "tags": ["pilot-pov", "landing", "night-landing", "cockpit-view"],
    "duration": 107
  },
  {
    "id": "RHfTHut1-90",
    "tags": ["pilot-pov", "landing", "night-landing", "cockpit-view"],
    "duration": 965
  },
  {
    "id": "JyxRuVdh2YI",
    "tags": ["pilot-pov", "landing", "cockpit-view"],
    "duration": 513
  },
  {
    "id": "7g0xL88ebXs",
    "tags": ["pilot-pov", "landing", "cockpit-view"],
    "duration": 851
  },
  {
    "id": "ENd45qUr_i4",
    "tags": ["pilot-pov", "landing", "cockpit-view"],
    "duration": 368
  },
  {
    "id": "LWVZK52AA0I",
    "tags": ["pilot-pov", "takeoff", "cockpit-view"],
    "duration": 1907
  },
  {
    "id": "4B8CXSkewaU",
    "tags": ["pilot-pov", "landing", "cockpit-view", "turbulent-landing"],
    "duration": 113
  },
  {
    "id": "CJazNzpZPcQ",
    "tags": ["passenger-pov", "takeoff", "window-view"],
    "duration": 186
  },
  {
    "id": "vSoizDaVfak",
    "tags": ["passenger-pov", "takeoff", "window-view"],
    "duration": 164
  },
  {
    "id": "TRhS4Eq6qz0",
    "tags": ["passenger-pov", "landing", "window-view"],
    "duration": 238
  },
  {
    "id": "DnyoxoH3VKw",
    "tags": ["passenger-pov", "landing", "window-view", "nose-cam"],
    "duration": 173
  },
  {
    "id": "lwa6TT0p85Y",
    "tags": ["passenger-pov", "takeoff", "window-view"],
    "duration": 149
  },
  {
    "id": "eCoyajzDUBY",
    "tags": ["pilot-pov", "landing", "cockpit-view"],
    "duration": 612
  },
  {
    "id": "uDVTm1Xbc9k",
    "tags": ["pilot-pov", "takeoff", "cockpit-view"],
    "duration": 1136
  },
  {
    "id": "ZelrHEDOU_M",
    "tags": ["pilot-pov", "takeoff", "cockpit-view"],
    "duration": 1741
  },
  {
    "id": "BY8ND4vW8JI",
    "tags": ["pilot-pov", "takeoff", "landing", "cockpit-view"],
    "duration": 3485
  },
  {
    "id": "dv5F_vb1Uvs",
    "tags": ["pilot-pov", "takeoff", "cockpit-view", "challenging-approach"],
    "duration": 640
  },
  {
    "id": "4VtHiSE-w3M",
    "tags": ["pilot-pov", "landing", "cockpit-view", "challenging-approach"],
    "duration": 395
  },
  {
    "id": "4kDaeZeyliw",
    "tags": ["pilot-pov", "landing", "cockpit-view", "historic"],
    "duration": 161
  },
  {
    "id": "ENe89j89tBA",
    "tags": ["pilot-pov", "landing", "cockpit-view", "a380"],
    "duration": 622
  },
  {
    "id": "5wjoF8-Oaew",
    "tags": ["pilot-pov", "takeoff", "cockpit-view", "heavy-rain"],
    "duration": 829
  },
  {
    "id": "_zixZ-zxEEQ",
    "tags": ["pilot-pov", "landing", "cockpit-view", "a320neo"],
    "duration": 780
  },
  {
    "id": "-hhSJ0d9-N0",
    "tags": ["pilot-pov", "takeoff", "cockpit-view", "heavy-takeoff"],
    "duration": 297
  },
  {
    "id": "J-w-LK5tURI",
    "tags": ["pilot-pov", "landing", "cockpit-view", "night-landing"],
    "duration": 258
  }
];

// src/playback-state.ts
var PlaybackState = class {
  constructor(state) {
    this.playbackData = null;
    this.state = state;
  }
  static {
    __name(this, "PlaybackState");
  }
  async fetch(request) {
    const url = new URL(request.url);
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    try {
      if (url.pathname === "/state" && request.method === "GET") {
        return this.getState(corsHeaders);
      }
      if (url.pathname === "/heartbeat" && request.method === "POST") {
        return this.heartbeat(corsHeaders);
      }
      return new Response("Not found", { status: 404, headers: corsHeaders });
    } catch (error) {
      return new Response(JSON.stringify({ error: String(error) }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  }
  async getState(corsHeaders) {
    if (!this.playbackData) {
      const stored = await this.state.storage.get("playback");
      if (stored) {
        this.playbackData = stored;
      } else {
        this.playbackData = {
          currentVideoIndex: 0,
          currentPosition: 0,
          lastUpdated: Date.now(),
          viewers: 0
        };
        await this.state.storage.put("playback", this.playbackData);
      }
    }
    const now = Date.now();
    const elapsedSeconds = (now - this.playbackData.lastUpdated) / 1e3;
    let position = this.playbackData.currentPosition + elapsedSeconds;
    let videoIndex = this.playbackData.currentVideoIndex;
    while (position >= videos[videoIndex].duration) {
      position -= videos[videoIndex].duration;
      videoIndex = (videoIndex + 1) % videos.length;
    }
    const currentVideo = videos[videoIndex];
    return new Response(
      JSON.stringify({
        videoId: currentVideo.id,
        videoIndex,
        position: Math.floor(position),
        duration: currentVideo.duration,
        tags: currentVideo.tags,
        viewers: this.playbackData.viewers,
        serverTime: now
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  }
  async heartbeat(corsHeaders) {
    if (!this.playbackData) {
      const stored = await this.state.storage.get("playback");
      if (stored) {
        this.playbackData = stored;
      } else {
        this.playbackData = {
          currentVideoIndex: 0,
          currentPosition: 0,
          lastUpdated: Date.now(),
          viewers: 0
        };
      }
    }
    this.playbackData.viewers += 1;
    await this.state.storage.put("playback", this.playbackData);
    setTimeout(async () => {
      if (this.playbackData) {
        this.playbackData.viewers = Math.max(0, this.playbackData.viewers - 1);
        await this.state.storage.put("playback", this.playbackData);
      }
    }, 3e4);
    return new Response(JSON.stringify({ success: true }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
};

// src/index.ts
var src_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    try {
      if (url.pathname === "/api/videos") {
        return new Response(JSON.stringify(videos), {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        });
      }
      if (url.pathname === "/api/playback") {
        const id = env.PLAYBACK_STATE.idFromName("global");
        const stub = env.PLAYBACK_STATE.get(id);
        return stub.fetch(new Request(new URL("/state", request.url)));
      }
      if (url.pathname === "/api/heartbeat" && request.method === "POST") {
        const id = env.PLAYBACK_STATE.idFromName("global");
        const stub = env.PLAYBACK_STATE.get(id);
        return stub.fetch(new Request(new URL("/heartbeat", request.url), {
          method: "POST"
        }));
      }
      return new Response("Not found", {
        status: 404,
        headers: corsHeaders
      });
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: error instanceof Error ? error.message : "Unknown error"
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    }
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    const body = JSON.stringify(error);
    const headers = {
      "Content-Type": "application/json",
      "MF-Experimental-Error-Stack": "true"
    };
    const encoded = encodeURIComponent(body);
    if (encoded.length <= 8192) {
      headers["MF-Experimental-Error-Stack-Payload"] = encoded;
    }
    return new Response(body, { status: 500, headers });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-2DfiCX/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-2DfiCX/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  PlaybackState,
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
