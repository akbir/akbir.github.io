---
title: 'How to Test Deep Learning'
date: 2019-10-07T16:12:40+01:00
category: short post
tags:
---

*One of the largest challenges when starting our company was learning how to use deep learning models in production grade software. Whilst we had solved the challenge of proving our models were capable of solving the problem with controlled environment (and nice datasets), building a pipeline and testing suite was difficult and we’d like to share what we’ve learnt.*

In particular, our product utilised "online learning’’, in which each model is trained specifically for a client. This makes our models vulnerable to data dependencies as well as technical dependencies.

Whilst great literature now exists on why machine learning builds technical debt (see [here](https://papers.nips.cc/paper/5656-hidden-technical-debt-in-machine-learning-systems.pdf)), we wanted to focus on methods to alleviate these using testing.

### The Testing Framework

Testing is the backbone of any good software project, it is the fundamental way to maintain code. Traditionally it can be broken down into 4 tiers, each abstracting and working on a larger scope than the previous — for deep learning we particularly focus upon on the first two (Unit and Integration).

Unit testing evaluates code at its component level, where actual outputs are compared with expected outputs. For deep learning this is interrupted as the individual layers (e.g linear, conv layer) to small modules (e.g your custom string-encoders). Whilst the prior are normally well tested by the PyTorch and TF library, the latter provides difficulties.

Integration testing evaluates the orchestrated performance of components of code together — checking interfaces match and the correct data is being sent between them. In machine learning, we consider this tasks such as Training and Inference. Inherently these tasks involve engagement between your data processing, training mechanisms and deployment, and at each stage, biases can introduced it.

![testing framework](/img/testing_stages.png)

### Why it Fails for Deep Learning

Some of our pet peeves on why this framing fails:

Maths is boring. Calculating tensor multiplications are difficult — and rarely can be done by an engineer as ‘‘back of the envelope calculations’’. The maths is fiddly — even with fixed seed initialisation, the regular Xavier weight initialisation uses 32-bit floats, matrix multiplication involves a large series of calculations and testing modules with batching involves hard-coding tensors with 3 dimensions. Whilst none of these tasks are insurmountable- they massively stifle development time and creating useful unit tests.

Models fail silently. Whilst testing a network behaves correctly with a specific input — the inputs of a neural networks are rarely a finite set of inputs (with the exception of some limited discrete models). Networks work in larger orchestration and regularly change their inputs, outputs and gradients. In order to keep the PyTorch library versatile, many methods are lazy, I can not recount how many times a bug has been caused by PyTorch’s weak matrix operations in which shapes don’t need to match! However, this alludes to the larger problem…

Learning is an emergent property. Machine learning rises from the collaborative functioning of layers and does not belong to any single property of the system — and so ultimately, you can never be sure your model produced has the exact properties you’d like. To this end, actually testing the quality of a model requires training — what would traditionally be considered our second tier of testing — integrations. In addition, this form of training is computationally expensive and time-consuming, usually not possible on local machines.

Multiple service orchestration is horrible. In scenarios where you have multiple services in your product — architecture versioning becomes important. A common scenario I’ve encountered is having one micro-service for training models and another for using the model in inference mode. Now imagine a researcher implements a change as small as changing a ReLu for a LeakyRelu activation — this can throw any service dependent on a previous neural architecture out of sync. Whilst version control is a problem encountered by most software products and can normally be mocked out — the ML libraries are playing catch-up and such functionality doesn’t exist.

### How to make it work!

We prefer to consider testing of machine learning products at very different level of abstraction. Below we list a basic checklist of ways you can test your models.

Fixed seed testing. We start with an obvious one because we’d be reminisce to not mention it. For all your testing, fix the seed of your model. Be aware of libraries such as PyTorch this involves extra steps if using the GPU, although we’d recommend you run all unit tests on the CPU and leave the GPU deployments to integration testing.

Named tensor dimensions. Whilst to machine learning researchers the consensus of tensor dimensions representing (Batch_Size x Features) is well established, for sequential modelling this can sometimes not be the case (look at PyTorch’s default implementation for RNNS for example [LINK]). In those cases, it becomes useful to specify exactly what the first dimension of your tensor refers to. There’s a nice methodology presented here but until incorporated as default into libraries, any new tensor created won’t follow this convention!

Setting constant weights. As mentioned software engineers need to be able to calculate outputs of a network component easily, which can difficult with matrix calculations and the traditionally small values networks use (bounded between 0 and 1. To appease this issue, for all testing we pre-initialise our weights to a constant value (such as 0.002) which allows for simpler calculation of output vectors. We include the helper function below:

```
def set_constant_weights(self, value: float):
    for weight in self.parameters():
        init.constant_(weight, value)
```


Single batch sanity. A common sanity check for researchers is to test for supervised/unsupervised models can overfit to a single batch and conveniently, this is also computationally reasonable to run and trained easily — and so can be easily scheduled on Jenkins or other pipeline managers. We consider this a fundamental regression test and apply it daily to check we’re not introducing bugs.

Regression test everything. Constantly evaluating performance is an expensive task, however, when performance drops, it is imperative to know why. Deep learning projects are incorporated into Continuous Delivery processes, in which code changes can be made frequently.

Make synthetic datasets. Performance is not only code dependent, but also data dependent — and so don’t attribute good performance without multiple tests. A particularly useful tool for maintaining large files with your code is DVC, a form of git for data. With its nice interface, it becomes easy to manage datasets and began training/testing pipelines.

Create interpretable tests. In general, we consider testing edge cases within the unit tests, when testing the input/output of a unit of code. However with Neural networks, the new unit is the trained model — which can be considered the integration test.

### Conclusion

In general, this is by no means an exhaustive list, and there are multiple other considerations for testing new features and architectures, such as considerations for staging. This is what we learnt on our first iteration and look forward to hearing from the community on other techniques.
