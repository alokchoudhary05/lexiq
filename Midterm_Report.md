# LexIQ

A conversational AI platform that simplifies and interprets Indian legal frameworks through retrieval-augmented legal intelligence.

Capstone-II project report submitted by the student of  
Computer Science & Data Science

**Alok Kumar Choudhary**  
Roll No.- 2312RES77  
Group No. - 69

**INDIAN INSTITUTE OF TECHNOLOGY PATNA**  
BIHTA - 801106, INDIA

Date - 26 March 2026

---

## Declaration

I hereby declare that this submission is my own work and that, to the best of our knowledge and belief, it contains no material previously published or written by another person nor material which to a substantial extent has been accepted for the award of any other degree or diploma of the university or other institute of higher learning, except where due acknowledgement has been made in the text.

Date: 26 March 2026

Student Name - ALOK KUMAR CHOUDHARY  
Roll No - 2312RES77  
Group No - 69  
Signature - Alok Kumar Choudhary

---

## Summary of the Project

**Abstract:** Accessing and understanding legal provisions is often challenging due to the complexity and volume of legislative documents. This project introduces LexIQ, a conversational AI system intended to make Indian legal frameworks easier to understand. The system allows users to ask legal questions in natural language and receive answers based on reputable legal texts by combining Natural Language Processing and Retrieval-Augmented Generation (RAG). The platform seeks to increase the general public's, professionals', and students' access to legal information.

Legal documents have a lot of complicated language that makes it hard for people to quickly find and understand the information they need. To solve this problem, this project is making LexIQ, a smart legal question-and-answer system that lets people talk to legal frameworks.

The system is based on three important Indian laws: the Indian Penal Code, the Bharatiya Nyaya Sanhita, and the Code of Criminal Procedure. These papers are the main source of information for the platform.

To start the development process, Python-based tools are used to get text data from legal PDF files. Legal documents have complicated formatting, so the text that is taken out is processed and put into structured sections. Then, these parts are turned into semantic representations that let the system find the right legal provisions based on what the user means.

When someone asks a question, the system finds the most relevant legal sections and uses a language model to make a clear explanation that keeps the original provision's meaning. This method makes sure that answers stay based on official legal texts while making the information easier to understand.

However, during the process of development, certain challenges were posed by differences in formatting of documents and the precise identification of statutory sections within lengthy statutes.

The current implementation enables the establishment of a functional AI-based legal information retrieval system that can potentially address legal queries based on legislative sources. The future plans for improving the system are based on incorporating case law references, judicial interpretations, an agentic approach to address out-of-the-box queries, and a web interface to enable the system to grow into a legal research assistant named LexIQ.

### Project Team

- **Alok Kumar Choudhary (Me)** – AI/ML & System Architecture (RAG pipeline, AI agent integration, overall system design and data processing)
- **Anant Kumar & Aman Kumar Chaudhary** – Backend Development (API development & system)
- **Satyam Kumar Choudhary & Rishik** – Frontend Development (User interface design and web application development)

---

## Table of Content

|   | Section | Page No |
|---|---------|---------|
| 1. | Introduction | 5 |
| 2. | System Architecture Overview | 6 |
| 3. | Exploratory Data Analysis | 7 |
| 4. | Data Processing & Section-Based Chunking | 10 |
| 5. | Embedding Pipeline | 13 |
| 6. | Vector Database Architecture | 15 |
| 7. | Retrieval System – Hybrid Search | 17 |
| 8. | LLM Integration | 19 |
| 9. | Results and Evaluation | 21 |
| 10. | Future Work and Conclusion | 22 |
| 11. | References | 23 |

---

## 1. Introduction

---

The Indian criminal justice system has witnessed a recent legislative shift in its criminal justice system through the enactment of the Bharatiya Nyaya Sanhita, which replaced the existing Indian Penal Code in July 2024. Along with this, the Code of Criminal Procedure also continues to be applicable to the procedural aspects of criminal justice, thus maintaining its significance in this regard. This has resulted in a complex scenario where both the existing and newly enacted legal provisions need to be comprehended together. While newly registered crimes are being dealt with under the Bharatiya Nyaya Sanhita, various ongoing legal proceedings continue to be based on the provisions of the Indian Penal Code.

Though legal provisions are publicly available, these are not easily comprehensible by individuals who are not aware of legal matters. These provisions are generally very lengthy documents that contain extremely complex legal jargon that is not easily understandable by common citizens of the country. These documents are generally not easily comprehended by individuals who are not aware of legal matters, which is why common citizens of the country are not able to access legal provisions easily.

The conventional digital search technology offers only partial solutions for this issue. The majority of digital search engines are based on keyword matching, which is not effective in understanding the semantic meaning of natural language queries. This leads users to receive a profusion of irrelevant search results or overlook the most relevant legal provisions. The disconnect between users' information-seeking patterns and the formal articulation of legal provisions leads to a substantial disconnect between users' intentions and information retrieval.

Recent developments in Natural Language Processing offer promising directions for mitigating this issue. In particular, Retrieval-Augmented Generation leverages the integration of document retrieval and large language models for generating responses that are informed by relevant documents. Instead of relying on outdated or inaccurate information contained in language models, this model leverages relevant legal documents prior to response generation, thereby ensuring that responses are informed by relevant legal provisions.

