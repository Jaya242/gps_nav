// dijkstra.js — shortest path via Dijkstra with a binary min-heap.

class MinHeap {
  constructor() {
    this.a = [];
  }

  push(item) {
    this.a.push(item);
    this._up(this.a.length - 1);
  }

  pop() {
    if (this.a.length === 0) {
      return null;
    }

    const top = this.a[0];
    const last = this.a.pop();

    if (this.a.length > 0) {
      this.a[0] = last;
      this._down(0);
    }

    return top;
  }

  get size() {
    return this.a.length;
  }

  _up(i) {
    while (i > 0) {
      const p = (i - 1) >> 1;

      if (this.a[p][0] <= this.a[i][0]) {
        break;
      }

      [this.a[p], this.a[i]] = [this.a[i], this.a[p]];
      i = p;
    }
  }

  _down(i) {
    const n = this.a.length;

    while (true) {
      const l = 2 * i + 1;
      const r = 2 * i + 2;

      let s = i;

      if (l < n && this.a[l][0] < this.a[s][0]) {
        s = l;
      }

      if (r < n && this.a[r][0] < this.a[s][0]) {
        s = r;
      }

      if (s === i) {
        break;
      }

      [this.a[s], this.a[i]] = [this.a[i], this.a[s]];
      i = s;
    }
  }
}

export function dijkstra(edges, startId, endId) {
  const dist = new Map();
  const prev = new Map();
  const heap = new MinHeap();

  dist.set(startId, 0);
  heap.push([0, startId]);

  while (heap.size) {
    const [d, u] = heap.pop();

    if (u === endId) {
      break;
    }

    if (d > (dist.get(u) ?? Infinity)) {
      continue;
    }

    const neighbors = edges.get(u) || [];

    for (const { to, weight } of neighbors) {
      const nd = d + weight;

      if (nd < (dist.get(to) ?? Infinity)) {
        dist.set(to, nd);
        prev.set(to, u);
        heap.push([nd, to]);
      }
    }
  }

  if (!dist.has(endId)) {
    return null;
  }

  const path = [];
  let cur = endId;

  while (cur !== undefined) {
    path.push(cur);
    cur = prev.get(cur);
  }

  path.reverse();

  return {
    path,
    distance: dist.get(endId),
  };
}