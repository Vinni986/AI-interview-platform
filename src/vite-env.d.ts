/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ELEVENLABS_AGENT_ID: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_TEST_MODE_ENABLED: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}