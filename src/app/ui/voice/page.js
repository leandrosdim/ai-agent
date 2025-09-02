"use client";

import { useRef, useState } from "react";

export default function VoiceAgent() {
    const audioRef = useRef(null);

    //connection state
    const [connected, setConnected] = useState(false);
    const [pc, setPc] = useState(null);
    const [dc, setDc] = useState(null); // data channel ref
    const [status, setStatus] = useState("idle");


    // mic state
    const [micStream, setMicStream] = useState(null);
    const [micTrack, setMicTrack] = useState(null);
    const [isTalking, setIsTalking] = useState(false);

    // session controls
    const [instructions, setInstructions] = useState(
        "Είσαι ο φωνητικός μου βοηθός. Αν μιλάω ελληνικά, απάντα ελληνικά. Να είσαι σύντομος/η (10–25 δευτ.), πρακτικός/ή, χωρίς μακροσκελείς απαντήσεις."
    );
    const [voice, setVoice] = useState("alloy");
    const [speed, setSpeed] = useState(1);

    //AI talking
    const [aiTalking, setAiTalking] = useState(false);
    const [aiLevel, setAiLevel] = useState(0);
    const aiAudioCleanupRef = useRef(null);

    function log(...args) {
        console.log("[voice]", ...args);
    }

    function sendSessionUpdate(extra = {}) {
        if (!dc || dc.readyState !== "open") return;
        const payload = {
            type: "session.update",
            session: {
                instructions,
                voice,
                speed: Number(speed) || 1,
                ...extra,
            },
        };
        dc.send(JSON.stringify(payload));
        log("session.update sent:");
    }

    async function connect() {
        setStatus("fetching session…");
        //log("Start connect()");

        try {
            // 1) get ephemeral client secret from our server (server injects your base instructions)
            const secretResp = await fetch("/api/realtime/secret");
            //log("secretResp status:", secretResp.status);
            const secret = await secretResp.json();
            //log("secret payload keys:", Object.keys(secret || {}));
            const token = secret?.client_secret?.value;

            if (!token) {
                setStatus("no client secret");
                alert("Failed to get client secret");
                return;
            }

            // 2) create RTCPeerConnection
            const peer = new RTCPeerConnection();
            setPc(peer);

            // --- verbose state logs ---
            peer.onconnectionstatechange = () => setStatus(`pc: ${peer.connectionState}`);

            // remote audio (the model streams synthesized speech here) (hidden element)
            peer.ontrack = (e) => {
                const [stream] = e.streams;
                if (audioRef.current) {
                    audioRef.current.srcObject = stream;

                    // === AI speech visualizer setup ===
                    try {
                        // Clean up previous visualizer if any
                        aiAudioCleanupRef.current?.();

                        const AudioCtx = window.AudioContext || window.webkitAudioContext;
                        const ctx = new AudioCtx();
                        const source = ctx.createMediaStreamSource(stream);
                        const analyser = ctx.createAnalyser();
                        analyser.fftSize = 512; // small & fast
                        source.connect(analyser);

                        const data = new Uint8Array(analyser.frequencyBinCount);
                        let raf;

                        const tick = () => {
                            analyser.getByteTimeDomainData(data);

                            // Compute RMS loudness (0..~1)
                            let sum = 0;
                            for (let i = 0; i < data.length; i++) {
                                const v = (data[i] - 128) / 128;
                                sum += v * v;
                            }
                            const rms = Math.sqrt(sum / data.length);

                            setAiLevel(rms);
                            setAiTalking(rms > 0.035); // tweak threshold as you like (0.03–0.06)
                            raf = requestAnimationFrame(tick);
                        };
                        tick();

                        // Store cleanup so we can stop it on disconnect
                        aiAudioCleanupRef.current = () => {
                            cancelAnimationFrame(raf);
                            try { ctx.close(); } catch { }
                        };
                    } catch (e) {
                        console.warn("AI visualizer init failed:", e);
                    }

                    audioRef.current.play().catch(() => { });
                }
            };

            // data channel
            const channel = peer.createDataChannel("oai-events");
            channel.onopen = () => setDc(channel);
            channel.onclose = () => setDc(null);

            // 3)mic captured but **muted** until push-to-talk
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: { echoCancellation: true, noiseSuppression: true },
            });
            const track = stream.getAudioTracks()[0];
            track.enabled = false;
            peer.addTrack(track, stream);

            setMicStream(stream);
            setMicTrack(track);

            // 4) SDP offer → OpenAI → SDP answer
            const offer = await peer.createOffer();
            await peer.setLocalDescription(offer);
            //log("localDescription set");

            const sdpResp = await fetch(
                "https://api.openai.com/v1/realtime?model=gpt-realtime",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/sdp",
                        "OpenAI-Beta": "realtime=v1",
                    },
                    body: offer.sdp,
                }
            );

            if (!sdpResp.ok) {
                const errText = await sdpResp.text();
                log("SDP error text:", errText);
                setStatus("SDP error");
                alert("Realtime connect error:\n" + errText);
                return;
            }

            const answerSdp = await sdpResp.text();
            await peer.setRemoteDescription({ type: "answer", sdp: answerSdp });
            //log("remoteDescription set (answer)");

            setConnected(true);
            setStatus("connected — hold to talk");
        } catch (e) {
            console.error("[voice] connect exception:", e);
            setStatus("error");
            alert(e?.message || "Failed to start audio");
        }
    }


    function disconnect() {
        try {
            dc?.close?.();
            pc?.getSenders().forEach((s) => s?.track?.stop());
            pc?.close?.();
            micStream?.getTracks().forEach((t) => t.stop());
        } catch { }
        setDc(null);
        setPc(null);
        setConnected(false);
        setMicStream(null);
        setMicTrack(null);
        setIsTalking(false);
        setStatus("idle");
        aiAudioCleanupRef.current?.();
        aiAudioCleanupRef.current = null;
        setAiTalking(false);
        setAiLevel(0);

    }


    // Push-to-talk
    function startTalking() {
        if (!connected || !micTrack) return;
        micTrack.enabled = true;
        setIsTalking(true);
    }
    function stopTalking() {
        if (!connected || !micTrack) return;
        micTrack.enabled = false;
        setIsTalking(false);
    }


    return (
        <div className="min-h-[100dvh] bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 sm:p-6">
            <div className="w-full max-w-3xl">
                {/* Hero / Header */}
                <div className="text-center mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Voice Agent</h1>
                    <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
                        Press & hold to talk. Real-time answers with low latency.
                    </p>
                </div>

                {/* Main card */}
                <div className="relative rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 backdrop-blur p-4 sm:p-6 shadow-lg">
                    {/* Status & Connect */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
                            <span className={`size-2 rounded-full ${connected ? "bg-emerald-500" : "bg-slate-400"}`} />
                            <span className="font-medium">{status}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={connected ? disconnect : connect}
                                className={`px-4 py-2 rounded-xl text-white transition ${connected ? "bg-rose-600 hover:bg-rose-700" : "bg-emerald-600 hover:bg-emerald-700"
                                    }`}
                            >
                                {connected ? "Disconnect" : "Start session"}
                            </button>
                        </div>
                    </div>

                    {/* Big push-to-talk button */}
                    <div className="mt-6 sm:mt-8 flex flex-col items-center justify-center">
                        <button
                            disabled={!connected}
                            onPointerDown={startTalking}
                            onPointerUp={stopTalking}
                            onPointerLeave={stopTalking}
                            onTouchStart={(e) => { e.preventDefault(); startTalking(); }}
                            onTouchEnd={(e) => { e.preventDefault(); stopTalking(); }}
                            className={[
                                "relative isolate h-28 w-28 sm:h-36 sm:w-36 rounded-full text-white font-semibold",
                                "transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
                                isTalking
                                    ? "bg-rose-600 shadow-[0_0_0_8px_rgba(244,63,94,0.15)]"
                                    : "bg-slate-900 dark:bg-white/10",
                            ].join(" ")}
                            title="Hold to Talk"
                        >
                            {/* Pulsing ring when talking */}
                            <span
                                className={[
                                    "absolute inset-0 rounded-full",
                                    "transition-opacity",
                                    isTalking ? "opacity-100 animate-ping-slow bg-rose-500/30" : "opacity-0",
                                ].join(" ")}
                            />
                            <span className="relative z-10 select-none">
                                {isTalking ? "Talking…" : "Hold to Talk"}
                            </span>
                        </button>

                        {/* AI speaking indicator */}
                        <div className="mt-6 flex flex-col items-center">
                            {/* Label */}
                            <span className="mb-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 shadow-sm">
                                <span className="size-2 rounded-full animate-pulse bg-emerald-500" />
                                AI Talker
                            </span>

                            {/* Equalizer bars */}
                            <div className="flex h-6 items-end gap-1" aria-label="AI speaking visualizer">
                                {[0, 1, 2, 3, 4].map((i) => {
                                    const height = 6 + Math.max(0, aiLevel * 70 - i * 4);
                                    return (
                                        <span
                                            key={i}
                                            className={`w-1.5 rounded-full transition-[height,opacity] duration-100 ${aiTalking
                                                    ? "bg-emerald-500 opacity-100"
                                                    : "bg-slate-300 dark:bg-slate-700 opacity-60"
                                                }`}
                                            style={{ height: `${height}px` }}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </div>


                    {/* Controls row */}
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        <div className="flex flex-wrap items-center gap-3">
                            <label className="text-sm text-slate-600 dark:text-slate-300">
                                Voice
                                <select
                                    className="ml-2 border rounded-lg px-2 py-1 bg-white/70 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700"
                                    value={voice}
                                    onChange={(e) => { setVoice(e.target.value); sendSessionUpdate({ voice: e.target.value }); }}
                                    disabled={!connected}
                                >
                                    <option value="alloy">alloy</option>
                                    <option value="verse">verse</option>
                                    <option value="clem">clem</option>
                                </select>
                            </label>

                            <label className="text-sm text-slate-600 dark:text-slate-300">
                                Speed
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0.5"
                                    max="2"
                                    className="ml-2 w-20 border rounded-lg px-2 py-1 bg-white/70 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700"
                                    value={speed}
                                    onChange={(e) => { setSpeed(e.target.value); sendSessionUpdate({ speed: Number(e.target.value) || 1 }); }}
                                    disabled={!connected}
                                />
                            </label>
                        </div>

                        <div className="flex justify-start sm:justify-end">
                            <button
                                onClick={() => sendSessionUpdate()}
                                className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 disabled:opacity-50"
                                disabled={!connected}
                                title="Apply the instructions below to the live session"
                            >
                                Update Instructions
                            </button>
                        </div>
                    </div>

                    {/* Instructions textarea */}
                    <div className="mt-4">
                        <label className="text-sm font-medium">Live Instructions (system prompt)</label>
                        <textarea
                            className="mt-2 w-full h-36 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 p-3 text-sm"
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                            placeholder="Type the assistant rules/persona here…"
                        />
                        <p className="mt-2 text-xs text-slate-500">
                            Tip: push-to-talk only sends audio while pressed — better UX and lower cost.
                        </p>
                    </div>
                </div>
            </div>

            {/* Hidden audio element (required to play model voice, but no UI) */}
            <audio ref={audioRef} autoPlay className="hidden" />
            <style jsx global>{`
        @keyframes ping-slow { 0% { transform: scale(1); opacity: .6 } 80%, 100% { transform: scale(1.4); opacity: 0 } }
        .animate-ping-slow { animation: ping-slow 1.6s cubic-bezier(0, 0, 0.2, 1) infinite; }
      `}</style>
        </div>
    );
}
