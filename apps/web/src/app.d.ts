// Cloudflare bindings (`Env`) are generated into worker-configuration.d.ts by `wrangler types`.
declare global {
	namespace App {
		interface Platform {
			env: Env;
			ctx: ExecutionContext;
			caches: CacheStorage;
			cf?: IncomingRequestCfProperties;
		}
	}
}

export {};
