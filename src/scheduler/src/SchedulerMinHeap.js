/** 删除根节点 */
function pop(heap) {
  if (heap.length === 0) return null;
  const first = heap[0];
  const last = heap.pop();
  heap[0] = last;
  siftDown(heap, last, 0);
  return first;
}

function push(heap, node) {
  const index = heap.length;
  heap.push(node);
  if (index > 0) siftUp(heap, node, index);
}

function peek(heap) {
  const length = heap.length;
  return length > 0 ? heap[0] : null;
}

function siftUp(heap, node, i) {
  let index = i;
  while (index > 0) {
    // (index - 1) >>> 1 是由于二叉树的性质决定的，实在不知道的时候自己画个图看看就懂了
    const parentIndex = (index - 1) >>> 1;
    const parent = heap[parentIndex];
    if (compare(parent, node) > 0) {
      heap[parentIndex] = node;
      heap[index] = parent;
      index = parentIndex;
    } else {
      return;
    }
  }
}

/* 
  疑问1：
  为什么不需要判断 leftIndex < length, 也就是左节点不存在的情况？
  答：
  因为index < halfLength，这句话保证了我只对非叶子节点进行处理，所以一定有左节点，但是完全二叉树不一定有右节点所以需要对右节点进行判断；
*/
function siftDown(heap, node, i) {
  const index = i;
  const length = heap.length;
  const halfLength = length >>> 1;
  while (index < halfLength) {
    const leftIndex = 2 * index + 1;
    const left = heap[leftIndex];
    const rightIndex = leftIndex + 1;
    const right = heap[rightIndex];
    if (compare(node, left) > 0) {
      if (rightIndex < length && compare(left, right) > 0) {
        heap[rightIndex] = node;
        heap[index] = right;
        index = rightIndex;
      } else {
        heap[leftIndex] = node;
        heap[index] = left;
        index = leftIndex;
      }
    } else {
      if (rightIndex < length && compare(node, right) > 0) {
        heap[rightIndex] = node;
        heap[index] = right;
        index = rightIndex;
      } else {
        return;
      }
    }
  }
}

function compare(a, b) {
  const diff = a.sortIndex - b.sortIndex;
  return diff !== 0 ? diff : a.id - b.id;
}

export { pop, push, peek };
