const compare = (a, b) => {
  const diff = a.sortIndex - b.sortIndex;
  return diff !== 0 ? diff : a.id - b.id;
};

const push = (heap, node) => {
  const index = heap.length;
  heap.push(node);
  if (index !== 0) {
    siftUp(heap, node, index);
  }
};

const pop = (heap) => {
  if (heap.length === 0) {
    return null;
  }
  const first = heap[0];
  const last = heap.pop();
  if (first !== last) {
    heap[0] = last;
    siftDown(heap, last, 0);
  }
  return first;
};

const peek = (heap) => {
  return heap.length === 0 ? null : heap[0];
};

const siftUp = (heap, node, i) => {
  let index = i;
  while (index > 0) {
    const parentIndex = (index - 1) >>> 1;
    const parent = heap[parentIndex];
    if (compare(node, parent) < 0) {
      heap[index] = parent;
      heap[parentIndex] = node;
      index = parentIndex;
    } else {
      return;
    }
  }
};

const siftDown = (heap, node, i) => {
  let index = i;
  const length = heap.length;
  const halfLength = heap.length >>> 1;
  while (index < halfLength) {
    const leftIndex = ((index + 1) * 2) >>> 1;
    const left = heap[leftIndex];
    const rightIndex = leftIndex + 1;
    const right = heap[rightIndex];
    if (compare(left, node) < 0) {
      if (rightIndex < length && compare(left, right) < 0) {
        heap[rightIndex] = node;
        heap[index] = right;
        index = rightIndex;
      } else {
        heap[leftIndex] = node;
        heap[index] = left;
        index = leftIndex;
      }
    } else if (rightIndex < length && compare(right, node) < 0) {
      heap[rightIndex] = node;
      heap[index] = right;
      index = rightIndex;
    } else {
      return;
    }
  }
};
