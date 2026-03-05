import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";

// This is a placeholder for when you connect a real backend.
// For now, we'll use the CopilotKit cloud endpoint via the <CopilotKit> provider's
// `publicApiKey` prop, which doesn't need a backend route.
//
// When you're ready for Phase 2 (LangGraph agent), you'll set up a proper
// backend runtime. This file is here as a reference for that future step.

export default async function handler(req, res) {
  const runtime = new CopilotRuntime();
  const adapter = new OpenAIAdapter({
    model: "gpt-4o",
  });

  return copilotRuntimeNextJSAppRouterEndpoint(req, res, runtime, adapter);
}
