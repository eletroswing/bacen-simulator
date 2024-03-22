import mqtt from "mqtt";
import 'dotenv/config';

import logger from '@repo/infra/logger';

const client: mqtt.MqttClient = mqtt.connect(process.env.MQTT_CONNECTION_STRING as string);

client.on('message', (topic, message) => {
    console.log(`Mensagem recebida no tópico ${topic}: ${message}`);

    const replyTopic = topic + '/resposta'; // Tópico para responder
    const replyMessage = 'Mensagem recebida com sucesso!';
    client.publish(replyTopic, replyMessage);
});

client.on('connect', () => {
    logger.log("SPI: Success on connect to broker.");
    client.subscribe('#', (err: unknown | null) => {
        if (err) {
            logger.error(`Error subscribing all the topics in mosquitto: ${err}`);
            return
        } 

        logger.log("SPI: Successfully subscribed to all the topics on mosquitto")
    });
});

client.on('error', (err: Error) => {
    logger.error('Erro no cliente MQTT:', err);
});