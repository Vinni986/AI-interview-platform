const config = {
  elevenLabs: {
    agentId: import.meta.env.VITE_ELEVENLABS_AGENT_ID || '',
  },
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || '',
  },
  features: {
    testModeEnabled: import.meta.env.VITE_TEST_MODE_ENABLED === 'true',
  },
};

// Validation - warns if variables are missing
if (!config.api.baseUrl) {
  console.warn('⚠️ VITE_API_BASE_URL not set in .env');
}

if (!config.elevenLabs.agentId) {
  console.warn('⚠️ VITE_ELEVENLABS_AGENT_ID not set in .env');
}

export default config;