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


# Footnotes
- This is my personal diary. Not a references.
- Goals:
	- As non-native english speaker, i want to train my english with writings. I believe articulate my mind through writing can help with english skills.
	- As an engineer, i want to understand something comprehendly, and based on [A], You need to write to effectively understand anything.
	- Writing is a skill, need to train. It takes time though.
- I want to keep this out of AI generated writings. Purely from my mind. LLM will help and strictly mentioned (acknowledged)
- Not necessarily tech related stuff

