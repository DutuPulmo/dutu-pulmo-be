import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';

@Injectable()
export class WakeupSchedulerService {
  private readonly logger = new Logger(WakeupSchedulerService.name);

  /**
   * Pings the WEBHOOK_WAKEUP URL to keep the webhook/server awake.
   * Runs every 10 minutes.
   */
  @Cron('*/10 * * * *', {
    name: 'webhook-wakeup',
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async wakeup() {
    const webhookUrl = process.env.WEBHOOK_WAKEUP;

    if (!webhookUrl) {
      this.logger.debug(
        'WEBHOOK_WAKEUP environment variable is not defined. Skipping wakeup ping.',
      );
      return;
    }

    try {
      this.logger.log(`Pinging wakeup webhook: ${webhookUrl}`);
      const response = await axios.get(webhookUrl);
      this.logger.log(
        `✅ Wakeup response status: ${response.status} - Data: ${JSON.stringify(response.data)}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Error pinging wakeup webhook: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
