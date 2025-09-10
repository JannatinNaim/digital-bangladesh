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

    // await ecoflow.getMqttCredentials();

    // return;

    setInterval(async () => {
        const delta2Properties = await ecoflow.getDevicePropertiesPlain(
            process.env.ECOFLOW_DELTA_2_SN! as `R331${string}`
        );

        const inputWatts = delta2Properties.data?.["pd.wattsInSum"];
        const outputWatts = delta2Properties.data?.["pd.wattsOutSum"];
        // const isGridOnline = delta2Properties.data?.["bms_emsStatus.chgState"];
        const isCharging = inputWatts > 200;
        const batteryLevel = delta2Properties.data?.["bms_bmsStatus.soc"];
        console.log({
            inputWatts,
            outputWatts,
            // isGridOnline,
            isCharging,
            batteryLevel,
        });

        await discord.user?.fetch();
        await discord.user?.setPresence({});

        if (isCharging) {
            await discord.user?.setPresence({
                status: PresenceUpdateStatus.Online,
                activities: [{ type: ActivityType.Watching, name: `the battery at ${batteryLevel}%` }],
            });
        } else {
            // if (isGridOnline) {
            if (true) {
                await discord.user?.setPresence({
                    status: PresenceUpdateStatus.DoNotDisturb,
                    activities: [{ type: ActivityType.Listening, name: `to crickets at ${batteryLevel}%` }],
                });
            } else {
                // await discord.user?.setPresence({
                //     status: PresenceUpdateStatus.Idle,
                //     activities: [
                //         { type: ActivityType.Competing, name: `with Nigerians for lowest voltage electricity` },
                //     ],
                // });
            }
        }
    }, 5000);
}

config();
main();
