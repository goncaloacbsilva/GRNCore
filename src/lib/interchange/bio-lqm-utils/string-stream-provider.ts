import type { StreamProvider } from 'biolqm-io-ts'

export class StringStreamProvider implements StreamProvider {
    private buffer: Uint8Array[] = []
    private closed = false

    async output(pattern?: string): Promise<WritableStream<Uint8Array>> {
        void pattern
        this.buffer = []
        this.closed = false

        return new Promise((resolve) =>
            resolve(
                new WritableStream({
                    write: (chunk) => {
                        if (this.closed) {
                            throw new Error('Stream is closed')
                        }
                        this.buffer.push(chunk)
                    },
                    close: () => {
                        this.closed = true
                    },
                })
            )
        )
    }

    async input(pattern?: string): Promise<ReadableStream<Uint8Array>> {
        void pattern
        const buffer = this.buffer
        let index = 0

        return new Promise((resolve) =>
            resolve(
                new ReadableStream({
                    start: (controller) => {
                        if (buffer.length === 0) {
                            controller.close()
                            return
                        }

                        const chunk = buffer[index++]
                        controller.enqueue(chunk)

                        if (index >= buffer.length) {
                            controller.close()
                        }
                    },
                    pull: (controller) => {
                        if (index < buffer.length) {
                            const chunk = buffer[index++]
                            controller.enqueue(chunk)

                            if (index >= buffer.length) {
                                controller.close()
                            }
                        }
                    },
                })
            )
        )
    }

    getPath(pattern?: string): string {
        return pattern ?? 'memory://stream'
    }

    getString(): string {
        const totalLength = this.buffer.reduce(
            (sum, chunk) => sum + chunk.length,
            0
        )
        const combined = new Uint8Array(totalLength)

        let offset = 0
        for (const chunk of this.buffer) {
            combined.set(chunk, offset)
            offset += chunk.length
        }

        return new TextDecoder().decode(combined)
    }

    setString(content: string): void {
        const encoded = new TextEncoder().encode(content)
        this.buffer = [encoded]
        this.closed = false
    }
}
