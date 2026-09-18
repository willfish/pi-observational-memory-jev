declare module "@earendil-works/pi-coding-agent" {
	export type ExtensionAPI = {
		on(event: string, handler: (...args: never[]) => unknown): void;
		registerCommand(
			name: string,
			spec: {
				description: string;
				handler: (args: string, ctx: unknown) => unknown;
			},
		): void;
		appendEntry(type: string, data: unknown): void;
		sendMessage(message: unknown, options?: unknown): void;
	};
}