To address the accessibility challenges of Indian legal documents, this project introduces LexIQ, an AI-powered conversational platform designed for legal question answering. The system enables users to ask legal questions in natural language and receive clear explanations supported by section-level citations from statutory documents. By combining semantic retrieval with language-model-based generation, LexIQ aims to simplify access to complex legal frameworks while maintaining the accuracy and reliability required for legal information systems.

*Page | 5*

---

## 2. System Architecture Overview

---

LexIQ's platform follows a modular approach for its **Retrieval Augmented Generation (RAG)** pipeline, which turns raw legal documents into a conversational question-answering system for legal queries. The system's architecture involves a series of steps, including query classification, hybrid document retrieval, legal priority re-ranking, and language model-based answer synthesis.

The complete architecture, from query to legal response with citation, is shown below:

```
                        Legal Query RAG System Architecture

User Query
    │
    ▼
┌─────────────────┐        ┌──────────────────────────────────────────┐
│  User Interface │        │         Query Classification Service      │
└────────┬────────┘        │                  (Router)                 │
         │ Query Text      │  ┌─────────────────────────────────────┐  │
         ▼                 │  │  Query  ──► section_lookup          │  │
┌─────────────────┐        │  │         ──► punishment_query        │  │
│   API Gateway   │──────► │  │         ──► cross_law_comparison    │  │
│ & Intake Service│Classified  │         ──► legal_explanation       │  │
└─────────────────┘ Query  │  └─────────────────────────────────────┘  │
                           └──────────────────────────────────────────┘
                                              │
              ┌───────────────────────────────┼───────────────────────┐
              ▼                               ▼                       ▼
┌─────────────────────────┐   ┌──────────────────────┐   ┌───────────────────────┐
│  Hybrid Retrieval &     │   │  Legal Code Priority  │   │   LLM Generation      │
│       Search            │   │    Re-Ranking Service │   │       Layer           │
│                         │   │                       │   │                       │
│  Vector    Hybrid       │   │  BNS ──► Priority 1   │   │  Response   Mistral-7B│
│  Database  Retriever    │   │         (active)       │   │  Generation API       │
│ (Pinecone)              │   │  CRPC ──► Priority 2  │   │  Service   (Primary   │
│                         │   │  IPC ──► Priority 3   │   │            Model)     │
│  60%       40%          │   │         (legacy)       │   │                       │
│  Semantic  Keyword      │   └──────────────────────┘   │  Anti-      Fallback  │
│  Weighting Weighting    │                               │  hallucin-  Logic     │
│                         │   Top-K Relevant Chunks       │  ation                │
│  BM25 Keyword Search    │   Re-Ranked Chunks with       │  prompts              │
│  Indexed Document       │   Priorities                  │                       │
│  Data Store             │                               │  GPT-4o-mini          │
│  (Elasticsearch)        │                               │  API (Fallback        │
│                         │                               │  Model)               │
│         Merge Scores    │                               │                       │
└─────────────────────────┘                               │  Response Formatting  │
                                                          │  & Citation Service   │
                                                          │                       │
                                                          │  Cited Legal Answer   │
                                                          │  "According to BNS    │
                                                          │   Section 103…"       │
                                                          │                       │
                                                          │  Prompt Store         │
                                                          └───────────────────────┘
```

The process begins when a user poses a natural language-based query for law. The query router then categorizes the query into one of a number of pre-defined query types. This allows the system to utilize a number of different retrieval strategies based on the type of query that was posed. A hybrid retrieval strategy utilizes both semantic similarity and keyword matching for searching the legal knowledge base.

The results that are returned from the knowledge base are then re-ranked based on a law priority mechanism that prioritizes currently enforceable law over historical law. The selected law is then passed into a language model that creates a concise natural language explanation while still maintaining a citation back to the source section of law.

*Page | 6*

---

## 3. Exploratory Data Analysis

---

Prior to the creation of LexIQ's retrieval system, an Exploratory Data Analysis (EDA) was carried out on the legal texts that comprise its knowledge base. The EDA had four main goals:

1. Elucidate on the structural format of each legislative document,
2. Examine the distribution of section lengths in order to determine optimal chunking parameters,
3. Identify any parsing difficulties contained within the raw PDF files, and
4. Confirm that the number of extracted sections corresponds with anticipated statutory structure.

The EDA focused on three main criminal law statutes in India: the Indian Penal Code (IPC), Bharatiya Nyaya Sanhita (BNS), and the Code of Criminal Procedure (CrPC). These legislative texts are collectively responsible for criminal offenses and procedures in India. The inclusion of both the original IPC and the current BNS enables historical reference and cross-law query functionality within the framework of legislative evolution.

### 3.1 Dataset Overview

The three legal documents were obtained in PDF format. These documents are the primary source for building the legal knowledge base for LexIQ. The documents have varying lengths, structural density, and legal writing styles.

| Act | File | Pages | File Size | Status | Sections Parsed |
|-----|------|-------|-----------|--------|-----------------|
| IPC | IPC_rules.pdf | 119 | 1,079 KB | Legacy | 1,427 |
| BNS | BNS_rules.pdf | 102 | 1,293 KB | Active | 350 |
| CRPC | the_code_of_criminal_procedure.pdf | 263 | 1,835 KB | Active | 507 |
| **Total** | — | **484** | **4,207 KB** | — | **2,284** |

