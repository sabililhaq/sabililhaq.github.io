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

## 12/11/2026 compounding effect

Compounding is a growth process in which the returns accumulate to generate additional returns over time. In mathematics, this is known as exponential growth. As time goes by, the accumulated value increases at an accelerating rate, even though the initial gains may seem insignificant.
For example, compound interest. Suppose an investment generates a 10% annual return. If we invest $100, in the next year, the value becomes $110. Then in the next year, the return are 10% of the new value, rather than initial $100 value. In 10 years, the value will be approximately 2.5 times initial investment [1].
The example above demonstrates how relatively small interest can produce substantial growth over a long period.

[1] A = P(1 + 0.1)^10 => 1.1^10 * 100 = 259

### compounding v1
Compounding effect is growth rate that is so great as the result of progress and accumulation. In mathematics, similar with quadratic equation. As the time goes, the growth is significantly increased, altough the actual growth value seems insignificant.
For example, interest rate. Suppose investing in some stock profit is 10% a year. If we infest 100$, next year it will be 110. Then in the next year, those 10% are based on new accumulated value. In 10 years, the initial investment will be 259$ [1], which 2.5x of initial value, even with only 10%.

[1] A = P(1 + 0.1)^10 => 1.1^10 * 100 = 259

## 13/11/2026 replication
### replication
Replication is data strategy to increase data availability by making a copy of primary source of truth. In distributed system, replication is done to avoid a major problem named single point of failure, where single component as the main system, also to distribute the read and write responsibility across databases.
For example, globally distributed database like Amazon DynamoDB. DynamoDB implementing replication strategy by having one region as primary database, and might have multiple replica in other region. In this case, client will read nearest replica as their source of truth. Primary DB will always propagate data to every replica to ensure data consistency. Then if there is a failure in a replica, it can acts as fallback.
Data replication comes with trade-off, often sacrifice data consistency and latency. Multiple replica needs to be updated from primary as source of truth. Imagine need to update replica across region like dynamoDB. Client in USA is updating some entry, but somewhere in different part of world might seen stale information. This is acceptable pattern known as asynchronous replication. For highly consistent system with replication, synchronous replication is implemented, with acknowledgment needed for each replication to ensure data consistency.

## 14/11/2026 race condition
A race condition is a phenomena in software where data are in inconsistent state due to a shared resources and were accessed and updated by two or more concurrent client/executor.
For example, consider banking system. Suppose A transfer money to B, and B transfer money to C. A to B will make B balance +100, but when update is on going, B transfer money to C with same value. But because the last executed is B to C, A balance is already substract, but B does not receive anything, essentially because only first transaction of B are overwritten by latest transaction.
Common solution to race condition is a strategy called locking. Where whoever first that want to update a record will restrict the data to other thread until all process is complete. With this, notable latency are acknowledged as trade-off.

## 15/11/2026 message queue
A message queue is software component that stores messages or events which later to be consumed, acts like a communication buffer between services. The messages streamed on the message queue and later to be consumed by wanted consumer. This allows asynchronous communication pattern between services, instead of direct communication that might have timeout.
For instance, driver search system in ride-hailing app like uber. User new request on a new driver not directly processed by a service, because high chance there is currently high demand, and no worker to pick up the task needed, which is "give driver". With message queue, th request will be stored in a buffer like stream, and can be consumeable when there is available resource.
Message queue not only acts as a buffer, it also ensure all event are processed with acknowledgment after an event consumed.

## Footnotes
- This is my personal diary. Not a references.
- Goals:
	- As non-native english speaker, i want to train my english with writings. I believe articulate my mind through writing can help with english skills.
	- As an engineer, i want to understand something comprehendly, and based on [A], You need to write to effectively understand anything.
	- Writing is a skill, need to train. It takes time though.
- I want to keep this out of AI generated writings. Purely from my mind. LLM will help and strictly mentioned (acknowledged)
- Not necessarily tech related stuff

