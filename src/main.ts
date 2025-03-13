import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { envs } from './conf';

async function bootstrap() {
  const logger = new Logger('Main')

  logger.log(envs.NATS_SERVERS,'env')
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,{
      transport: Transport.NATS,
      options: {
        servers: envs.NATS_SERVERS
      }
    }
  )

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true
    })
  )
  logger.log(`Products microservice running on port: ${envs.PORT}`);

  await app.listen();
}
bootstrap();