The three documents have a total of 484 pages and 2,284 legal sections. The BNS has fewer pages compared to the CRPC. However, the density of the text is higher per section compared to the CRPC. This is because of the legislative drafting styles of the day, where definitions, explanations, and illustrations are included in one provision.

Each legal document follows a hierarchical structure based on the legal framework: **Act > Chapter > Section > Content**. This structure is preserved while building the retrieval index.

*Page | 7*

### 3.2 Section Length Statistics

An objective of Exploratory Data Analysis (EDA) was to quantify section length in terms of raw character count. Section length is directly related to the chunking strategy employed by retrieval systems. Sections that are too long need to be subdivided into smaller chunks, whereas sections that are too short do not offer sufficient contextual information for accurate retrieval.

| Act | Sections | Min Length | Max Length | Mean Length | Median Length |
|-----|----------|------------|------------|-------------|---------------|
| IPC | 1,427 | 24 chars | 8,382 chars | 350 chars | 152 chars |
| BNS | 350 | 99 chars | 14,330 chars | 1,171 chars | 705 chars |
| CRPC | 507 | 99 chars | 8,947 chars | 969 chars | 725 chars |

Significant variation was found in section length for the three acts.

**IPC Analysis:**  
The Indian Penal Code (IPC) has the highest number of sections, i.e., 1,427. However, these sections are significantly shorter compared to other acts. The median length of these sections is 152 characters. The sections of this act are very short in content but are of immense legal value.

**BNS Analysis:**  
The BNS has the highest mean length of sections among all acts under consideration. The longest section of this act is Section 2 Definitions, which comprises approximately 14,330 characters, including definitions of over forty legal terms in one section. This is a reflection of contemporary drafting style, where several explanatory clauses are combined into a single section that offers a comprehensive explanation of legal issues.

**CRPC Analysis:**  
The sections of the Code of Criminal Procedure (CRPC) fall between IPC and BNS in terms of length distribution. The median length of these sections is 725 characters. These sections are procedural in nature, outlining specific legal processes that are required during various legal procedures, including arrest procedures, trial processes, documentation requirements, etc., resulting in a uniform length distribution of these sections.

### 3.3 Parsing Challenges

During the extraction process, several structural irregularities were identified in the original PDF documents that required changes in the preprocessing stage.

The most prominent irregularity was identified in the CRPC document. The first twenty pages in the document contain a detailed Table of Contents. Within these table entries, section numbers are mentioned that correspond to the regular expression pattern for identifying legal sections. Without filtering these entries, over 1,200 false section entries were identified. Hence, a workaround was applied by skipping the first twenty pages during the parsing process.

*Page | 8*

Another irregularity identified in all three documents was the inclusion of amendment footnotes and editorial annotations in the text. The footnotes sometimes coincided with the patterns for identifying section headers. This could have resulted in the extraction of erroneous section headers. Hence, a filtering mechanism was added to eliminate these entries before the structured data set was created.

### 3.4 Sub-Chunking Estimation

Considering the fact that the optimal results are achieved for the large language model retrieval pipeline when the documents are divided into feasible text chunks, the parsed document sections were divided into chunks, with the chunks being overlapping, when the length of the parsed document sections exceeded a predetermined threshold.

The expected number of chunks was calculated before the chunking pipeline was executed using the following formula:

```
estimated_chunks(section) =
    1 + max(0, len(section) - MAX_CHUNK) // (MAX_CHUNK - OVERLAP)

where:
    MAX_CHUNK = 2000 characters
    OVERLAP   = 200 characters
```

Upon the execution of the actual chunking pipeline, the system was able to generate 2,561 chunks, which was a near-perfect fit with the expected results. This near-perfect fit was used as a form of validation for the formula used for estimation as well as the section parsing pipeline.

About 403 document sections (17.6%) exceeded the maximum length for the chunks, thereby requiring the sections to be divided into chunks. The sections that exceeded the maximum length were mostly from the BNS and CRPC documents, as they have longer explanatory sections.

### 3.5 Key EDA Findings

The results of the exploratory data analysis revealed the following salient features of the data that were instrumental in the design of the LexIQ retrieval system:

- The IPC has the maximum number of sections (1,427), but the sections are the shortest. This indicates a highly fragmented nature of the documents.
- The BNS has the densest provisions in terms of the number of sections, as it has fewer sections compared to the others but with a significant length of the text content.
- The procedural nature of the CRPC has helped in maintaining the uniformity of the length of the sections, which is helpful for the retrieval system.

*Page | 9*

- The phenomenon of sub-chunking had to be applied to 17.6% of the total sections. This has confirmed the requirement for the chunk-based approach to the retrieval system.
- The longest provision is the BNS Section 2, for which seven chunks had to be generated with overlap to accommodate the metadata for the purpose of generating the correct citation for the response.

Overall, the EDA stage provided critical insights into document structure, text distribution, and parsing challenges. These findings directly informed the chunking strategy, retrieval configuration, and indexing design used in the LexIQ Retrieval-Augmented Generation pipeline.

---

## 4. Data Processing & Section-Based Chunking

---

