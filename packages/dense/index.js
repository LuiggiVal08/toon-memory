import { pipeline } from "@huggingface/transformers"

const DEFAULT_MODEL = "multilingual-e5-small"
const extractors = new Map()

function resolveModel(model) {
  return model.includes("/") ? model : `Xenova/${model}`
}

export async function embed(texts, model = DEFAULT_MODEL) {
  const input = Array.isArray(texts) ? texts : [texts]
  if (input.length === 0) return []

  const resolved = resolveModel(model || DEFAULT_MODEL)
  let extractor = extractors.get(resolved)
  if (!extractor) {
    extractor = await pipeline("feature-extraction", resolved, { dtype: "q8" })
    extractors.set(resolved, extractor)
  }

  const output = await extractor(input, { pooling: "mean", normalize: true })
  const dim = output.dims.at(-1)
  if (!dim || output.data.length < input.length * dim) return []

  const vectors = []
  for (let i = 0; i < input.length; i++) {
    vectors.push(Array.from(output.data.slice(i * dim, (i + 1) * dim)))
  }
  return vectors
}

export default { embed }
