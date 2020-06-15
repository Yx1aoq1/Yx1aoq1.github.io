function partition (arr, start, end) {
  console.log('start:', start, 'end:', end)
  const pivot = arr[start]
  let left = start
  let right = end
  while (left < right) {
    while (left < right && arr[right] > pivot) {
      right --
    }
    while (left < right && arr[left] <= pivot) {
      left ++
    }
    if (left < right) {
      swap(arr, left, right)
    }
  }
  swap(arr, start, left)
  return left
}

function swap (arr, i, j) {
  console.log('swap-left:', i, 'swap-right:', j)
  const temp = arr[i]
  arr[i] = arr[j]
  arr[j] = temp
}

function quickSort (arr, start, end) {
  start = typeof start !== 'number' ? 0 : start
  end = typeof end !== 'number' ? arr.length - 1 : end
  if (start < end) {
  	const partitionIndex = partition(arr, start, end)
    quickSort(arr, start, partitionIndex - 1)
    quickSort(arr, partitionIndex + 1, end)
  }
  return arr
}

res = quickSort([2, 4, 6, 1, 3, 7, 9, 8, 5])
console.log(res)