import prisma from "@/prisma/prisma";
import {headers} from "next/headers";
import {parse} from "next-useragent";
export async function devices(user_id: string) {
    try {
        // Ensure user exists
        const user = await prisma.trans_users.findUnique({
            where: { id: user_id },
            include: {
                acl_user_access_control: true
            }
        });

        if (!user) {
            console.error(`User with ID ${user_id} does not exist.`);
            return; // Stop further execution if user doesn't exist
        }

// Fetch IP and user-agent details concurrently
        const [ipResponse, userAgent] = await Promise.all([
            fetch('https://ipapi.co/json').then(res => res.json()),
            Promise.resolve(headers().get('user-agent') || '')
        ]);

        const ua = parse(userAgent);
        const ip_address = ipResponse.ip;
        const created_at = new Date();
        const { country_code, country_name, region, city } = ipResponse;
        const type = 'Browser';
        const platform = ua.browser;
        const os = ua.os;
        const os_version = String(ua.osVersion);

// Check if a record exists for this user and device
        const existingDevice = await prisma.acl_user_access_control.findFirst({
            where: {
                user_id,
                sec_devices: {
                    some: {
                        ip_address,
                    },
                }
            },
            include: {
                sec_devices: true // Include sec_devices to access the id
            }
        });

        if (!existingDevice) {
            // If no record exists, create a new one
            await prisma.sec_devices.create({
                data: {
                    ip_address,
                    created_at,
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
        } else {
            const device = existingDevice.sec_devices.find(device => device.ip_address === ip_address);

            if (device) {
                // Update the login count and the updated_at timestamp
                await prisma.sec_devices.update({
                    where: { id: device.id }, // Ensure you are using the correct id
                    data: {
                        updated_at: new Date(),
                        login_count: {
                            increment: 1,
                        },
                    },
                });
            } else {
                console.error(`Device with IP ${ip_address} not found for user ${user_id}.`);
            }
        }


    } catch (error) {
        console.error("Error saving device information:", error);
    }
}