The data processing stage involves the conversion of legal PDF files into structured text forms that are fit for retrieval. This stage differs from other document processing stages involved in generic Retrieval-Augmented Generation (RAG) model architectures. Legal texts need to be processed differently to preserve the semantics involved. This stage faces the following key challenges:

1. parsing heterogeneous documents,
2. filtering non-section artifacts such as amendment footnotes and table of contents, and
3. segmenting long legal provisions without affecting legal reasoning.

In Traditional RAG, a simple character chunking approach is presented, where the document is segmented into chunks of a specified number of characters. In this case, a chunk size of 1000 characters is specified. This approach works for other texts, but legal texts involve a number of definitions, explanations, and examples that need to be considered as a whole. Splitting legal provisions randomly will result in an incomplete context for retrieval. For instance, a legal text may be discussing a particular offense and its definition. Splitting this text randomly will result in the definition being separated from the explanation. To improve this limitation, a new approach to chunking legal texts has been proposed. In this case, the main chunking unit will be the legal section.

### 4.1 Section Parsing Architecture

The three legislative documents included in the LexIQ corpus have unique structural forms. Therefore, the application of a general parser would not yield accurate results. To address this problem, three parsers were created, each designed to parse section headings and content according to the structural rules of each statute.

*Page | 10*

| Parser | Format Pattern | Example | Key Challenge |
|--------|---------------|---------|---------------|
| `parse_sections_ipc()` | `N. Title.—Content` | `302. Punishment for murder.—Whoever commits murder...` | Em-dash appears as mojibake (ΓÇö) in some environments |
| `parse_sections_bns()` | `N. (1) Content [marginal title]` | `4. (1) The punishments to which offenders are liable...` | No inline em-dash; section titles are marginal notes |
| `parse_sections_crpc()` | `N. Title.—Content` | `154. Information in cognizable cases.—(1) Every info...` | First 20 pages = TOC, producing 1,293 false regex matches |

A dispatcher function routes each legislative document to the corresponding parser depending on the configuration parameters set for each act. The parser structure separates the parsing rules for each statute, enabling the addition of more legislative documents in future versions with little modification.

### 4.2 Encoding and Title Extraction Challenges

Inconsistencies in character encoding were noted during development with regards to the IPC and CRPC documents. The section title is separated from the content by the Unicode character "em dash" (U+2014). However, this character may not be displayed properly in certain environments, showing the string "ΓÇö" instead, which is commonly due to the CP1252 encoding standard.

To properly parse the content, the function for extracting section titles has been written to properly recognize both the "em dash" and its equivalent string "ΓÇö." In cases where neither string is found, it will default to parsing the first line of the section as the title.

### 4.3 Amendment Footnote Filtering

Indian legal documents often include amendment notes as part of the body content. These notes refer to legislative changes and follow a standard format, as shown below:

- `"Subs. by Act 46 of 1983…"`
- `"Ins. by Act 10 of 2009…"`
- `"Rep. by Act 34 of 2019…"`

The similarity of this content to the numbered section format might cause the section detection regular expression to incorrectly identify this content as valid section headings. However, this is avoided with the addition of a validation process.

A validation process has been added that utilizes a group of regular expression filters, termed `JUNK_TITLE_PATTERNS`. Each title is validated against this group of regular expression filters before it is accepted as a valid section heading. Any titles that fail the validation process are replaced with the standard fallback term "Section N."

*Page | 11*

### 4.4 Table of Contents Filtering

One of the structural anomalies identified in the CRPC document is the presence of a complete table of contents for the first twenty pages. Each of these pages includes a numbered list of provisions, using the same numbering convention as the text. This caused the parsing algorithm to incorrectly identify these provisions as sections of the document.

The algorithm identified over 1,200 incorrect section matches. Upon reviewing the results, it became clear that the actual content of the document begins after the twentieth page. As a result, the parsing algorithm has been adjusted to skip the first twenty pages of the document before executing the section extraction algorithm. This brings the results down to 507, as would be expected for the provisions of the CRPC.

### 4.5 Section-Aware Sub-Chunking

While most statutory provisions can be retained as a single retrieval unit, certain sections exceed the context length suitable for efficient retrieval. For such cases, a controlled sub-chunking strategy is applied.

Sections exceeding 2,000 characters are divided using a recursive text-splitting algorithm that prioritizes splitting at natural linguistic boundaries such as paragraphs and sentences. An overlap of 200 characters is maintained between adjacent chunks to preserve contextual continuity across boundaries.

Importantly, every generated sub-chunk inherits the complete metadata of its parent section, including:

- Act name
- Chapter identifier
- Section number
- Section title
- Law status (active or legacy)

This metadata preservation ensures that retrieval results always include precise legal citations and that answers generated by the language model can reference the original statutory provision accurately.

### 4.6 Final Chunking Results

After parsing and chunking were completed, the resulting dataset consisted of 2,561 retrieval units derived from 2,284 statutory sections.

| Act | Sections Parsed | Chunks Produced | Sub-chunked Sections | Law Status |
|-----|----------------|-----------------|----------------------|------------|
| IPC | 1,427 | 1,493 | 66 sections | Legacy |
| BNS | 350 | 472 | 122 sections | Active |
| CRPC | 507 | 596 | 215 sections | Active |
| **Total** | **2,284** | **2,561** | **403 sections (17.6%)** | — |

