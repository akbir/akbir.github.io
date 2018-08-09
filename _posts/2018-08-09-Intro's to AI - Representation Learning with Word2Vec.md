---
layout: post
section-type: post
title: Representation Learning - Word2Vec
category: Intro to Machine Learning
tags: [ 'word2vec', 'NLP', 'representation learning' ]
---


So, in this blog we’re going to talk about “representation learning” which is an important part of Machine learning and AI in general.  

As powerful as computers have become they are still relatively ‘stupid’. In fact, computing *power* normally only tells you how quickly they can perform simple calculations like adding and subtracting. What computers are really bad at, is more general abstract questions. That’s stuff like ‘can you notice pedestrians in a photo’ or ‘can you realise how the words King and Queen are related’?

What computers really get is vectors, they love them. By considering vectors as an array (list) of numbers, computers are able to still perform super simple and quick calculations. In addition, vectors already have some hardcore fans, who got obsessed with them through this niche subject called ‘Geometry’. These guys have come from as far as India and Greece and considered lots of ways to tell how similar vectors are (mathematicians would call these metrics).

We skip the work they’ve done because you probably learnt it in your Maths class. It’s the intuitive stuff such as ‘the distance between two points’ and ‘the angle between two vectors’ - different ways to measure how similar two vectors are. Depending on our choice of the two vectors, we could make these two measurements very different and, in that process, highlight different *relationships* between whatever those vectors represent.

So, the approach that people considered is using vectors to represent abstract concepts, such as “pedestrians in a photo” or words such as “queen”. That way we can still compute things quickly, but the geometric properties between vectors can encode information. If the mitochondrion was the powerhouse of the cell, then the vector is the powerhouse of representation learning.

Below we discuss one of my favourite examples of representation learning – Word2Vec.

### Word2Vec

Within Natural Language Processing, focus has been on producing robust representations of words. Telling a computer “Tom sat on the chair” and then asking, “Where is Tom?” is relatively difficult for a computer, as it requires an understanding of Tom as an object/noun and the relationship that the verb “sat” implies.

Computers need some way to represent a word. In particular Neural Networks (which do most of the work), need continuous representations. Think of continuous as meaning “not in chunks”, if something is *continuous* then there are no gaps between any two points (e.g in the flow of water). On the otherhand words are *discrete*, they literally are separate tokens, and between things like “cat” and “dog” there is no intermediate concept.

Linguists had a theory dubbed the [“distributional hypothesis”](https://en.wikipedia.org/wiki/Distributional_semantics#Distributional_hypothesis) which suggested that words are defined by the company that they keep. If I remove a _____ from a sentence, you can guess what it is (in this case ‘word’).  A group of [computer scientists] (https://arxiv.org/pdf/1310.4546.pdf), decided to train neural networks to play this game, and at the same time allowed the network to modify the vector representation of the words In order to succeed.  

So, the neural network is fed a sentence from a text such as “The cat sat on the” and told the answer should be “mat”. The network first changes each word into *one-hot* vectors. This type of vector is a form of index, and is filled with N zeros, where N is the number of words in the entire vocabulary. The zero which corresponds to the desired word is flipped to a one. So, if my entire vocabulary was 3 words long and the sentence is “The cat sat” the one-hot vectors are:

<img src="https://latex.codecogs.com/gif.latex?\dpi{120}&space;\bg_white&space;\large&space;\text{the}&space;&=&space;\begin{bmatrix}&space;0&space;\\&space;0&space;\\&space;1&space;\end{bmatrix},&space;\text{&space;cat}&space;&=&space;\begin{bmatrix}&space;0&space;\\&space;1&space;\\&space;0&space;\end{bmatrix}&space;\text{&space;sat}&space;&=&space;\begin{bmatrix}&space;1&space;\\&space;0&space;\\&space;0&space;\end{bmatrix}," title="\large \text{the} &= \begin{bmatrix} 0 \\ 0 \\ 1 \end{bmatrix}, \text{ cat} &= \begin{bmatrix} 0 \\ 1 \\ 0 \end{bmatrix} \text{ sat} &= \begin{bmatrix} 1 \\ 0 \\ 0 \end{bmatrix}," />

The biggest hold back is that for a large text, these vectors are pretty huge, and we’d like our representations to be a bit more *informationally* dense, so you can use fewer numbers to express more information about the entity.

![neural network diagram](/img/word2vec.png)

So, the first layer of the neural network takes the large one-hot vectors of a phrase and adds them together, creating an N-hot vector (which has multiple ones in it).  This is then fed into the first section of the neural network which outputs a smaller vector representation (the hidden state). We call this the word *embedding* (and it’s the important part).

The new single vector representation – the hidden state, is then taken by the rest of the network to predict what the next word should be. The neural network tells us its belief by outputting a vector which contains, in each dimension, the probability that it is the corresponding word (we call this a Softmax classifier):

<img src="https://latex.codecogs.com/gif.latex?\inline&space;\dpi{120}&space;\bg_white&space;\begin{bmatrix}&space;0.1\\&space;0.2&space;\\&space;0.7&space;\end{bmatrix}&space;=&space;\begin{matrix}&space;\small&space;\text{10\%&space;belief&space;next&space;word&space;is&space;`The'}&space;\\&space;\small&space;\text{20\%&space;belief&space;next&space;word&space;is&space;`cat'}&space;\\&space;\small&space;\text{70\%&space;belief&space;next&space;word&space;is&space;`sat'}&space;\end{bmatrix}" title="\begin{bmatrix} 0.1\\ 0.2 \\ 0.7 \end{bmatrix} = \begin{matrix} \small \text{10\% belief next word is `The'} \\ \small \text{20\% belief next word is `cat'} \\ \small \text{70\% belief next word is `sat'} \end{bmatrix}" />

*The network believes the next word is 10% likely to be "The", 30% likely to "Black" and 60% likely to be "Cat".*

We train the model, so it’s allowed to change the word embedding layer to try improving it’s score.  In the example above we take the hidden state representation to be the corresponding vector for “mat”. This is useful because the vector representation of ‘mat’ depends purely on the words around it and the model must train to fit all other phrases which also predict "mat".

When we look at these vectors (we can represent them as scatter plots in 2 and 3 dimensions), we see rich relationships between them. We find that certain directions between vectors represent relationships between words. For example, gendered nouns are always the same distance from each other (King/Queen, Man/Woman, Mr/Mrs) and that verb tenses are in the same direction (walking/walked, swimming/swam).

These dense representations encode a lot of information. So, we try use these word representations for different tasks. We keep the first layer of the network (the word embedding) which knows which vector relates to which word and can use it for more difficult tasks (like translation).


#### Limitations

However, word2vec isn’t without limitations. The largest problem comes from how we calculate the phrases in the first place, which is done by addition. As addition is commutative, the order doesn’t matter. The phrase “Alice sat on the horse” and “the horse sat on Alice” have the same representation in the hidden state! Word ordering is a key component of syntax and language understanding. Secondly, it’s not clear in a text when a phrase stops, should we consider only “The cat sat on the table” or should we consider the phrase “The cat sat on the table whilst the dog growled”.

I’ll discuss in the follow up blog how we can tackle these issues.


*This Blog is part of a larger series which is also posted for Spherical Defence Labs, you can find out more about them guys* [*here.*](http://sphericaldefence.com/)
