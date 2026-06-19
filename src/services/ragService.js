const crypto = require("crypto");

const documents = [];
const CHUNK_SIZE = 800;
const CHUNK_OVERLAP = 100;

function splitIntoChunks(text) {
  const cleanText = text.replace(/\s+/g, " ").trim();
  const chunks = [];

  let start = 0;
  while (start < cleanText.length) {
    const end = Math.min(start + CHUNK_SIZE, cleanText.length);
    const chunkText = cleanText.slice(start, end).trim();
    if (chunkText) {
      chunks.push(chunkText);
    }
    if (end === cleanText.length) break;
    start = end - CHUNK_OVERLAP;
  }

  return chunks;
}

function textToVector(text) {
  const words = text
    .toLowerCase()
    .replace(/[^a-zа-яё0-9\s]/gi, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const vector = {};
  for (const word of words) {
    vector[word] = (vector[word] || 0) + 1;
  }
  return vector;
}

function cosineSimilarity(vecA, vecB) {
  const keys = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);

  let dot = 0;
  let lenA = 0;
  let lenB = 0;

  for (const key of keys) {
    const a = vecA[key] || 0;
    const b = vecB[key] || 0;
    dot += a * b;
    lenA += a * a;
    lenB += b * b;
  }

  if (lenA === 0 || lenB === 0) return 0;
  return dot / (Math.sqrt(lenA) * Math.sqrt(lenB));
}

class RagService {
  addDocument(user_id, fileName, fullText) {
    const chunksText = splitIntoChunks(fullText);

    const chunks = chunksText.map((text, index) => ({
      id: crypto.randomUUID(),
      index,
      text,
      vector: textToVector(text),
    }));

    const doc = {
      id: crypto.randomUUID(),
      user_id,
      fileName,
      uploadedAt: new Date(),
      chunks,
    };

    documents.push(doc);

    return { id: doc.id, fileName: doc.fileName, chunksCount: chunks.length };
  }

  listDocuments(user_id) {
    return documents
      .filter((doc) => doc.user_id === user_id)
      .map((doc) => ({
        id: doc.id,
        fileName: doc.fileName,
        uploadedAt: doc.uploadedAt,
        chunksCount: doc.chunks.length,
      }));
  }

  search(user_id, query, topK = 3) {
    const queryVector = textToVector(query);

    const allChunks = [];
    for (const doc of documents) {
      if (doc.user_id !== user_id) continue;
      for (const chunk of doc.chunks) {
        const score = cosineSimilarity(queryVector, chunk.vector);
        if (score > 0) {
          allChunks.push({
            score,
            text: chunk.text,
            fileName: doc.fileName,
            documentId: doc.id,
            chunkIndex: chunk.index,
          });
        }
      }
    }

    allChunks.sort((a, b) => b.score - a.score);

    return allChunks.slice(0, topK);
  }
}

module.exports = new RagService();
