/**
 * 将新的元素入堆并排序
 * @param {堆队列} heap
 * @param {新添加的元素} node
 */
function push(heap, node) {
  /*
  将node加入堆中最后的位置；
  将元素上浮让其处于正确的位置；
  */
  const index = heap.length;
  heap.push(node);
  if (index === 0) siftUp(heap, node, index);
}

function pop(heap) {
  /*
  将最后的元素替换第一个元素；
  进行元素下沉知道位置正确；
  */
  const first = heap[0];
  const last = heap.pop();
  if (first !== last) {
    heap[0] = last;
    siftDown(heap, last, 0);
  }
  return first;
}

function peek(heap) {
  return heap.length > 0 ? heap[0] : null;
}

function siftUp(heap, node, i) {
  let index = i;
  while (index > 0) {
    const parentIndex = (index - 1) >>> 1;
    const parent = heap[parentIndex];
    if (compare(parent, node) > 0) {
      heap[index] = parent;
      heap[parentIndex] = index;
      index = parentIndex;
    } else {
      return;
    }
  }
}

function siftDown(heap, node, i) {
  let index = i;
  const length = heap.length;
  const halfLength = length >>> 1;

  while (index <= halfLength) {
    const leftIndex = (index + 1) * 2 - 1;
    const left = heap[leftIndex];
    const rightIndex = leftIndex + 1;
    const right = heap[rightIndex];
    if (compare(left, node) < 0) {
      if (rightIndex < length && compare(right, left) < 0) {
        heap[index] = right;
        heap[rightIndex] = node;
        index = rightIndex;
      } else {
        heap[index] = left;
        heap[leftIndex] = node;
        index = leftIndex;
      }
    } else if (rightIndex < length && compare(right, node) < 0) {
      heap[index] = right;
      heap[rightIndex] = node;
      index = rightIndex;
    } else {
      return;
    }
  }
}

function compare(a, b) {
  const diff = a.sortIndex - b.sortIndex;
  return diff !== 0 ? diff : a.id - b.id;
}