*Page | 12*

The segments produced by this process demonstrate a mean segment length of approximately 556 characters and a median segment length of 344 characters. These values are well within the contextual bounds of the language models utilized by the LexIQ pipeline, which include Mistral-7B and GPT-4o mini.

In addition, heterogeneous legal PDFs are processed into a clean and structured corpus optimized for semantic retrieval. By incorporating format-aware parsing, artifact filtration, and section-aware chunking, the LexIQ pipeline ensures the logical structure of legal provisions while producing a retrieval dataset conducive to efficient indexing. The structured dataset, consisting of 2,561 chunks, serves as the foundation for the proposed hybrid retrieval model.

---

## 5. Embedding Pipeline

---

The next phase of the LexIQ process, following the parsing and segmentation of legal texts into section-based chunks, involves the conversion of these text chunks into numerical forms that are conducive to semantic retrieval. This phase, known as text embedding, maps each text chunk to a high-dimensional vector that captures its semantic meaning. These vectors are then stored within a customized vector database for similarity search.

The embedding module represents a key part of the system, as it allows LexIQ to retrieve legal provisions that are pertinent to the query despite the use of wording that differs from the legal text. An exemplary query such as "What happens if someone kills another person?" should retrieve provisions related to the punishment for murder, even if the exact wording "punishment for murder" does not appear within the query.

### 5.1 Text Embeddings and Semantic Similarity

A text embedding is a function that maps textual input to a point in a high-dimensional vector space:

```
f(text) → ℝ^d
```

where *d* represents the dimensionality of the embedding vector. In the LexIQ system, each text chunk is mapped to a 1,536-dimensional vector.

Semantic similarity between two texts is measured using cosine similarity, defined as:

*Page | 13*

```
cos(θ) = (A · B) / (||A|| × ||B||)
```

Let A and B be the embedding vectors. The range of the similarity score is from -1 to +1. As the score increases, the semantic similarity increases.

In the retrieval phase, the query is embedded with the same embedding model, and the vector database retrieves the chunks whose vectors have the highest similarity with the query vector. This semantic search capability allows the system to retrieve relevant legal content even if the wording of the query is significantly dissimilar from the legal content.

### 5.2 Embedding Model Selection

LexIQ uses the `text-embedding-3-large` model to create vector representations. The choice of the model is based on the assessment of the performance of the model in the retrieval process and cost efficiency compared to the previous embedding models.

| Feature | text-embedding-ada-002 (Prototype) | text-embedding-3-large (LexIQ v1) |
|---------|-----------------------------------|----------------------------------|
| MTEB Benchmark Score | 61.0 | 62.3 (+1.3 pts) |
| Vector Dimensions | 1,536 (fixed) | 1,536 (configurable down to 256) |
| Price per 1M tokens | $0.10 | $0.02 (5× cheaper) |
| Release Year | 2022 | 2024 |
| Legal/Retrieval Tasks | Good | Better (newer training data) |

Massive Text Embedding Benchmark (MTEB) is a commonly used assessment tool for embedding models. It includes retrieval, clustering, and classification. The improved retrieval performance is accompanied by significant cost reductions.

The improved performance is particularly significant to LexIQ since the embedding process involves the processing of 2,561 chunks of texts with the aim of rebuilding the pipeline.

### 5.3 Embedding Generation Pipeline

The embedding pipeline uses the OpenAI embedding API to convert each chunk of the processed data into a dense vector form. The system configuration used in LexIQ is as follows:

```
Embedding Model : text-embedding-3-large
Vector Dimension : 1536
```

*Page | 14*

When the pipeline is run, each chunk is sent to the embedding model, and it returns a floating-point vector with 1,536 dimensions, where each dimension represents the semantic content of the text.

In addition, in order to validate the integrity of the pipeline, the embedding of a test query is performed during system initialization, and the vector is validated to ensure that it has the correct dimensions, thus preventing any potential misconfiguration that could cause indexing problems.

---

## 6. Vector Database Architecture

---

Once generated, the embeddings must be stored in a data structure that is able to efficiently execute similarity search over the vectors. In the case of LexIQ, this is accomplished with the vector database Pinecone.

Vector databases differ fundamentally from traditional relational databases. While relational databases use SQL to search for exact matches, vector databases use ANN search to find the nearest neighbors of a given vector.

### 6.1 Pinecone Serverless Configuration

The LexIQ system utilizes the Pinecone serverless architecture, which provides vector index management without the requirement of any additional infrastructure. The index is defined with the following parameters:

| Parameter | Value |
|-----------|-------|
| Index Name | lexiq-v1-index |
| Vector Dimension | 1,536 |
| Similarity Metric | Cosine |
| Cloud Provider | AWS |
| Region | us-east-1 |

The serverless free tier allows for a maximum of 100,000 vectors. This is significantly more than the 2,561 vectors currently utilized by the system.

### 6.2 Metadata Schema

Each vector is stored with metadata that describes the original legal section from which the information is derived.

*Page | 15*

