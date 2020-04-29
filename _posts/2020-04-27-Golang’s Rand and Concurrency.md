---
layout: post
section-type: post
title: Golang's Rand and Concurrency
category: short post
tags:
---

This is a bug I encountered when writing a ray-tracer in Golang and thought it was worth a quick share.

### The Idea

When rendering an image using a ray-tracer, each pixel value can theoretically be calculated independently, making parallelisation an attractive prospect.
When rendering the image, we iterate through each position and call the sample method to calculate RGB value for that pixel:

<script src="https://gist.github.com/am-khan/2940ff0137aadd7c533fe326b70e855b.js"></script>

Go makes running threads (go routines) really simple and so the idea was to split the for loop into separate threads. Where the `k`-th thread would calculate the `[k, 2k, ... , nk]`-th position pixels within the row.

<script src="https://gist.github.com/am-khan/b05c76681aa330d2ff5c0a222dc2555f.js"></script>

Now lets check the runtimes:

```bash
# Single Thread
Elapsed: 1m54.230536119s
# Multiple Threads
Elapsed: 4m13.680876913s
```

Unfortunately this didn’t speed things up, even worse, it increased the runtime!

### The Bug
If threading was making my program slower, then each thread was clearly unable to act independently. So lets check out sample method:
<script src="https://gist.github.com/am-khan/4ae37cc5edbee98ac52ef0c066c2bdd9.js"></script>

After some debugging (shout out `pprof`), I noticed that an incredible amount of time was being used by `math/rand` and the associated synchronisation overhead. Taking a quick look at the [source code](https://golang.org/src/math/rand/rand.go), I notice that the package is globally locked:
<script src="https://gist.github.com/am-khan/999556ad7507e826824f990ae6b4e09b.js"></script>

For random number generators (RNGs) this makes perfect sense, as RNGs generally calculate the next random number based on the previous, and we’d like RNG to be consistently random across processes. This is good behaviour — however not ideal in our situation.

### The Fix
To circumvent this issue and gain all the speed benefits of threading, we’d need to provide each thread its own RNG. Thankfully this is fairly simple within go, as the rand package has methods to create unique RNGs, which can be created for each thread independently.
<script src="https://gist.github.com/am-khan/cc1c9d0c8260ce5e104f0fdbfaaeb7d8.js"></script>

and subsequently update all the existing math/rand calls must be switched to call our RNG instead:
<script src="https://gist.github.com/am-khan/c6ad8ef81ad781d025a5b7b741ca9ca7.js"></script>

### The Results
After some tuning of the number of threads to use (as suggested by a friend 2*NumCores), my final speed up was:

```bash
# Multiple Threads
Elapsed: 23.765684225s
```
which was a nice 4x speed up!
