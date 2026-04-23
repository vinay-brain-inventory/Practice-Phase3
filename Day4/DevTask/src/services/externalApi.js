async function fetchExternal(url, timeoutMs) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, { signal: controller.signal })
    const contentType = response.headers.get('content-type') || ''
    const body = contentType.includes('application/json')
      ? await response.json()
      : await response.text()

    return { status: response.status, body }
  } finally {
    clearTimeout(timeout)
  }
}

module.exports = { fetchExternal }

