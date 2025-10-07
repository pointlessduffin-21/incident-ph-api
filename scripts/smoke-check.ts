import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';

async function main() {
  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn'] });

  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.setGlobalPrefix('api');

  try {
    const server = await app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      throw new Error('Unexpected server address information');
    }
    const baseUrl = `http://127.0.0.1:${address.port}/api`;

    const fetchJson = async (path: string) => {
      const response = await fetch(`${baseUrl}${path}`);
      const bodyText = await response.text();
      try {
        return { status: response.status, body: JSON.parse(bodyText) };
      } catch (error) {
        return { status: response.status, body: bodyText };
      }
    };

    const mmda = await fetchJson('/mmda/traffic');
    const pagasa = await fetchJson('/pagasa/forecast');
    const phivolcs = await fetchJson('/phivolcs/latest-earthquake');

    const summary = {
      mmda: {
        status: mmda.status,
        alerts: Array.isArray(mmda.body?.alerts) ? mmda.body.alerts.length : undefined,
        sample: Array.isArray(mmda.body?.alerts) ? mmda.body.alerts[0] : mmda.body,
      },
      pagasa: {
        status: pagasa.status,
        regions: Array.isArray(pagasa.body?.regionSummaries)
          ? pagasa.body.regionSummaries.length
          : undefined,
        sample: Array.isArray(pagasa.body?.regionSummaries)
          ? pagasa.body.regionSummaries[0]
          : pagasa.body,
      },
      phivolcs: {
        status: phivolcs.status,
        event: phivolcs.body,
      },
    };

    console.log(JSON.stringify(summary, null, 2));
  } finally {
    await app.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
