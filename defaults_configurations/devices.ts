import prisma from "@/prisma/prisma";
import { headers } from "next/headers";
import { parse } from "next-useragent";

export async function devices(user_id: string) {
    try {
        // Fetch IP and user-agent details concurrently
        // console.time("Fetch IP and User-Agent");
        const [ipResponse, userAgent] = await Promise.all([
            fetch('https://ipapi.co/json').then(res => res.json()),
            Promise.resolve(headers().get('user-agent') || '')
        ]);
        // console.timeEnd("Fetch IP and User-Agent");

        const ua = parse(userAgent);
        const ip_address = ipResponse.ip;
        const { country_code, country_name, region, city } = ipResponse;

        const type = 'Browser';
        const platform = ua.browser;
        const os = ua.os;
        const os_version = String(ua.osVersion);

        // Fetch user and existing device data concurrently
        // console.time("Fetch User and Existing Device");
        const [user, existingDevice] = await Promise.all([
            prisma.trans_users.findUnique({
                where: { id: user_id },
                include: { acl_user_access_control: true },
            }),
            prisma.sec_devices.findFirst({
                where: {
                    ip_address,
                    acl_user_access_control: { user_id },
                },
            }),
        ]);
        // console.timeEnd("Fetch User and Existing Device");

        if (!user) {
            console.error(`User with ID ${user_id} does not exist.`);
            return; // Stop further execution if user doesn't exist
        }

        if (!existingDevice) {
            // Create a new device record
            // console.time("Create New Device");
            await prisma.sec_devices.create({
                data: {
                    ip_address,
                    created_at: new Date(),
                    updated_at: null,
                    country_code,
                    country_name,
                    region,
                    city,
                    platform_type: type,
                    platform,
                    os,
                    os_version,
                    login_count: 1,
                    acl_user_access_control_id: user.acl_user_access_control?.id!,
                },
            });
            // console.timeEnd("Create New Device");
        } else {
            // Update the existing device record
            // console.time("Update Existing Device");
            await prisma.sec_devices.update({
                where: { id: existingDevice.id },
                data: {
                    updated_at: new Date(),
                    login_count: { increment: 1 },
                },
            });
            // console.timeEnd("Update Existing Device");
        }
    } catch (error) {
        console.error("Error saving device information:", error);
    }
}