| Field | Example | Purpose |
|-------|---------|---------|
| act | BNS | Law identification and priority ranking |
| section_number | 103 | Precise legal citation |
| section_title | Punishment for murder | Display in answer output |
| chapter | Offences Against Human Body | Context grouping |
| law_status | active | Distinguish active vs legacy law |
| sub_chunk | 2/7 | Track chunk index for long sections |

This metadata schema ensures that retrieved chunks can always be traced back to their original statutory source.

### 6.3 Batched Vector Upsert Strategy

The initial experiments showed that an attempt to insert all the vectors in the database within one API call led to network timeouts due to increased processing times. To avoid such problems, the proposed embedding pipeline uses a batched upsert approach.

Documents are inserted in batches of 500, and each batch undergoes the embedding and sequential upsert operation in the vector database. This approach minimizes the chances of network interruptions and ensures smooth operation of the proposed pipeline.

The batching strategy reduced the total indexing time and eliminated SSL timeout errors observed during earlier prototype runs.

The stage of vector storage and embedding transforms the legal documents in the legal corpus and makes them semantically searchable to enable the retrieval of relevant legal provisions. The proposed stage lays the groundwork for the hybrid retrieval system of LexIQ.

The proposed index contains 2,561 semantically searchable chunks of legal documents, each of which contains comprehensive metadata.

*Page | 16*

---

## 7. Retrieval System – Hybrid Search

---

The retrieval system forms the core layer of intelligence in LexIQ's system because it controls which provisions are used to feed the language model in generating answers. Since the quality of answers generated is completely dependent on the relevance of the information retrieved, this system plays a crucial role in ensuring accuracy in terms of facts and law.

Legal information retrieval is a unique problem because some queries require understanding the semantics of law, whereas others require matching keywords to sections of law. For example, in answering a query such as "What is Section 302 of IPC?" there is a need to match keywords, whereas in answering a query such as "What happens if someone kills another person?" there is a need to understand the concept of murder even in the absence of keywords. For this reason, a hybrid model is used in LexIQ's system.

The semantic retrieval process is carried out on the vector database maintained in Pinecone, where each chunk of the legal sections is embedded as a high-dimensional vector. For the query, the user query is embedded using the same embedding model, and the most semantically similar chunks are retrieved based on the cosine similarity of the vectors. This allows the system to retrieve the legally relevant sections even when the query is paraphrased or uses conceptual language rather than the literal statutory language.

However, the semantic retriever is not sufficient for the task of legal research as it may not rank the exact statutory language or identifiers such as section numbers. To overcome this limitation of the semantic retriever, the system is designed with an additional layer of keyword retrieval based on the BM25 ranking algorithm. BM25 is a probabilistic information-retrieval algorithm that ranks the documents based on the term frequency, inverse document frequency, and document length normalization. The algorithm is found to be particularly effective in the LexIQ corpus for retrieving the results based on the query for the section numbers, as the identifiers such as the word "302" appear in only a few sections of the document and thus have a high inverse document frequency score.

The output of the semantic retriever and the BM25 retriever is combined using the ensemble retriever provided by the LangChain library. The weightage of the output of the semantic retriever is set to 60%, and the weightage of the output of the BM25 retriever is set to 40%, as most user queries are natural language based while still requiring an accurate mapping of the query with the legal language and terminology. The ranking of the output is computed using the reciprocal rank fusion method.

*Page | 17*

Before this, the query routing process, which involves a lightweight classification mechanism to identify the class of the legal query posed, is performed. The query posed by the end-user falls under four main categories. These are section lookup, cross-law comparison, punishment-related queries, and general legal explanation queries. Section lookup queries are given a higher weight if an exact match with a section exists. Cross-law comparison queries ensure that results from multiple laws are included to provide context to the language model for a meaningful comparison to be provided to the end-user.

Next, the result set goes through a law priority re-ranking process. In the recent legal regime change in India from the Indian Penal Code to the Bharatiya Nyaya Sanhita, it is imperative that recent laws are provided a higher priority over older laws when both are retrieved. Therefore, this process involves providing a higher priority to Bharatiya Nyaya Sanhita sections, followed by sections under the Code of Criminal Procedure, and finally sections under the Indian Penal Code.

Another important process that forms part of this query retrieval pipeline involves the removal of duplicate results. Since the semantic and keyword query retrievers are independent, there are chances that duplicate results might be included in the result set. These duplicate results will result in an infringement on the contextual space within the language model's prompt window. Therefore, a composite key for each result set retrieved is created based on the metadata associated with the result set. The duplicate results are removed before proceeding to the ranking process.

The overall query retrieval process for this hybrid model can be represented as follows.

| Stage | Function |
|-------|----------|
| Query Routing | Classifies query type (lookup, comparison, explanation) |
| Hybrid Retrieval | Combines semantic search and BM25 keyword search |
| Deduplication | Removes repeated document chunks |
| Law Priority Re-ranking | Ensures modern law appears before legacy statutes |
| Top-K Selection | Returns final documents for LLM context |

This multi-stage process ensures that the language model receives a carefully selected list of relevant and context-specific statutory provisions that are pertinent to the law. The hybrid search architecture with the inclusion of semantic similarity, keyword precision, and law-aware ranking improves the reliability of question answering in law.

*Page | 18*

---

## 8. LLM Integration

---

