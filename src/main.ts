import { config } from "dotenv";

import { Client, Events, PresenceUpdateStatus, ActivityType } from "discord.js";
import { RestClient } from "@ecoflow-api/rest-client";

async function main() {
    const discord = new Client({
        intents: [],
    });

    discord.once(Events.ClientReady, () => {
        console.log("Digital Bangladesh, ready?");
    });

    await discord.login(process.env.DISCORD_ACCESS_SECRET!);

    async function schedule() {
        const ecoflow = new RestClient({
            accessKey: process.env.ECOFLOW_ACCESS_KEY!,
            secretKey: process.env.ECOFLOW_ACCESS_SECRET!,
            host: "https://api-e.ecoflow.com",
        });

        const delta2Properties = await ecoflow.getDevicePropertiesPlain(
            process.env.ECOFLOW_DELTA_2_SN! as `R331${string}`
        );

        const inputWatts = delta2Properties.data?.["pd.wattsInSum"];
        const outputWatts = delta2Properties.data?.["pd.wattsOutSum"];

        const isCharging = inputWatts > 5;
        const batteryLevel = delta2Properties.data?.["bms_bmsStatus.soc"];

        console.log({ inputWatts, outputWatts, isCharging, batteryLevel });

        await discord.user?.fetch();
        await discord.user?.setPresence({});

        if (isCharging) {
            await discord.user?.setPresence({
                status: PresenceUpdateStatus.Online,
                activities: [{ type: ActivityType.Watching, name: `the battery at ${batteryLevel}%` }],
            });
        } else {
            await discord.user?.setPresence({
                status: PresenceUpdateStatus.DoNotDisturb,
                activities: [{ type: ActivityType.Listening, name: `to crickets at ${batteryLevel}%` }],
            });
        }
    }

    await schedule();
    setInterval(schedule, 5000);
}

config();
main();
