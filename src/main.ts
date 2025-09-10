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

    const ecoflow = new RestClient({
        accessKey: process.env.ECOFLOW_ACCESS_KEY!,
        secretKey: process.env.ECOFLOW_ACCESS_SECRET!,
        host: "https://api-e.ecoflow.com",
    });

    setInterval(async () => {
        const delta2Properties = await ecoflow.getDevicePropertiesPlain(
            process.env.ECOFLOW_DELTA_2_SN! as `R331${string}`
        );

        const inputWatts = delta2Properties.data?.["pd.wattsInSum"];
        const outputWatts = delta2Properties.data?.["pd.wattsOutSum"];
        const isCharging = delta2Properties.data?.["bms_emsStatus.chgState"];
        const batteryLevel = delta2Properties.data?.["bms_bmsStatus.soc"];

        if (isCharging) {
            await discord.user?.setPresence({
                status: PresenceUpdateStatus.Online,
                activities: [{ type: ActivityType.Watching, name: `the battery at ${batteryLevel}%` }],
            });
        } else {
            await discord.user?.setPresence({
                status: PresenceUpdateStatus.DoNotDisturb,
                activities: [{ type: ActivityType.Listening, name: "to crickets..." }],
            });
        }
    }, 1000);
}

config();
main();
