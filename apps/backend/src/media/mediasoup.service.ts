import { Injectable, OnModuleDestroy } from '@nestjs/common';
import * as mediasoup from 'mediasoup';
@Injectable()
export class MediasoupService implements OnModuleDestroy { private workers: mediasoup.types.Worker[] = []; async createWorker() { const worker = await mediasoup.createWorker({ rtcMinPort: Number(process.env.RTC_MIN_PORT ?? 40000), rtcMaxPort: Number(process.env.RTC_MAX_PORT ?? 49999) }); this.workers.push(worker); return worker; } async onModuleDestroy() { for (const worker of this.workers) worker.close(); } }
