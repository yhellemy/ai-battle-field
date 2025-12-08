import { convertToModelMessages, createUIMessageStream, createUIMessageStreamResponse, stepCountIs, streamText, tool, smoothStream } from 'ai'
import type { UIMessage } from 'ai'
import { z } from 'zod'

defineRouteMeta({
  openAPI: {
    description: 'Chat with AI.',
    tags: ['ai']
  }
})

export default defineEventHandler(async (event) => {
  const { model, messages } = await readValidatedBody(event, z.object({
    modelProvider: z.string(),
    messages: z.array(z.custom<UIMessage>())
  }).parse)

  const llm = getModel(model)

  const embed = useEmbedding()

  let sources: {
    id: string
    delta: string
  }[] = []

  const last = messages.at(-1)?.parts[0]

  if (last?.type === 'text') {
    last.text.endsWith('?')
  }

  const stream = createUIMessageStream({
    execute: ({ writer }) => {
      const result = streamText({
        model: ollama(model),
        system: '',
        messages: convertToModelMessages(messages),
        experimental_transform: smoothStream({ chunking: 'word' }),
        stopWhen: [
          stepCountIs(5)
        ],
        toolChoice: last?.type === 'text'
          ? last.text.includes('?')
            ? 'required'
            : 'auto'
          : 'auto'
      })

      for (let i = 0; i < sources.length; i++) {
        const element = sources[i]
        writer.write({
          type: 'text-delta',
          ...element
        })
      }

      writer.merge(result.toUIMessageStream())
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onFinish: async ({ messages }) => {}
  })

  return createUIMessageStreamResponse({
    stream
  })
})
