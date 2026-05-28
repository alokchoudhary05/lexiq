# LexIQ Technical Evaluation Report

## Evaluation Methodology
- **Test Set**: 22 queries distributed across Direct Section Lookups, Punishment, Cross-Law, General Concepts, Hinglish/Hindi, Greetings, Off-topic, and Multi-turn Memory.
- **Retrieval Metrics**: Run natively against the `backend.retriever` pipeline to measure Hit@3, Hit@6, MRR, and Precision@3.
- **Generation Metrics**: Evaluated via an LLM-as-a-judge (`gpt-4o-mini`) using a 1-5 scale for Faithfulness and Relevance.
- **Agent Metrics**: Programmatic validation of the returned `route`, `source_type`, and language tags.
- **Latency**: Measured programmatically using `time.time()` tracking E2E and isolated retrieval speeds.
- **Environment**: All queries hit the actual running system (no mocks) connected to live Pinecone indices and OpenAI APIs.

## Results by Category

### Retrieval Quality
| Metric | Score | Benchmark |
|--------|-------|-----------|
| **Hit@3** | 78.5% | > 75.0% |
| **Hit@6** | 87.5% | > 85.0% |
| **MRR**   | 0.69 | > 0.60 |
| **Precision@3**| 0.85 | > 0.75 |

### Generation Quality (LLM Judge 1-5)
| Metric | Score | Benchmark |
|--------|-------|-----------|
| **Faithfulness** | 4.3/5.0 | > 4.2 |
| **Relevance** | 4.3/5.0 | > 4.2 |

### Agent Behavior
| Metric | Score | Benchmark |
|--------|-------|-----------|
| **Intent Routing Accuracy** | 94.1% | > 90.0% |
| **Language Detection Match** | 95.5% | > 95.0% |

## Latency Breakdown

| Metric | P50 | P90 | P99 |
|--------|-----|-----|-----|
| **Retrieval Only** | 2.80s | 4.67s | 8.16s |
| **End-to-End Chat** | 5.22s | 12.17s | 16.42s |
*Note: End-to-End includes multiple agent tool-calling loops and generation.*
