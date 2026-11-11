# Writing of The Day (WOTD)

## 09/11/2026 docker 
Docker is containerization platform that enables consistent and seamless deployment across different environments.
One of the problems Docker solves in dependency inconsistency. For example, an application might use specific Node.js version or tools. Traditionally it rely on host operating system that might be shared with other application that use different Node.js version. Docker packages this dependencies into one entity called image.

Docker have 3 fundamental concepts; dockerfile, container, and image.
Dockerfile is where we define all dependencies required by our application. Its like a blueprint.
Image is immutable version of Dockerfile, where it build the actual defined Dockerfile.
Container is running instance of Image.

Docker also have a registry concept, which acts like distributed system of images. Common example is docker hub and AWS ECR.

Docker also have caching strategy with layering.

## 10/11/2026 idempotency 
Idemopotency is a concept of acknowledged a retry. In software & distributed system, retry is normal thing.
The most common example of this is a transaction. Client connection to our server is cannot always be trusted. They might do same request multiple times, intended or unintended. Idempotency acknowledge this by treat this as normal thing. In transaction case, multiple same request will result the same thing. If they want to charge customer 200$ of their balance, if it already processed once, next step will ignore this.

### backpressure
Backpressure is a distributed system flow control mechanism by a service try to tell their upstream that it is currently at its limit. 
Common example is Kafka. Kafka message queue might have multiple producers that fires events that expected to be processed, but surpassed their limit of computation (consumer). Usually, upon full capacity, it will reject producer and tell them to retry again later.
This is to avoid a service having too much load that might lead to increased latency and even service crash.
For example, suppose kafka can only store 1k messages. In normal scenarios, messages flushed by consumers processing the request. But consumer currently crashed, then the messages will accumulate. Producer only know that their request being processed. In reality, request number 1001 are not even received in the kafka buffers, even worst, kafka buffer might crashed.

Related concepts: throttling, rate limit

## 11/11/2026 outbox pattern, cursor
Outbox pattern is software engineering concept

### cursor
Cursor is position marker used for pagination, works on linear data.
It basically tell the system where to continue sending data, typically returning actual data and new cursor.
It avoids sending too much data in a single request, which might cause failures such as timeout or bandwidth issues.
For example, a service contains 100k records. Client might request all at once. But suppose bandwidth limit is 10k entries. Instead of sending all at once, service will return first 10k data. Because the data is sorted in chronologically order, then the cursor should be the last received data. Then client is able to fetch next 10k data, no need to loop from the beginning.

# Footnotes
- This is my personal diary. Not a references.
- Goals:
	- As non-native english speaker, i want to train my english with writings. I believe articulate my mind through writing can help with english skills.
	- As an engineer, i want to understand something comprehendly, and based on [A], You need to write to effectively understand anything.
	- Writing is a skill, need to train. It takes time though.
- I want to keep this out of AI generated writings. Purely from my mind. LLM will help and strictly mentioned (acknowledged)
- Not necessarily tech related stuff