The LLM integration layer essentially facilitates the conversion of the retrieved legal documents in an organized, human-understandable form. After the relevant legal sections are identified by the hybrid retrieval system, they are fed into the language model as contextual evidence. The language model combines the information to form an understandable explanation, without compromising the accuracy of the legal citations.

The structure of the LLM integration layer focuses on three key goals: cost efficiency, hallucination avoidance, and the maintenance of conversational flow. As the factual reliability of the model is high in legal scenarios, it is restricted to only generate answers based on the retrieved statutory context.

### 8.1 Two-Tier Model Strategy

The architectural design of LexIQ utilizes a two-tier model to ensure the optimal cost for response quality. To begin with, the system attempts to use the open-source model known as Mistral-7B-Instruct-v0.3. This model has excellent reasoning capabilities and can be accessed for free through the Hugging Face Inference API.

In case the Hugging Face model fails to produce an optimal response or if the service itself is not available, the system will automatically switch to the GPT-4o-mini model provided by OpenAI. Although this model has a token-based pricing model, its reasoning capabilities are superior, thus ensuring optimal response generation.

This fallback mechanism ensures that LexIQ remains operational even when external inference services encounter errors or rate limits.

### 8.2 Anti-Hallucination Prompt Design

Another important part of the LLM integration layer is the system prompt, which strictly controls the language model's behavior. The system prompt enforces a context-grounded answering policy, which allows the language model to use only the legal provisions retrieved by the retrieval system.

The system prompt includes a number of restrictions intended to limit the language model from providing hallucinated legal information. First, the language model is prompted to produce answers based on the context provided, thus avoiding legal claims not supported by legal provisions. Second, the language model is prompted to include a reference to the legal provision used to produce the answer, such as "According to BNS Section 103…," which allows users to check the legal source themselves.

*Page | 19*

In addition, for comparing questions that involve two or more legal acts, the language model's response format is mandated by the system prompt to include a separate explanation for each legal act before providing the differences. When the legal documents retrieved by the retrieval system are insufficient to produce an answer to the legal question posed to the system, the language model's response should include a statement that the legal documents retrieved are insufficient and that a legal professional should be consulted.

### 8.3 Retrieval-Augmented Generation Pipeline

The answer generation process follows the structure of the retrieval-augmented generation (RAG) framework, where the retrieved legal sections are appended to the model's prompt in the form of contextual information. The system's implementation uses the LangChain orchestration framework to combine the hybrid retriever and the language model based on the structure of a prompt template.

In the system's structure, the retrieved document sections are combined and embedded in the system's prompt as contextual information. The combined contextual information and the user's query are then embedded in the system's prompt, enabling the system to generate an answer that references the provided legal sections.

The system's structure ensures that the answer generation process is fully traceable to the retrieved documents and eliminates the need to train a specialized legal language model.

### 8.4 Conversation Memory

To support multi-turn conversations, LexIQ maintains the history of conversations for each user session. In fact, legal inquiries often follow a sequence of questions where the next question relies on the response to the previous question. For example, after asking about a certain section, the user might ask another question like "What are the related sections?" without repeating the topic.

For the system to handle such cases, the system makes use of a history-based retrieval approach. Before the retrieval process, the system automatically generates an independent query from the follow-up question based on the previous conversational history. This automatically generated query is then passed to the hybrid retriever, allowing the system to identify relevant sections even when the user poses an incomplete question.

This capability allows LexIQ to behave more like an interactive legal research assistant rather than a simple single-query search engine.

### 8.5 Summarization Mode

Apart from the query-answering mechanism, the LexIQ system also has an incorporated summarization feature, particularly for broad legal topics. For instance, the query "Summarise offences against property" may require the consideration of various statutory provisions that may not fit within the query window of the language model.

*Page | 20*

To overcome the aforementioned limitation of the language model, the LexIQ system has incorporated the map-reduce summarization framework. The mapping process involves the individual summarization of the retrieved legal fragments using the language model. The individual summaries are then combined in the reduction process to obtain the overall synopsis of the query topic. The overall process helps in overcoming the query overflow problem while retaining the vital legal information contained in the individual retrieved legal fragments.

The integration layer of the large language model transforms the retrieved legal provisions into structured and cited format, as is typical in the query-answering process in law. The synergy of the cost-effective two-tiered model strategy, strict query constraints, and the integration of the retrieval and generation process ensures that the overall query-answering process is based on the relevant legal provisions.

The integration of the conversation memory with the map-reduce summarization process further enhances the usability of the overall LexIQ system, enabling the overall query-answering process in law as a contextual research assistant.

---

## 9. Results and Evaluation

---

A preliminary assessment of the LexIQ retrieval system was carried out to assess the efficacy of the system's hybrid search model in retrieving pertinent legal provisions. The efficacy of the system can be determined based on the retrieval stage, as this is arguably the most critical prerequisite for an effective retrieval-augmented generation system.

A test set of 30 legal queries was constructed to represent typical use cases for the system. The test queries were grouped into four categories: section lookups, punishment-related queries, general legal explanations, and cross-law comparisons. These categories represent the primary types of user interactions that are expected from users of the system.

The efficacy of the system was quantified by using the metric Retrieval Accuracy @k (hit @k), which refers to whether the expected legal section is present in the top 'k' retrieved results. This is a common metric in information retrieval, where the objective is to determine whether the correct document is retrieved within the context window provided by the language model.

