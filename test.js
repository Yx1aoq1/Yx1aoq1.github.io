function randomInt (min, max) {
  return Math.round(Math.random() * (max - min)) + min
}

function randomArr (len) {
  let arr = []
  for (let i = 0; i < len; i ++) {
    arr.push(randomInt(0, 15))
  }
  return arr
}

function swap (arr, i, j) {
  const temp = arr[i]
  arr[i] = arr[j]
  arr[j] = temp
}

// 在原数组上操作的版本，比较节约空间
function partition (arr, start, end) {
  // 基准为数组的始元素
  const pivot = arr[start]
  let left = start
  let right = end + 1
  let cur = start + 1
  // 从第二个元素开始比较
  for (; cur < right; cur ++) {
    if (arr[cur] < pivot) { 
      // 如果当前元素比基数小，就和右边的大数交换，left就往右移了一位
      // 可以看出最坏的情况，相当于冒泡
      swap(arr, cur, ++ left)
    }
  }
  // 把基数放在本应属于他的位置
  swap(arr, start, left)
  return left
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

function logger (arr) {
  arr.map((item, index) => {
    console.log(`${index}:`, item)
  })
}

function bucketSort (arr, bucketSize = 5) {
  const buckets = [...new Array(bucketSize)].map(() => []) // 生成一个bucketSize * bucketSize的数组空间
  const max = Math.max(...arr)
  
  for (let i = 0; i < arr.length; i ++) {
    const number = arr[i]
    const bucketIndex = Math.floor(number / (max + 1) * bucketSize) // 映射函数
    const bucket = buckets[bucketIndex]
    bucket.push(number)

    let j = bucket.length - 1
    // 对加进桶内的元素排序 这里的排序是普通的冒泡
    while (j > 0 && bucket[j - 1] > bucket[j]) {
      swap(bucket, j - 1, j)
      j --
    }
  }
  let i = 0
  for (let bucketIndex = 0; bucketIndex < bucketSize; bucketIndex ++) {
    const bucket = buckets[bucketIndex]
    for (let j = 0; j < bucket.length; j ++) {
      arr[i] = bucket[j]
      i ++
    }
  }
  return arr
}

const array = randomArr(10)
console.log('befor sort: ', array)
const res = bucketSort(array, 5)
console.log('after sort: ', res)