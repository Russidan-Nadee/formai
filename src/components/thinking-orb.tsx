"use client";

import { useEffect, useRef } from "react";

const NODE_COUNT = 120;
const EDGES_PER_NODE = 3;
const CYCLE_SECONDS = 8;
const SCALE_KEYFRAMES = [1, 0.85, 1.1, 0.95];

type Vec3 = { x: number; y: number; z: number };
type Node = Vec3 & { seed: number };
type Edge = [number, number];
type Signal = { edge: Edge; t0: number; dur: number };

function buildSphere(count: number): Node[] {
  const golden = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: count }, (_, i) => {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    return {
      x: Math.cos(theta) * r,
      y,
      z: Math.sin(theta) * r,
      seed: (i * 12.9898) % (Math.PI * 2),
    };
  });
}

function buildEdges(nodes: Node[], k: number): Edge[] {
  const seen = new Set<string>();
  const edges: Edge[] = [];
  for (let i = 0; i < nodes.length; i++) {
    const distances = nodes
      .map((p, j) => (j === i ? null : { j, d: dist2(p, nodes[i]) }))
      .filter((v): v is { j: number; d: number } => v !== null)
      .sort((a, b) => a.d - b.d);
    for (let n = 0; n < k && n < distances.length; n++) {
      const j = distances[n].j;
      const key = i < j ? `${i}_${j}` : `${j}_${i}`;
      if (!seen.has(key)) {
        seen.add(key);
        edges.push([i, j]);
      }
    }
  }
  return edges;
}

function dist2(a: Vec3, b: Vec3): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return dx * dx + dy * dy + dz * dz;
}

function catmullRom(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    0.5 *
    (2 * p1 +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
  );
}

// Cyclic breathing scale through the brief's own keyframes
// (1.0 -> 0.85 -> 1.10 -> 0.95 -> back to 1.0).
function breatheScale(elapsed: number): number {
  const u = ((elapsed % CYCLE_SECONDS) / CYCLE_SECONDS) * SCALE_KEYFRAMES.length;
  const i0 = Math.floor(u) % SCALE_KEYFRAMES.length;
  const frac = u - Math.floor(u);
  const wrap = (n: number) =>
    SCALE_KEYFRAMES[(n + SCALE_KEYFRAMES.length) % SCALE_KEYFRAMES.length];
  return catmullRom(wrap(i0 - 1), wrap(i0), wrap(i0 + 1), wrap(i0 + 2), frac);
}

function rotate(p: Vec3, spin: number, tilt: number): Vec3 {
  const x = p.x * Math.cos(spin) + p.z * Math.sin(spin);
  const z1 = -p.x * Math.sin(spin) + p.z * Math.cos(spin);
  const y = p.y * Math.cos(tilt) - z1 * Math.sin(tilt);
  const z = p.y * Math.sin(tilt) + z1 * Math.cos(tilt);
  return { x, y, z };
}

export function ThinkingOrb({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    const nodes = buildSphere(NODE_COUNT);
    const edges = buildEdges(nodes, EDGES_PER_NODE);
    const signals: Signal[] = [];
    let lastSpawn = 0;
    let raf = 0;
    const start = performance.now();

    // Random spin rate (0.15–0.6 rad/s) and direction, picked fresh each
    // time the orb mounts so it doesn't always turn at the same speed.
    const spinRate = (Math.random() * 0.45 + 0.15) * (Math.random() < 0.5 ? 1 : -1);

    function frame(now: number) {
      const elapsed = (now - start) / 1000;
      const cx = width / 2;
      const cy = height / 2;
      const baseRadius = Math.min(width, height) * 0.36;

      ctx!.clearRect(0, 0, width, height);

      const tilt = 0.3;
      const spin = elapsed * spinRate;
      const scale = reduceMotion ? 1 : breatheScale(elapsed);
      const camZ = 4.2;
      const focal = 3.2;

      const projected = nodes.map((p) => {
        const pulse = reduceMotion ? 1 : 1 + 0.05 * Math.sin(elapsed * 1.4 + p.seed);
        const q = rotate({ x: p.x * pulse, y: p.y * pulse, z: p.z * pulse }, spin, tilt);
        const pz = q.z + camZ;
        const f = (focal / pz) * baseRadius * scale;
        return { x: cx + q.x * f, y: cy + q.y * f, depth: pz };
      });

      ctx!.lineWidth = 1;
      for (const [a, b] of edges) {
        const pa = projected[a];
        const pb = projected[b];
        const t = Math.max(0, Math.min(1, ((pa.depth + pb.depth) / 2 - 2) / 4));
        ctx!.strokeStyle = `rgba(10,10,10,${(0.15 + t * 0.35).toFixed(3)})`;
        ctx!.beginPath();
        ctx!.moveTo(pa.x, pa.y);
        ctx!.lineTo(pb.x, pb.y);
        ctx!.stroke();
      }

      for (const pr of projected) {
        const t = Math.max(0, Math.min(1, (pr.depth - 2) / 4));
        const radius = 1 + t * 1.25;

        const glow = ctx!.createRadialGradient(pr.x, pr.y, 0, pr.x, pr.y, radius * 3);
        glow.addColorStop(0, `rgba(10,10,10,${(0.18 + t * 0.22).toFixed(3)})`);
        glow.addColorStop(1, "rgba(10,10,10,0)");
        ctx!.fillStyle = glow;
        ctx!.beginPath();
        ctx!.arc(pr.x, pr.y, radius * 3, 0, Math.PI * 2);
        ctx!.fill();

        ctx!.fillStyle = `rgba(10,10,10,${(0.6 + t * 0.4).toFixed(3)})`;
        ctx!.beginPath();
        ctx!.arc(pr.x, pr.y, radius, 0, Math.PI * 2);
        ctx!.fill();
      }

      if (!reduceMotion && now - lastSpawn > 300 && signals.length < 4 && Math.random() < 0.5) {
        lastSpawn = now;
        signals.push({
          edge: edges[(Math.random() * edges.length) | 0],
          t0: now,
          dur: 700 + Math.random() * 400,
        });
      }
      for (let i = signals.length - 1; i >= 0; i--) {
        const sig = signals[i];
        const prog = (now - sig.t0) / sig.dur;
        if (prog >= 1) {
          signals.splice(i, 1);
          continue;
        }
        const pa = projected[sig.edge[0]];
        const pb = projected[sig.edge[1]];
        const envelope = Math.sin(Math.PI * prog);
        ctx!.fillStyle = `rgba(10,10,10,${(0.85 * envelope).toFixed(3)})`;
        ctx!.beginPath();
        ctx!.arc(pa.x + (pb.x - pa.x) * prog, pa.y + (pb.y - pa.y) * prog, 2, 0, Math.PI * 2);
        ctx!.fill();
      }

      raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}