The results of the preliminary assessment are as follows:

| Metric | Score |
|--------|-------|
| Retrieval Accuracy @3 (hit@3) | 73.3% |
| Retrieval Accuracy @6 (hit@6) | 83.3% |

*Page | 21*

Retrieval Accuracy @6 is considered the primary metric for LexIQ because the system provides up to six retrieved documents as context for the language model during answer generation. The lower score at @3 does not necessarily indicate a performance issue, as the system intentionally prioritizes modern legal provisions from the Bharatiya Nyaya Sanhita (BNS) before legacy provisions from the Indian Penal Code (IPC). As a result, older IPC sections may appear slightly lower in the ranking even when they are correctly retrieved.

Preliminary results denote that the proposed hybrid architecture for the LexIQ system has successfully managed to retrieve relevant legal provisions for the majority of the test queries. In the final project report, a detailed evaluation will be conducted with respect to an expanded list of queries.

---

## 10. Future Work and Conclusion

---

### 10.1 Future Work

LexIQ's Mid-term Target: a functional retrieval-augmented generation (RAG) pipeline to retrieve legal provisions and provide cited answers. The current model includes a set of enhancements such as semantic search, hybrid retrieval, and structured prompting. The enhancements planned for the final phase will be an improvement on these.

**Planned Enhancements**

- **Advanced Evaluation:** Integrate LLM-as-judge metrics for faithfulness, completeness, and accuracy of citations along with accuracy for retrieval.
- **Advanced RAG Architectures:** Evaluate page-level indexing, reasoning-based RAG, and vector-less retrieval for higher accuracy and reduced use of heavy vectors.
- **AI Agent Integration:** Integrate an agent-based search that retrieves information from reliable online sources if the corpus does not contain the required information.
- **User Interface:** Develop a web-based conversational interface (e.g., Streamlit or FastAPI backend) for non-technical users.
- **Model Optimization:** Fix HuggingFace integration for the Mistral-7B-Instruct-v0.3 model to allow a free primary LLM route and reduce dependence on paid APIs.
- **Production Deployment:** Deploy on a scalable cloud with high-quality APIs, logging, and monitoring.

*Page | 22*

### 10.2 Conclusion

This mid-term system demonstrates that a retrieval-augmented generation (RAG) strategy can be an effective solution to support legal information retrieval and explanation in Indian law. The system integrates document preprocessing, semantic embeddings, hybrid search, and language model generation in a single system to generate structured answers with verifiable citations.

The system now includes coverage of key criminal law documents with 83.3% top-6 retrieval accuracy. Hybrid search and law-priority re-ranking ensure accurate identification of relevant provisions. The system also minimizes hallucinations using law-priority re-ranking.

Overall, the current system provides a solid technical basis for a final system. Planned extensions to RAG models, agent-based search, broader coverage of Indian law, and a user-friendly interface will enable LexIQ to grow towards a practical solution for Indian law information access.

---

## 11. References

---

[1] Ministry of Law and Justice, Government of India. (2023). *Bharatiya Nyaya Sanhita, 2023.* Gazette of India Extraordinary, Part II, Section 1. New Delhi: Government of India Press.

[2] Ministry of Law and Justice, Government of India. (1860). *Indian Penal Code, 1860.* Central Act No. 45 of 1860. New Delhi: Government of India Press.

[3] Ministry of Law and Justice, Government of India. (1974). *Code of Criminal Procedure, 1973.* Central Act No. 2 of 1974. New Delhi: Government of India Press.

[4] P. Lewis, E. Perez, A. Piktus, F. Petroni, V. Karpukhin, N. Goyal, et al. (2020). Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks. *Advances in Neural Information Processing Systems (NeurIPS)*, 33, 9459–9474.

[5] S. Robertson and H. Zaragoza. (2009). The Probabilistic Relevance Framework: BM25 and Beyond. *Foundations and Trends in Information Retrieval*, 3(4), 333–389.

[6] OpenAI. (2024). Text Embedding Models — text-embedding-3-large. *OpenAI Platform Documentation.* Available: https://platform.openai.com/docs/guides/embeddings

[7] Pinecone Systems Inc. (2024). *Pinecone Serverless Vector Database Documentation.* Available: https://docs.pinecone.io

[8] LangChain. (2024). *LangChain Documentation: Retrieval and RAG Pipelines.* Available: https://python.langchain.com/docs/modules/data_connection

*Page | 23*

[9] N. Muennighoff, N. Tazi, L. Magne, and N. Reimers. (2023). MTEB: Massive Text Embedding Benchmark. *Proceedings of the 17th Conference of the European Chapter of the Association for Computational Linguistics (EACL)*, pp. 2014–2037.

[10] Hugging Face Inc. (2024). *Mistral-7B-Instruct-v0.3 Model Card.* Hugging Face Model Hub. Available: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3

[11] T. Brown et al. (2020). Language Models are Few-Shot Learners. *Advances in Neural Information Processing Systems (NeurIPS).*

[12] J. Gao, X. Ma, X. Lin, et al. (2023). Retrieval-Augmented Generation for Large Language Models: A Survey. *arXiv preprint arXiv:2312.10997.*

---

*Page | 24*
