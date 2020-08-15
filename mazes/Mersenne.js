class MersenneTwister {
  N = 624
  M = 397
  MATRIX_A = 0x9908b0df

  UPPER_MASK = 0x80000000
  LOWER_MASK = 0x7fffffff

  constructor(seed) {
    this.mt = new Array(this.N)
    this.setSeed(seed)
  }

  unsigned32 = (n1) => (n1 < 0) ? (n1 ^ this.UPPER_MASK) + this.UPPER_MASK : n1

  subtraction32(n1, n2) {
    if (n1 < n2) {
      return this.unsigned32((0x100000000 - (n2 - n1)) % 0xffffffff)
    } else {
      return n1 - n2
    }
  }

  addition32 = (n1, n2) => this.unsigned32((n1 + n2) & 0xffffffff)

  multiplication32(n1, n2) {
    let sum = 0
    for (let i = 0; i < 32; i++) {
      if ((n1 >>> i) & 0x1) {
        sum = this.addition32(sum, this.unsigned32(n2 << i))
      }
    }
    return sum
  }

  setSeed(seed) {
    if (!seed || typeof seed === "number") {
      this.seedWithInteger(seed)
    } else {
      this.seedWithArray(seed)
    }
  }

  defaultSeed() {
    let currentDate = new Date()
    return currentDate.getMinutes() * 60000 + currentDate.getSeconds() * 1000 + currentDate.getMilliseconds()
  }

  seedWithInteger(seed) {
    this.seed = seed != null ? seed : this.defaultSeed()
    this.mt[0] = this.unsigned32(this.seed & 0xffffffff)
    this.mti = 1

    while (this.mti < this.N) {
      this.mt[this.mti] = this.addition32(this.multiplication32(1812433253, this.unsigned32(this.mt[this.mti - 1] ^ (this.mt[this.mti - 1] >>> 30))), this.mti)
      this.mt[this.mti] = this.unsigned32(this.mt[this.mti] & 0xffffffff)
      this.mti++
    }
  }

  seedWithArray(key) {
    this.seedWithInteger(19650218)
    
    let i = 1
    let j = 0
    let k = this.N > key.length ? this.N : key.length
    while (k > 0) {
      let _m = this.multiplication32(this.unsigned32(this.mt[i - 1] ^ (this.mt[i - 1] >>> 30)), 1664525)
      this.mt[i] = this.addition32(this.addition32(this.unsigned32(this.mt[i] ^ _m), key[j]), j)
      this.mt[i] = this.unsigned32(this.mt[i] & 0xffffffff)

      i++
      j++

      if (i >= this.N) {
        this.mt[0] = this.mt[this.N - 1]
        i = 1
      }

      j = (j >= key.length) ? 0 : j
      k--
    }

    k = this.N - 1
    while (k > 0) {
      this.mt[i] = this.subtraction32(this.unsigned32(this.mt[i] ^ this.multiplication32(this.unsigned32(this.mt[i - 1] ^ (this.mt[i - 1] >>> 30)), 1566083941)), i)
      this.mt[i] = this.unsigned32(this.mt[i] & 0xffffffff)
      i++
      if (i >= this.N) {
        this.mt[0] = this.mt[this.N - 1]
        i = 1
      }
    }

    this.mt[0] = 0x80000000
  }

  nextInteger(upper) {
    if ((upper != null ? upper : 1) < 1) {
      return 0
    }

    let mag01 = [0, this.MATRIX_A]
    if (this.mti >= this.N) {
      let kk = 0

      while (kk < this.N - this.M) {
        let y = this.unsigned32((this.mt[kk] & this.UPPER_MASK) | (this.mt[kk + 1] & this.LOWER_MASK))
        this.mt[kk] = this.unsigned32(this.mt[kk + this.M] ^ (y >>> 1) ^ mag01[y & 0x1])
        kk++
      }

      while (kk < this.N - 1) {
        let y = this.unsigned32((this.mt[kk] & this.UPPER_MASK) | (this.mt[kk + 1] & this.LOWER_MASK))
        this.mt[kk] = this.unsigned32(this.mt[kk + this.M - this.N] ^ (y >>> 1) ^ mag01[y & 0x1])
        kk++
      }

      let y = this.unsigned32((this.mt[this.N - 1] & this.UPPER_MASK) | (this.mt[0] & this.LOWER_MASK))
      this.mt[this.N - 1] = this.unsigned32(this.mt[this.M - 1] ^ (y >>> 1) ^ mag01[y & 0x1])
      this.mti = 0
    }

    let y = this.mt[this.mti++]
    y = this.unsigned32(y ^ (y >>> 11))
    y = this.unsigned32(y ^ ((y << 7) & 0x9d2c5680))
    y = this.unsigned32(y ^ ((y << 15) & 0xefc60000))
    return this.unsigned32(y ^ (y >>> 18)) % (upper != null ? upper : 0x100000000)
  }

  nextFloat = () => this.nextInteger() / 0xffffffff

  nextBoolean = () => this.nextInteger() % 2 === 0
}